--[[
	PlayerData — session-locked DataStore profiles (ServerStorage/Modules/PlayerData)

	Usage (server only):
		local PlayerData = require(ServerStorage.Modules.PlayerData)
		PlayerData.start()                                -- once, from a server Script
		local data = PlayerData.get(player)               -- table or nil while loading
		PlayerData.update(player, function(d) d.Coins += 10 end)
		local ok = PlayerData.saveNow(player)             -- force a save (used by purchases)

	Guarantees:
	- A profile is only written by the server that holds its session lock.
	- Saves use UpdateAsync and refuse to overwrite if another server took the lock.
	- Loads retry with backoff; a player whose data can't be loaded is kicked rather than
	  given empty data (which would later overwrite their real save).
	- Autosave every AUTOSAVE_SECONDS, save + release on leave, flush on shutdown.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local STORE_NAME = "PlayerData_v1"
local AUTOSAVE_SECONDS = 120
local LOCK_EXPIRE_SECONDS = 1800 -- a lock older than this is treated as abandoned (crashed server)
local LOAD_ATTEMPTS = 6

local DEFAULT_DATA = {
	Coins = 0,
	XP = 0,
	Level = 1,
	Inventory = {},
	Purchases = {}, -- [PurchaseId] = os.time(), used by PurchaseHandler for idempotency
	PurchaseOrder = {}, -- PurchaseIds in arrival order, to cap Purchases' size
}
local MAX_PURCHASE_HISTORY = 100

local store = DataStoreService:GetDataStore(STORE_NAME)
local jobId = if RunService:IsStudio() then "studio" else game.JobId

local PlayerData = {}
local profiles = {} -- [Player] = { data = table, dirty = boolean }

local function deepCopy(t)
	local out = {}
	for k, v in t do
		out[k] = if type(v) == "table" then deepCopy(v) else v
	end
	return out
end

local function reconcile(data)
	for k, v in DEFAULT_DATA do
		if data[k] == nil then
			data[k] = if type(v) == "table" then deepCopy(v) else v
		end
	end
	return data
end

local function keyFor(player)
	return "u_" .. player.UserId
end

-- Retries a DataStore call with exponential backoff. Returns ok, result.
local function retry(attempts, fn)
	local delay = 1
	local lastErr
	for _ = 1, attempts do
		local ok, result = pcall(fn)
		if ok then
			return true, result
		end
		lastErr = result
		task.wait(delay)
		delay = math.min(delay * 2, 16)
	end
	warn("[PlayerData] DataStore call failed:", lastErr)
	return false, nil
end

local function load(player)
	local key = keyFor(player)
	for attempt = 1, LOAD_ATTEMPTS do
		local lockedElsewhere = false
		local ok, record = retry(3, function()
			return store:UpdateAsync(key, function(old)
				old = old or { data = deepCopy(DEFAULT_DATA) }
				local lock = old.lock
				if lock and lock.jobId ~= jobId and os.time() - lock.time < LOCK_EXPIRE_SECONDS then
					lockedElsewhere = true
					return nil -- cancel the write; another server still owns this profile
				end
				old.lock = { jobId = jobId, time = os.time() }
				return old
			end)
		end)
		if ok and record and not lockedElsewhere then
			return reconcile(record.data or {})
		end
		if not player.Parent then
			return nil
		end
		-- Another server is still saving (e.g. player hopped servers). Wait for it to release.
		task.wait(math.min(2 ^ attempt, 15))
	end
	return nil
end

-- Writes the profile. release=true clears the lock. Returns true only if the data was written.
local function save(player, release)
	local profile = profiles[player]
	if not profile then
		return false
	end
	local snapshot = deepCopy(profile.data)
	local stolen = false
	local ok = retry(4, function()
		return store:UpdateAsync(keyFor(player), function(old)
			if old and old.lock and old.lock.jobId ~= jobId then
				stolen = true
				return nil -- never overwrite a profile another server owns
			end
			return {
				data = snapshot,
				lock = if release then nil else { jobId = jobId, time = os.time() },
			}
		end)
	end)
	if stolen then
		warn("[PlayerData] lock lost for", player.UserId, "- not saving")
		return false
	end
	if ok then
		profile.dirty = false
	end
	return ok
end

function PlayerData.get(player)
	local p = profiles[player]
	return p and p.data or nil
end

function PlayerData.update(player, fn)
	local p = profiles[player]
	if not p then
		return false
	end
	fn(p.data)
	p.dirty = true
	return true
end

function PlayerData.saveNow(player)
	return save(player, false)
end

-- Records a processed developer-product receipt in the profile (bounded history).
function PlayerData.recordPurchase(data, purchaseId)
	data.Purchases[purchaseId] = os.time()
	table.insert(data.PurchaseOrder, purchaseId)
	while #data.PurchaseOrder > MAX_PURCHASE_HISTORY do
		local oldest = table.remove(data.PurchaseOrder, 1)
		data.Purchases[oldest] = nil
	end
end

local loadedEvent = Instance.new("BindableEvent")
PlayerData.Loaded = loadedEvent.Event -- fires (player, data)

local function onPlayerAdded(player)
	local data = load(player)
	if not player.Parent then
		return
	end
	if not data then
		player:Kick("We couldn't load your data safely. Please rejoin in a minute.")
		return
	end
	profiles[player] = { data = data, dirty = false }
	loadedEvent:Fire(player, data)
end

local function onPlayerRemoving(player)
	if profiles[player] then
		save(player, true)
		profiles[player] = nil
	end
end

function PlayerData.start()
	Players.PlayerAdded:Connect(onPlayerAdded)
	Players.PlayerRemoving:Connect(onPlayerRemoving)
	for _, player in Players:GetPlayers() do
		task.spawn(onPlayerAdded, player)
	end

	task.spawn(function()
		while true do
			task.wait(AUTOSAVE_SECONDS)
			for player, profile in profiles do
				if profile.dirty then
					task.spawn(save, player, false)
				end
			end
		end
	end)

	game:BindToClose(function()
		local pending = 0
		for player in profiles do
			pending += 1
			task.spawn(function()
				save(player, true)
				pending -= 1
			end)
		end
		local deadline = os.clock() + 25
		while pending > 0 and os.clock() < deadline do
			task.wait(0.1)
		end
	end)
end

return PlayerData
