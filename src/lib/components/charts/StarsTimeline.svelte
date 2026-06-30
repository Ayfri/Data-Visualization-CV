<script lang="ts">
	import type { StarPoint } from '$lib/types';
	import { AreaChart } from 'layerchart';

	interface Props {
		points: StarPoint[];
	}

	let { points }: Props = $props();

	const total = $derived(points.at(-1)?.cumulative ?? 0);
	const chartData = $derived(
		points.map((p) => ({ date: new Date(p.date), stars: p.cumulative })),
	);
</script>

<div>
	<p class="mb-4 text-sm text-slate-400">
		<span class="text-2xl font-bold text-amber-400">★ {total}</span>
		total stars
		{#if points.length > 0}
			· first starred {points[0].date}
		{/if}
	</p>

	{#if chartData.length > 1}
		<div style="height: 200px;" class="[--color-primary:#f59e0b]">
			<AreaChart
				data={chartData}
				x="date"
				y="stars"
				height={200}
				axis={true}
				props={{
					area: { class: 'fill-amber-500/20' },
					line: { class: 'stroke-amber-500 stroke-2' },
				}}
			/>
		</div>
	{/if}
</div>
