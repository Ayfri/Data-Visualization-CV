<script lang="ts">
	import type { PlaytimeEntry } from '$lib/types';
	import { BarChart } from 'layerchart';

	interface Props {
		games: PlaytimeEntry[];
	}

	let { games }: Props = $props();

	const chartData = $derived(games.map((g) => ({ name: g.name, hours: Math.round(g.hours) })));
</script>

<div style="height: {Math.max(300, chartData.length * 28)}px;" class="[--color-primary:#8b5cf6]">
	<BarChart
		data={chartData}
		x="hours"
		y="name"
		orientation="horizontal"
		height={Math.max(300, chartData.length * 28)}
		axis={true}
		grid={{ x: true, y: false }}
	/>
</div>
