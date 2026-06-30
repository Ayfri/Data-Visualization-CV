import type { PageLoad } from './$types';
import type { GithubCache, SteamCache, DiscordCache, TimelineEntry, Skill } from '$lib/types';

import githubRaw from '$lib/data/cache/github.json';
import steamRaw from '$lib/data/cache/steam.json';
import discordRaw from '$lib/data/cache/discord.json';
import timelineRaw from '$lib/data/timeline.json';
import skillsRaw from '$lib/data/skills.json';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		github: githubRaw as GithubCache,
		steam: steamRaw as SteamCache,
		discord: discordRaw as DiscordCache,
		timeline: timelineRaw as TimelineEntry[],
		skills: skillsRaw as Skill[],
	};
};
