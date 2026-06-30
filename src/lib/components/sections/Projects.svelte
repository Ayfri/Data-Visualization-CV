<script lang="ts">
	import type { GithubCache } from '$lib/types';
	import StarsTimeline from '$lib/components/charts/StarsTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { toStarSeries } from '$lib/transforms/github';
	import { Star, ExternalLink } from '@lucide/svelte';

	interface Props {
		github: GithubCache;
	}

	let { github }: Props = $props();

	const featuredRepos = $derived(
		github.repos
			.filter((r) => r.stars > 0)
			.sort((a, b) => b.stars - a.stars)
			.slice(0, 6),
	);

	const starSeries = $derived(toStarSeries(github));

	// Language colors for topic chips
	const TOPIC_COLORS = [
		'bg-lime-200/10 text-lime-100 border-lime-200/20',
		'bg-stone-400/10 text-stone-300 border-stone-400/20',
		'bg-zinc-400/10 text-zinc-300 border-zinc-400/20',
		'bg-amber-700/10 text-amber-300 border-amber-700/20',
		'bg-neutral-400/10 text-neutral-300 border-neutral-400/20',
	];

	function topicColor(i: number) {
		return TOPIC_COLORS[i % TOPIC_COLORS.length];
	}
</script>

<section class="mx-auto max-w-7xl px-6 py-16">
	<SectionHeading
		title="Open Source"
		subtitle="{github.repos.filter((r) => !r.isPrivate).length} public · {github.repos.filter((r) => r.isPrivate).length} private repositories · {github.repos.reduce((s, r) => s + r.stars, 0)} total stars"
		accent="amber"
	/>

	{#if starSeries.length > 0}
		<div class="mb-12 rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
			<div class="mb-4 flex items-center gap-2">
				<Star size={16} class="text-lime-200" />
				<h3 class="font-semibold text-zinc-100">Project star histories</h3>
				<span class="text-sm text-zinc-600">top {starSeries.length} public projects</span>
			</div>
			<StarsTimeline series={starSeries} />
		</div>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each featuredRepos as repo (repo.name)}
			<a
				href={repo.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex flex-col rounded-md border border-zinc-800 bg-zinc-950/70 p-5 transition duration-200 hover:border-zinc-600 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/30"
			>
				<div class="flex items-start justify-between gap-2">
					<h3 class="font-semibold text-zinc-200 group-hover:text-white">{repo.name}</h3>
					<ExternalLink size={14} class="mt-0.5 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
				</div>

				{#if repo.description}
					<p class="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{repo.description}</p>
				{/if}

				{#if repo.topics.length > 0}
					<div class="mt-3 flex flex-wrap gap-1">
						{#each repo.topics.slice(0, 3) as topic, i (topic)}
							<span class="rounded-full border px-2 py-0.5 text-[10px] font-medium {topicColor(i)}">{topic}</span>
						{/each}
					</div>
				{/if}

				<div class="mt-4 flex items-center gap-1 text-xs text-lime-200/80">
					<Star size={12} />
					<span class="font-medium">{repo.stars}</span>
				</div>
			</a>
		{/each}
	</div>
</section>
