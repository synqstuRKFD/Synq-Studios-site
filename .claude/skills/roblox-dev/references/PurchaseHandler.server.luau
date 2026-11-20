--[[
	PurchaseHandler (ServerScriptService) — developer products + gamepasses, validated on the server.

	Developer products: ProcessReceipt is idempotent. The grant and the receipt's PurchaseId are
	written in the SAME profile save, and PurchaseGranted is returned only after that save succeeds.
	If anything fails, NotProcessedYet tells Roblox to retry later (e.g. on the player's next join).

	Gamepasses: ownership is checked server-side with UserOwnsGamePassAsync (cached per session),
	and refreshed when PromptGamePassPurchaseFinished reports a purchase.
]]

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")

local PlayerData = require(ServerStorage.Modules.PlayerData)

-- Replace with your real IDs (Creator Dashboard). Keep prices/IDs server-side.
local PRODUCTS = {
	[0000001] = function(data) -- REPLACE with real product ID: 100 Coins
		data.Coins += 100
	end,
	[0000002] = function(data) -- REPLACE with real product ID: 1,000 Coins
		data.Coins += 1000
	end,
}

local GAMEPASSES = {
	VIP = 0000003, -- REPLACE with real gamepass ID
	DoubleCoins = 0000004, -- REPLACE with real gamepass ID
}

local function waitForProfile(player, timeout)
	local deadline = os.clock() + timeout
	while player.Parent and os.clock() < deadline do
		local data = PlayerData.get(player)
		if data then
			return data
		end
		task.wait(0.25)
	end
	return nil
end

MarketplaceService.ProcessReceipt = function(receipt)
	local grant = PRODUCTS[receipt.ProductId]
	if not grant then
		warn("[Purchase] unknown product", receipt.ProductId)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet -- retried when they rejoin
	end

	local data = waitForProfile(player, 15)
	if not data then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	-- Grant + receipt record live in the same profile, so they are always saved together.
	-- If this receipt was already applied (e.g. an earlier attempt whose save failed), don't grant
	-- again — just make sure it's persisted before telling Roblox it's done.
	if not data.Purchases[receipt.PurchaseId] then
		local ok, err = pcall(PlayerData.update, player, function(d)
			grant(d)
			PlayerData.recordPurchase(d, receipt.PurchaseId)
		end)
		if not ok then
			warn("[Purchase] grant failed:", err)
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
	end

	if PlayerData.saveNow(player) then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	-- Save failed: Roblox will call again. The in-memory grant + record are kept (and also saved
	-- when the player leaves), and the check above prevents granting twice.
	return Enum.ProductPurchaseDecision.NotProcessedYet
end

-- Gamepasses ---------------------------------------------------------------

local ownership = {} -- [Player] = { [passId] = boolean }

local function ownsPass(player, passId)
	ownership[player] = ownership[player] or {}
	local cached = ownership[player][passId]
	if cached ~= nil then
		return cached
	end
	local ok, owns = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, passId)
	if ok then
		ownership[player][passId] = owns
		return owns
	end
	return false -- on error, deny now but don't cache, so it is re-checked next time
end

local function applyPasses(player)
	player:SetAttribute("VIP", ownsPass(player, GAMEPASSES.VIP))
	player:SetAttribute("DoubleCoins", ownsPass(player, GAMEPASSES.DoubleCoins))
end

MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	if purchased then
		ownership[player] = ownership[player] or {}
		ownership[player][passId] = nil -- force a fresh server-side check
		applyPasses(player)
	end
end)

Players.PlayerAdded:Connect(applyPasses)
for _, p in Players:GetPlayers() do
	task.spawn(applyPasses, p)
end
Players.PlayerRemoving:Connect(function(player)
	ownership[player] = nil
end)

-- Other server code should read player:GetAttribute("DoubleCoins") — set only by the server.
