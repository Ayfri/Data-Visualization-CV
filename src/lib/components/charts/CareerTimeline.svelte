<script lang="ts">
	import type { TimelineEntry } from '$lib/types';
	import { Briefcase, GraduationCap, Code2, User } from '@lucide/svelte';

	interface Props {
		entries: TimelineEntry[];
	}

	let { entries }: Props = $props();

	const sorted = $derived([...entries].sort((a, b) => b.date.localeCompare(a.date)));

	const CATEGORY_STYLE = {
		work: { color: 'emerald', icon: Briefcase, label: 'Work' },
		education: { color: 'violet', icon: GraduationCap, label: 'Education' },
		project: { color: 'amber', icon: Code2, label: 'Project' },
		personal: { color: 'blue', icon: User, label: 'Personal' },
	} as const;

	const COLOR_CLASSES = {
		emerald: {
			dot: 'bg-lime-200 shadow-lime-200/30',
			badge: 'bg-lime-200/10 text-lime-100 border-lime-200/20',
			line: 'from-lime-200/30 to-transparent',
		},
		violet: {
			dot: 'bg-zinc-300 shadow-zinc-300/30',
			badge: 'bg-zinc-400/10 text-zinc-300 border-zinc-400/20',
			line: 'from-zinc-300/30 to-transparent',
		},
		amber: {
			dot: 'bg-stone-300 shadow-stone-300/30',
			badge: 'bg-stone-400/10 text-stone-300 border-stone-400/20',
			line: 'from-stone-300/30 to-transparent',
		},
		blue: {
			dot: 'bg-neutral-300 shadow-neutral-300/30',
			badge: 'bg-neutral-400/10 text-neutral-300 border-neutral-400/20',
			line: 'from-neutral-300/30 to-transparent',
		},
	} as const;
</script>

<div class="relative">
	{#each sorted as entry, i (entry.id)}
		{@const style = CATEGORY_STYLE[entry.category]}
		{@const colors = COLOR_CLASSES[style.color]}
		<div class="group relative flex gap-6 pb-10 last:pb-0">
			<!-- Timeline line -->
			{#if i < sorted.length - 1}
				<div
					class="absolute left-4.75 top-10 h-full w-px bg-linear-to-b from-zinc-700 to-transparent"
				></div>
			{/if}

			<!-- Dot -->
			<div class="relative z-10 shrink-0">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-md border-2 border-zinc-800 bg-zinc-950 shadow-lg {colors.dot} shadow-sm"
				>
					<style.icon size={16} class="text-white" />
				</div>
			</div>

			<!-- Content -->
			<div class="min-w-0 flex-1 pt-1.5">
				<div class="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h3 class="font-semibold text-white">{entry.title}</h3>
						<time class="mt-0.5 block text-xs text-zinc-600">
							{entry.date}{entry.endDate ? ` - ${entry.endDate}` : ''}
						</time>
					</div>
					<span
						class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {colors.badge}"
					>
						{style.label}
					</span>
				</div>
				{#if entry.description}
					<p class="mt-2 text-sm leading-relaxed text-zinc-500">{entry.description}</p>
				{/if}
			</div>
		</div>
	{/each}
</div>
