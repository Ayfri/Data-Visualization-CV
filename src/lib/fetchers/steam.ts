import type { SteamCache } from '$lib/types';

const BASE = 'https://api.steampowered.com';

async function steam(path: string, params: Record<string, string>) {
	const url = new URL(`${BASE}${path}`);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`Steam ${path}: ${res.status}`);
	return res.json() as Promise<unknown>;
}

export async function fetchSteamCache(apiKey: string, steamId: string): Promise<SteamCache> {
	const owned = (await steam('/IPlayerService/GetOwnedGames/v1/', {
		key: apiKey,
		steamid: steamId,
		include_appinfo: 'true',
		include_played_free_games: 'true',
	})) as {
		response: {
			games: {
				appid: number;
				name: string;
				playtime_forever: number;
				playtime_2weeks?: number;
				img_icon_url: string;
			}[];
		};
	};

	const games = (owned.response.games ?? []).map((g) => ({
		appid: g.appid,
		name: g.name,
		playtimeMinutes: g.playtime_forever,
		recentPlaytimeMinutes: g.playtime_2weeks ?? 0,
		iconUrl: g.img_icon_url
			? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
			: undefined,
	}));

	return {
		fetchedAt: new Date().toISOString(),
		games,
	};
}
