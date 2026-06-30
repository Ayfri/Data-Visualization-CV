<script lang="ts">
	import type { PageData } from './$types';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Projects from '$lib/components/sections/Projects.svelte';
	import Career from '$lib/components/sections/Career.svelte';
	import Gaming from '$lib/components/sections/Gaming.svelte';
	import AtomClicker from '$lib/components/sections/AtomClicker.svelte';
	import ContributionHeatmap from '$lib/components/charts/ContributionHeatmap.svelte';
	import LanguageDonut from '$lib/components/charts/LanguageDonut.svelte';
	import LanguageTimeline from '$lib/components/charts/LanguageTimeline.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { toHeatmapCells, toLanguageSlices } from '$lib/transforms/github';

	let { data }: { data: PageData } = $props();

	const heatmapCells = $derived(toHeatmapCells(data.github.contributionCalendar));
	const languageSlices = $derived(toLanguageSlices(data.github));

	const totalContributions = $derived(
		data.github.contributionCalendar.reduce((s, d) => s + d.count, 0),
	);
	const totalStars = $derived(data.github.repos.reduce((s, r) => s + r.stars, 0));
	const steamHours = $derived(
		Math.round(data.steam.games.reduce((s, g) => s + g.playtimeMinutes / 60, 0)),
	);
</script>

<main class="min-h-screen bg-transparent">
	<Hero
		repoCount={data.github.repos.length}
		totalStars={totalStars}
		steamHours={steamHours}
	/>

	<!-- GitHub Activity -->
	<section class="mx-auto max-w-7xl px-6 py-16">
		<SectionHeading
			title="GitHub Activity"
			subtitle="{totalContributions} contributions in the past year"
			accent="emerald"
		/>

		{#if heatmapCells.length > 0}
			<div class="mb-10 rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
				<h3 class="mb-4 text-sm font-medium text-zinc-400">Contribution activity explorer</h3>
				<ContributionHeatmap cells={heatmapCells} />
			</div>
		{/if}

		{#if languageSlices.length > 0}
			<div class="mb-10 rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
				<h3 class="mb-5 text-sm font-medium text-zinc-400">Language presence across repositories</h3>
				<LanguageDonut slices={languageSlices} />
			</div>
		{/if}

		{#if data.github.languageTimeline && data.github.languageTimeline.length > 0}
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
				<h3 class="mb-5 text-sm font-medium text-zinc-400">Language adoption by quarter</h3>
				<LanguageTimeline items={data.github.languageTimeline} />
			</div>
		{/if}
	</section>

	<Projects github={data.github} />
	<AtomClicker data={data.atomClicker} />
	<Career timeline={data.timeline} />
	<Gaming steam={data.steam} discord={data.discord} />

	<!-- Footer -->
	<footer class="border-t border-zinc-900 py-8 text-center">
		<p class="text-sm text-zinc-700">
			Built with SvelteKit, LayerChart, and live data · Last updated {new Date(data.github.fetchedAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
		</p>
	</footer>
</main>
