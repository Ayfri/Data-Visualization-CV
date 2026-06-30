<script lang="ts">
	import type { HeatmapCell } from '$lib/types';

	interface Props {
		cells: HeatmapCell[];
	}

	let { cells }: Props = $props();

	const maxCount = $derived(Math.max(1, ...cells.map((c) => c.count)));

	function intensity(count: number): string {
		const t = count / maxCount;
		if (t === 0) return 'bg-gray-800';
		if (t < 0.25) return 'bg-emerald-900';
		if (t < 0.5) return 'bg-emerald-700';
		if (t < 0.75) return 'bg-emerald-500';
		return 'bg-emerald-400';
	}
</script>

<!-- TODO: replace with LayerChart heatmap; this is a CSS-only placeholder -->
<div class="flex flex-wrap gap-0.5" role="img" aria-label="GitHub contribution heatmap">
	{#each cells as cell (cell.date)}
		<div
			class="size-3 rounded-sm {intensity(cell.count)}"
			title="{cell.count} contributions on {cell.date}"
		></div>
	{/each}
</div>
