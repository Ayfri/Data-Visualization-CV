<script lang="ts">
	import type { LanguageSlice } from '$lib/types';
	import { PieChart } from 'layerchart';

	interface Props {
		slices: LanguageSlice[];
		topN?: number;
	}

	let { slices, topN = 10 }: Props = $props();

	// Language color palette
	const LANG_COLORS: Record<string, string> = {
		TypeScript: '#3178c6',
		JavaScript: '#f7df1e',
		Kotlin: '#7f52ff',
		Python: '#3572a5',
		Rust: '#dea584',
		Go: '#00add8',
		CSS: '#563d7c',
		HTML: '#e34c26',
		Java: '#b07219',
		Shell: '#89e051',
		Svelte: '#ff3e00',
		Vue: '#41b883',
		SCSS: '#c6538c',
		Markdown: '#083fa1',
		Dockerfile: '#384d54',
	};

	const DEFAULT_COLORS = [
		'#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6',
		'#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
	];

	const visible = $derived(slices.slice(0, topN));

	const chartData = $derived(
		visible.map((s, i) => ({
			key: s.name,
			label: s.name,
			value: s.percentage,
			color: LANG_COLORS[s.name] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
		})),
	);
</script>

<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
	<!-- Donut chart -->
	<div class="flex-shrink-0" style="width: 220px; height: 220px;">
		<PieChart
			data={chartData}
			key="key"
			label="label"
			value="value"
			c="key"
			cRange={chartData.map((d) => d.color)}
			innerRadius={60}
			height={220}
			legend={false}
			props={{
				arc: { class: 'stroke-transparent stroke-2 hover:opacity-90 transition-opacity' },
			}}
		/>
	</div>

	<!-- Legend -->
	<div class="grid grid-cols-2 gap-x-6 gap-y-2">
		{#each chartData as lang (lang.key)}
			<div class="flex items-center gap-2">
				<div class="h-2.5 w-2.5 flex-shrink-0 rounded-full" style="background-color: {lang.color}"></div>
				<span class="text-sm text-slate-300">{lang.label}</span>
				<span class="ml-auto text-sm text-slate-500">{lang.value.toFixed(1)}%</span>
			</div>
		{/each}
	</div>
</div>
