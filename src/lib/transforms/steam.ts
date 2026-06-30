import type { SteamCache, PlaytimeEntry } from '$lib/types';

export function toPlaytimeEntries(
	games: SteamCache['games'],
	topN = 20,
): PlaytimeEntry[] {
	return games
		.map((g) => ({ name: g.name, hours: g.playtimeMinutes / 60, genre: g.genre }))
		.sort((a, b) => b.hours - a.hours)
		.slice(0, topN);
}
