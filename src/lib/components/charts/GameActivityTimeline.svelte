<script lang="ts">
	import type { GameActivityDay } from '$lib/types';

	interface Props {
		days: GameActivityDay[];
	}

	let { days }: Props = $props();

	const totalDays = $derived(new Set(days.map((d) => d.date)).size);
	const totalMinutes = $derived(days.reduce((s, d) => s + d.minutesPlayed, 0));
</script>

<!-- TODO: replace with LayerChart stacked Area or heatmap chart -->
<p class="text-sm text-gray-400">
	{Math.round(totalMinutes / 60)} hours across {totalDays} active days
</p>
