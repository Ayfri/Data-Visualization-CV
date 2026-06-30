<script lang="ts">
	import { Mail } from '@lucide/svelte';
	import GitHubImage from '$lib/assets/github-white-icon.webp';

	interface Props {
		repoCount: number;
		totalStars: number;
		steamHours: number;
	}

	let { repoCount, totalStars, steamHours }: Props = $props();

	const stats = $derived([
		{ label: 'Public repos', value: repoCount },
		{ label: 'GitHub stars', value: totalStars },
		{ label: 'Steam hours', value: steamHours.toLocaleString() },
	]);
</script>

<section class="relative flex flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
	<!-- Ambient glow blobs -->
	<div
		class="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
		style="background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)"
	></div>
	<div
		class="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl"
		style="background: radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)"
	></div>

	<!-- Badge -->
	<div
		class="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400"
	>
		<span class="relative flex h-2 w-2">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
			></span>
			<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
		</span>
		Available for opportunities
	</div>

	<!-- Name -->
	<h1
		class="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl"
	>
		Pierre Ayfri
	</h1>

	<!-- Title -->
	<p class="mt-4 text-xl font-medium text-emerald-400">Software Engineer</p>
	<p class="mt-2 max-w-xl text-base text-slate-400">
		Building tools, visualizing data, and playing way too many games. This CV is built with live
		data from GitHub, Steam, and Discord.
	</p>

	<!-- Links -->
	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<a
			href="https://github.com/Ayfri"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-700/60 hover:text-white"
		>
			<img src={GitHubImage} alt="GitHub" class="h-4 w-4" />
			GitHub
		</a>
		<a
			href="mailto:pierre.ayfri@gmail.com"
			class="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 backdrop-blur-sm transition-all hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:text-emerald-200"
		>
			<Mail size={16} />
			Contact
		</a>
	</div>

	<!-- Stats -->
	<div class="mt-14 flex flex-wrap justify-center gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800">
		{#each stats as stat, i (stat.label)}
			<div class="flex flex-col items-center gap-0.5 bg-slate-900 px-8 py-4">
				<span class="text-2xl font-bold text-white">{stat.value}</span>
				<span class="text-xs text-slate-500">{stat.label}</span>
			</div>
		{/each}
	</div>

	<!-- Scroll hint -->
	<div class="mt-16 flex flex-col items-center gap-2 text-xs text-slate-600">
		<span>scroll to explore</span>
		<div class="h-8 w-px bg-gradient-to-b from-slate-600 to-transparent"></div>
	</div>
</section>
