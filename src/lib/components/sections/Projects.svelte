<script lang="ts">
	import type { GithubCache } from '$lib/types';
	import StarsTimeline from '$lib/components/charts/StarsTimeline.svelte';
	import { toStarTimeline } from '$lib/transforms/github';

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
</script>

<section class="mx-auto max-w-5xl px-6 py-16">
	<h2 class="text-2xl font-semibold">Projects</h2>

	{#if korePoints.length > 0}
		<div class="mt-6">
			<h3 class="mb-2 text-lg font-medium">Kore - star history</h3>
			<StarsTimeline points={korePoints} />
		</div>
	{/if}

	<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each featuredRepos as repo (repo.name)}
			<li class="rounded-lg border border-gray-800 bg-gray-900 p-4">
				<a
					href={repo.url}
					class="font-medium hover:text-emerald-400"
					target="_blank"
					rel="noopener noreferrer"
				>
					{repo.name}
				</a>
				{#if repo.description}
					<p class="mt-1 text-sm text-gray-400">{repo.description}</p>
				{/if}
				<p class="mt-2 text-xs text-gray-500">&#9733; {repo.stars}</p>
			</li>
		{/each}
	</ul>
</section>
