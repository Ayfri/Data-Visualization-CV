<script lang="ts">
	import type { StarPoint } from '$lib/types';

	interface Props {
		points: StarPoint[];
	}

	let { points }: Props = $props();

	const total = $derived(points.at(-1)?.cumulative ?? 0);
</script>

<!-- TODO: replace with LayerChart Area chart (import { Area } from 'layerchart/svg') -->
<p class="text-gray-400">
	{total} total stars
	{#if points.length > 0}
		&mdash; first starred {points[0].date}
	{/if}
</p>
