<script lang="ts">
	import { Mail, RadioTower } from '@lucide/svelte';

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

	type SocialIcon = 'github' | 'linkedin' | 'twitch' | 'x';

	const socials: { name: string; href: string; icon: SocialIcon }[] = [
		{ name: 'GitHub', href: 'https://github.com/Ayfri', icon: 'github' },
		{ name: 'LinkedIn', href: 'https://www.linkedin.com/in/pierre-roy-ayfri/', icon: 'linkedin' },
		{ name: 'Twitch', href: 'https://www.twitch.tv/ayfri_', icon: 'twitch' },
		{ name: 'X', href: 'https://twitter.com/ayfri_', icon: 'x' },
	];
</script>

{#snippet socialIcon(icon: SocialIcon)}
	<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4 fill-current">
		{#if icon === 'github'}
			<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.95 10.95 0 0 1 12 6.05c.98 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.67.42.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
		{:else if icon === 'linkedin'}
			<path d="M4.98 3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM.48 8h4.02v13H.48V8Zm7.02 0h3.85v1.78h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.85 2.7 4.85 6.2V21h-4.01v-6.32c0-1.51-.03-3.45-2.1-3.45-2.1 0-2.42 1.64-2.42 3.34V21H7.5V8Z" transform="translate(2 0)" />
		{:else if icon === 'twitch'}
			<path d="M4.3 2 3 5.5v14h4.8V22h2.7l2.5-2.5h3.8L21 15.3V2H4.3Zm15 12.4-2.4 2.4h-4.2l-2.5 2.5v-2.5H6.6V3.7h12.7v10.7Zm-3.2-7.2v4.2h-1.6V7.2h1.6Zm-4.4 0v4.2h-1.6V7.2h1.6Z" />
		{:else}
			<path d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.7l-5.2-6.8L5.6 22H2.3l7.7-8.8L1.8 2h6.9l4.7 6.2L18.9 2Zm-1.2 17.9h1.8L7.7 4H5.8l11.9 15.9Z" />
		{/if}
	</svg>
{/snippet}

<section class="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center overflow-hidden px-6 py-24">
	<div class="pointer-events-none absolute inset-x-6 top-16 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent"></div>
	<div class="pointer-events-none absolute inset-y-20 right-6 w-px bg-linear-to-b from-transparent via-zinc-800 to-transparent"></div>

	<div
		class="mb-8 inline-flex w-fit items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-sm font-medium text-zinc-400"
	>
		<RadioTower size={14} class="text-lime-200" />
		Available for opportunities
	</div>

	<h1
		class="max-w-4xl bg-linear-to-br from-zinc-50 via-stone-300 to-zinc-600 bg-clip-text text-6xl font-semibold tracking-tight text-transparent sm:text-7xl"
	>
		Pierre Ayfri
	</h1>

	<p class="mt-5 text-xl font-medium text-lime-200/80">Software Engineer</p>
	<p class="mt-3 max-w-2xl text-base leading-relaxed text-zinc-500">
		Building tools, visualizing data, and playing way too many games. This CV is built with live
		data from GitHub, Steam, and Discord.
	</p>

	<div class="mt-8 flex flex-wrap gap-3">
		{#each socials as social (social.name)}
			<a
				href={social.href}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950/80 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 hover:text-white"
			>
				{@render socialIcon(social.icon)}
				{social.name}
			</a>
		{/each}
		<a
			href="mailto:pierre.ayfri@gmail.com"
			class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-lime-200/20 bg-lime-200/10 px-4 py-2 text-sm font-medium text-lime-100 transition hover:border-lime-100/40 hover:bg-lime-100/15"
		>
			<Mail size={16} />
			Contact
		</a>
	</div>

	<div class="mt-14 grid w-full max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-md border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
		{#each stats as stat, i (stat.label)}
			<div class="flex flex-col gap-0.5 bg-zinc-950 px-6 py-4">
				<span class="text-2xl font-semibold text-zinc-100">{stat.value}</span>
				<span class="text-xs uppercase tracking-[0.18em] text-zinc-600">{stat.label}</span>
			</div>
		{/each}
	</div>

	<div class="mt-16 flex flex-col gap-2 text-xs text-zinc-700">
		<span>scroll to explore</span>
		<div class="h-8 w-px bg-linear-to-b from-zinc-600 to-transparent"></div>
	</div>
</section>
