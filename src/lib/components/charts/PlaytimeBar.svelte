<script lang="ts">
	import type { PlaytimeEntry } from '$lib/types';

	interface Props {
		games: PlaytimeEntry[];
	}

	let { games }: Props = $props();

	const maxHours = $derived(Math.max(1, ...games.map((g) => g.hours)));
</script>

<!-- TODO: replace with LayerChart horizontal Bar chart (import { Bar } from 'layerchart/svg') -->
<ul class="space-y-2 text-sm">
	{#each games as game (game.name)}
		<li class="flex items-center gap-3">
			<span class="w-36 truncate text-right text-gray-300">{game.name}</span>
			<div class="h-3 flex-1 rounded bg-gray-800">
				<div
					class="h-full rounded bg-blue-500"
					style="width: {(game.hours / maxHours) * 100}%"
				></div>
			</div>
			<span class="w-16 text-gray-400">{game.hours.toFixed(0)} h</span>
		</li>
	{/each}
</ul>
