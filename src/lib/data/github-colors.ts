export const GITHUB_LANG_COLORS: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Python: '#3572a5',
	Kotlin: '#A97BFF',
	Java: '#b07219',
	Svelte: '#ff3e00',
	Vue: '#41b883',
	Go: '#00add8',
	Rust: '#dea584',
	'Jupyter Notebook': '#DA5B0B',
	HTML: '#e34c26',
	CSS: '#563d7c',
	SCSS: '#c6538c',
	Shell: '#89e051',
	Dockerfile: '#384d54',
	Markdown: '#083fa1',
	TOML: '#9c4221',
	YAML: '#cb171e',
	Makefile: '#427819',
	SQL: '#e38c00',
	'C#': '#178600',
	'C++': '#f34b7d',
	C: '#555555',
	Ruby: '#701516',
	PHP: '#4F5D95',
	Swift: '#F05138',
	XML: '#6b6b6b',
	JSON: '#8b8b8b',
};

const DEFAULT_FALLBACKS = [
	'#c8d08a', '#8aa1a8', '#b8926a', '#9d8d7a', '#6f8c74',
	'#a86f64', '#82918d', '#a7a29a', '#6c8797', '#a99a6e',
];

export function langColor(name: string, fallbackIndex = 0): string {
	return GITHUB_LANG_COLORS[name] ?? DEFAULT_FALLBACKS[fallbackIndex % DEFAULT_FALLBACKS.length];
}
