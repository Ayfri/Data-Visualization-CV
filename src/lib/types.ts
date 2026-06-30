// ---- Cache shapes (written by scripts/fetch-data.ts, read by +page.ts) ----

export interface GithubCache {
	fetchedAt: string;
	contributionCalendar: { date: string; count: number }[];
	languageBytes: Record<string, number>;
	languageRepos?: Record<string, number>;
	languageFiles?: Record<string, number>;
	languageTimeline?: { semester: string; languages: Record<string, number> }[];
	repos: {
		name: string;
		owner?: string;
		description: string | null;
		stars: number;
		isPrivate?: boolean;
		createdAt: string;
		updatedAt?: string;
		pushedAt?: string;
		primaryLanguage?: string | null;
		sizeKb?: number;
		openIssues?: number;
		watchers?: number;
		topics: string[];
		url: string;
	}[];
	koreStarHistory: { starredAt: string }[];
	starHistories?: {
		name: string;
		owner: string;
		url: string;
		stars: number;
		history: { starredAt: string }[];
	}[];
}

export interface SteamCache {
	fetchedAt: string;
	games: {
		appid: number;
		name: string;
		playtimeMinutes: number;
		recentPlaytimeMinutes?: number;
		iconUrl?: string;
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

export interface AtomClickerCache {
	fetchedAt: string;
	totalUsers: number;
	leaderboardSize: number;
	onlineUsers: number;
	activeLast7Days: number;
	topAtoms: number;
	topLevel: number;
	outlierUsers: number;
	observedUserHistory: { date: string; cumulative: number; count: number }[];
	registrationHistory: { date: string; cumulative: number; count: number }[];
	levelBuckets: { label: string; count: number }[];
	atomBands: { label: string; count: number }[];
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
	repoCount: number;
	fileCount: number;
	bytes: number;
	percentage: number;
	repoPercentage: number;
	filePercentage: number;
	bytePercentage: number;
}

export interface StarPoint {
	date: string;
	cumulative: number;
}

export interface StarSeries {
	name: string;
	owner: string;
	url: string;
	stars: number;
	points: StarPoint[];
}

export interface PlaytimeEntry {
	appid?: number;
	name: string;
	hours: number;
	recentHours?: number;
	iconUrl?: string;
	genre?: string;
}

export interface GameActivityDay {
	date: string;
	gameName: string;
	minutesPlayed: number;
}
