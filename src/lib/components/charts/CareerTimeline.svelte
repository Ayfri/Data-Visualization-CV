<script lang="ts">
	import type { TimelineEntry } from '$lib/types';

	interface Props {
		entries: TimelineEntry[];
	}

	let { entries }: Props = $props();

	const sorted = $derived([...entries].sort((a, b) => b.date.localeCompare(a.date)));
</script>

<!-- TODO: replace with LayerCake-based custom horizontal timeline -->
<ol class="relative border-l border-gray-700">
	{#each sorted as entry (entry.id)}
		<li class="mb-8 ml-6">
			<span
				class="absolute -left-2 flex size-4 items-center justify-center rounded-full bg-emerald-500"
			></span>
			<time class="mb-1 block text-xs text-gray-400">{entry.date}{entry.endDate ? ` – ${entry.endDate}` : ''}</time>
			<h3 class="font-semibold">{entry.title}</h3>
			<p class="text-sm text-gray-400">{entry.description}</p>
		</li>
	{/each}
</ol>
