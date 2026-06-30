<script lang="ts">
	import type { LanguageSlice } from '$lib/types';

	interface Props {
		slices: LanguageSlice[];
		topN?: number;
	}

	let { slices, topN = 8 }: Props = $props();

	const visible = $derived(slices.slice(0, topN));
</script>

<!-- TODO: replace with LayerChart Arc/Pie chart -->
<ul class="space-y-1 text-sm">
	{#each visible as slice (slice.name)}
		<li class="flex items-center gap-2">
			<span class="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
			<span class="flex-1">{slice.name}</span>
			<span class="text-gray-400">{slice.percentage.toFixed(1)}%</span>
		</li>
	{/each}
</ul>
