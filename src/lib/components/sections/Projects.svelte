<script lang="ts">
	import type { GithubCache } from '$lib/types';
	import StarsTimeline from '$lib/components/charts/StarsTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { toStarTimeline } from '$lib/transforms/github';
	import { Star, ExternalLink, GitFork } from '@lucide/svelte';

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

	const korePoints = $derived(toStarTimeline(github.koreStarHistory));

	// Language colors for topic chips
	const TOPIC_COLORS = [
		'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
		'bg-violet-500/10 text-violet-400 border-violet-500/20',
		'bg-amber-500/10 text-amber-400 border-amber-500/20',
		'bg-blue-500/10 text-blue-400 border-blue-500/20',
		'bg-rose-500/10 text-rose-400 border-rose-500/20',
	];

	function topicColor(i: number) {
		return TOPIC_COLORS[i % TOPIC_COLORS.length];
	}
</script>

<section class="mx-auto max-w-5xl px-6 py-16">
	<SectionHeading
		title="Open Source"
		subtitle="{github.repos.length} public repositories · {github.repos.reduce((s, r) => s + r.stars, 0)} total stars"
		accent="amber"
	/>

	{#if korePoints.length > 0}
		<div class="mb-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
			<div class="mb-4 flex items-center gap-2">
				<Star size={16} class="text-amber-400" />
				<h3 class="font-semibold text-white">Kore</h3>
				<span class="text-sm text-slate-500">- star history</span>
			</div>
			<StarsTimeline points={korePoints} />
		</div>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each featuredRepos as repo (repo.name)}
			<a
				href={repo.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/20"
			>
				<div class="flex items-start justify-between gap-2">
					<h3 class="font-semibold text-slate-200 group-hover:text-white">{repo.name}</h3>
					<ExternalLink size={14} class="mt-0.5 flex-shrink-0 text-slate-600 group-hover:text-slate-400" />
				</div>

				{#if repo.description}
					<p class="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{repo.description}</p>
				{/if}

				{#if repo.topics.length > 0}
					<div class="mt-3 flex flex-wrap gap-1">
						{#each repo.topics.slice(0, 3) as topic, i (topic)}
							<span class="rounded-full border px-2 py-0.5 text-[10px] font-medium {topicColor(i)}">{topic}</span>
						{/each}
					</div>
				{/if}

				<div class="mt-4 flex items-center gap-1 text-xs text-amber-400/80">
					<Star size={12} />
					<span class="font-medium">{repo.stars}</span>
				</div>
			</a>
		{/each}
	</div>
</section>
