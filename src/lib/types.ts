// ---- Cache shapes (written by scripts/fetch-data.ts, read by +page.ts) ----

export interface GithubCache {
	fetchedAt: string;
	contributionCalendar: { date: string; count: number }[];
	languageBytes: Record<string, number>;
	repos: {
		name: string;
		description: string | null;
		stars: number;
		createdAt: string;
		topics: string[];
		url: string;
	}[];
	koreStarHistory: { starredAt: string }[];
}

export interface SteamCache {
	fetchedAt: string;
	games: {
		appid: number;
		name: string;
		playtimeMinutes: number;
		genre?: string;
		achievements?: { unlocked: number; total: number };
	}[];
}

export interface DiscordCache {
	fetchedAt: string;
	parsedFromExportDate: string;
	gameSessions: {
		gameName: string;
		date: string;
		minutesPlayed: number;
	}[];
}

// ---- Hand-maintained data shapes ----

export interface TimelineEntry {
	id: string;
	date: string;
	endDate?: string;
	title: string;
	description: string;
	category: 'education' | 'work' | 'project' | 'personal';
	icon?: string;
}

export interface Skill {
	name: string;
	category: 'language' | 'framework' | 'tool' | 'soft-skill';
	level: number;
}

// ---- Chart-ready shapes (produced by src/lib/transforms/) ----

export interface HeatmapCell {
	date: string;
	count: number;
	week: number;
	dayOfWeek: number;
}

export interface LanguageSlice {
	name: string;
	bytes: number;
	percentage: number;
}

export interface StarPoint {
	date: string;
	cumulative: number;
}

export interface PlaytimeEntry {
	name: string;
	hours: number;
	genre?: string;
}

export interface GameActivityDay {
	date: string;
	gameName: string;
	minutesPlayed: number;
}
