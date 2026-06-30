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
			dot: 'bg-emerald-500 shadow-emerald-500/50',
			badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
			line: 'from-emerald-500/40 to-transparent',
		},
		violet: {
			dot: 'bg-violet-500 shadow-violet-500/50',
			badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
			line: 'from-violet-500/40 to-transparent',
		},
		amber: {
			dot: 'bg-amber-500 shadow-amber-500/50',
			badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
			line: 'from-amber-500/40 to-transparent',
		},
		blue: {
			dot: 'bg-blue-500 shadow-blue-500/50',
			badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
			line: 'from-blue-500/40 to-transparent',
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
					class="absolute left-[19px] top-10 h-full w-px bg-gradient-to-b from-slate-700 to-transparent"
				></div>
			{/if}

			<!-- Dot -->
			<div class="relative z-10 flex-shrink-0">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-900 shadow-lg {colors.dot} shadow-sm"
				>
					<style.icon size={16} class="text-white" />
				</div>
			</div>

			<!-- Content -->
			<div class="min-w-0 flex-1 pt-1.5">
				<div class="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h3 class="font-semibold text-white">{entry.title}</h3>
						<time class="block text-xs text-slate-500 mt-0.5">
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
					<p class="mt-2 text-sm leading-relaxed text-slate-400">{entry.description}</p>
				{/if}
			</div>
		</div>
	{/each}
</div>
