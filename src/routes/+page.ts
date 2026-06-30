import type { PageLoad } from './$types';
import type { GithubCache, SteamCache, DiscordCache, AtomClickerCache, TimelineEntry } from '$lib/types';

import githubRaw from '$lib/data/cache/github.json';
import steamRaw from '$lib/data/cache/steam.json';
import discordRaw from '$lib/data/cache/discord.json';
import atomClickerRaw from '$lib/data/cache/atom-clicker.json';
import timelineRaw from '$lib/data/timeline.json';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		github: githubRaw as GithubCache,
		steam: steamRaw as SteamCache,
		discord: discordRaw as DiscordCache,
		atomClicker: atomClickerRaw as AtomClickerCache,
		timeline: timelineRaw as TimelineEntry[],
	};
};
