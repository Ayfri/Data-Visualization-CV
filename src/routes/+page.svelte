<script lang="ts">
	import type { PageData } from './$types';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Projects from '$lib/components/sections/Projects.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Gaming from '$lib/components/sections/Gaming.svelte';
	import ContributionHeatmap from '$lib/components/charts/ContributionHeatmap.svelte';
	import LanguageDonut from '$lib/components/charts/LanguageDonut.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { toHeatmapCells, toLanguageSlices } from '$lib/transforms/github';

	let { data }: { data: PageData } = $props();

	const heatmapCells = $derived(toHeatmapCells(data.github.contributionCalendar));
	const languageSlices = $derived(toLanguageSlices(data.github.languageBytes));

	const totalContributions = $derived(
		data.github.contributionCalendar.reduce((s, d) => s + d.count, 0),
	);
	const totalStars = $derived(data.github.repos.reduce((s, r) => s + r.stars, 0));
	const steamHours = $derived(
		Math.round(data.steam.games.reduce((s, g) => s + g.playtimeMinutes / 60, 0)),
	);
</script>

<main class="min-h-screen" style="background-color: #080c14;">
	<Hero
		repoCount={data.github.repos.length}
		totalStars={totalStars}
		steamHours={steamHours}
	/>

	<!-- GitHub Activity -->
	<section class="mx-auto max-w-5xl px-6 py-16">
		<SectionHeading
			title="GitHub Activity"
			subtitle="{totalContributions} contributions in the past year"
			accent="emerald"
		/>

		{#if heatmapCells.length > 0}
			<div class="mb-10 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
				<h3 class="mb-4 text-sm font-medium text-slate-400">Contribution calendar</h3>
				<ContributionHeatmap cells={heatmapCells} />
			</div>
		{/if}

		{#if languageSlices.length > 0}
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
				<h3 class="mb-5 text-sm font-medium text-slate-400">Languages by bytes of code</h3>
				<LanguageDonut slices={languageSlices} />
			</div>
		{/if}
	</section>

	<Projects github={data.github} />
	<Skills skills={data.skills} timeline={data.timeline} />
	<Gaming steam={data.steam} discord={data.discord} />

	<!-- Footer -->
	<footer class="border-t border-slate-800 py-8 text-center">
		<p class="text-sm text-slate-600">
			Built with SvelteKit, LayerChart, and live data · Last updated {new Date(data.github.fetchedAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
		</p>
	</footer>
</main>
