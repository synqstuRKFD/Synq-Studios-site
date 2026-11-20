--[[
	RemoteGuard — rate-limited, validated RemoteEvent handlers (ServerStorage/Modules/RemoteGuard)

	local RemoteGuard = require(ServerStorage.Modules.RemoteGuard)
	local T = RemoteGuard.types

	RemoteGuard.connect(Remotes.BuyItem, {
		rate = 5, per = 1,                       -- max 5 calls per 1 second per player
		args = { T.string(1, 32), T.integer(1, 99) }, -- itemId, quantity
	}, function(player, itemId, quantity)
		-- only reached with valid, in-range args; still re-check game rules here
	end)
]]

local Players = game:GetService("Players")

local RemoteGuard = {}
local buckets = {} -- [remote][player] = { tokens, last }

local function allow(remote, player, rate, per)
	buckets[remote] = buckets[remote] or setmetatable({}, { __mode = "k" })
	local now = os.clock()
	local b = buckets[remote][player]
	if not b then
		b = { tokens = rate, last = now }
		buckets[remote][player] = b
	end
	b.tokens = math.min(rate, b.tokens + (now - b.last) * (rate / per))
	b.last = now
	if b.tokens < 1 then
		return false
	end
	b.tokens -= 1
	return true
end

RemoteGuard.types = {
	string = function(minLen, maxLen)
		return function(v)
			return type(v) == "string" and #v >= (minLen or 0) and #v <= (maxLen or 200) and utf8.len(v) ~= nil
		end
	end,
	number = function(min, max)
		return function(v)
			return type(v) == "number" and v == v and v ~= math.huge and v ~= -math.huge
				and v >= (min or -1e9) and v <= (max or 1e9)
		end
	end,
	integer = function(min, max)
		return function(v)
			return type(v) == "number" and v == math.floor(v) and v >= (min or -1e9) and v <= (max or 1e9)
		end
	end,
	boolean = function()
		return function(v)
			return type(v) == "boolean"
		end
	end,
	oneOf = function(options)
		local set = {}
		for _, o in options do
			set[o] = true
		end
		return function(v)
			return set[v] == true
		end
	end,
	instanceOf = function(className)
		return function(v)
			return typeof(v) == "Instance" and v:IsA(className)
		end
	end,
	vector3 = function(maxMagnitude)
		return function(v)
			return typeof(v) == "Vector3" and v.Magnitude == v.Magnitude and v.Magnitude <= (maxMagnitude or 1e5)
		end
	end,
}

local function logReject(player, remote, reason)
	-- Log, don't auto-ban: false positives (lag, bugs) are common. Review logs before acting.
	warn(("[RemoteGuard] %s (%d) rejected on %s: %s"):format(player.Name, player.UserId, remote.Name, reason))
end

function RemoteGuard.connect(remote, opts, handler)
	local rate, per, validators = opts.rate or 10, opts.per or 1, opts.args or {}
	return remote.OnServerEvent:Connect(function(player, ...)
		if not allow(remote, player, rate, per) then
			return logReject(player, remote, "rate limit")
		end
		local n = select("#", ...)
		if n ~= #validators then
			return logReject(player, remote, ("expected %d args, got %d"):format(#validators, n))
		end
		local args = { ... }
		for i, check in validators do
			if not check(args[i]) then
				return logReject(player, remote, "bad arg #" .. i)
			end
		end
		local ok, err = pcall(handler, player, table.unpack(args, 1, n))
		if not ok then
			warn("[RemoteGuard] handler error on " .. remote.Name .. ":", err)
		end
	end)
end

Players.PlayerRemoving:Connect(function(player)
	for _, perPlayer in buckets do
		perPlayer[player] = nil
	end
end)

return RemoteGuard
