<script lang="ts">
	import type { AtomClickerCache } from '$lib/types';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { Activity, Atom, Trophy, Users } from '@lucide/svelte';

	interface Props {
		data: AtomClickerCache;
	}

	type View = 'history' | 'levels' | 'atoms';

	let { data }: Props = $props();
	let view = $state<View>('history');
	let activeLabel = $state<string | null>(null);

	const rows = $derived(view === 'levels' ? data.levelBuckets : data.atomBands);
	const maxCount = $derived(Math.max(1, ...rows.map((row) => row.count)));
	const activeRow = $derived(rows.find((row) => row.label === activeLabel) ?? rows[0] ?? null);
	const history = $derived(
		data.registrationHistory.length > 0 ? data.registrationHistory : data.observedUserHistory,
	);
	const maxHistory = $derived(Math.max(1, ...history.map((point) => point.cumulative)));
	const activeHistory = $derived(history.at(-1) ?? null);

	function compact(value: number) {
		if (value >= 1e15) return value.toExponential(2).replace('e+', 'e');
		return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
	}
</script>

<section class="mx-auto max-w-7xl px-6 py-16">
	<SectionHeading
		title="Atom Clicker"
		subtitle="Public aggregate data from the Supabase-backed leaderboard"
		accent="amber"
	/>

	<div class="grid gap-5 lg:grid-cols-[18rem_1fr]">
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
				<div class="mb-3 flex items-center gap-2 text-zinc-500">
					<Users size={16} />
					<span class="text-xs uppercase tracking-[0.2em]">users</span>
				</div>
				<p class="text-3xl font-semibold text-zinc-100">{data.totalUsers.toLocaleString()}</p>
				<p class="mt-1 text-xs text-zinc-600">{data.leaderboardSize.toLocaleString()} ranked entries</p>
			</div>

			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
				<div class="mb-3 flex items-center gap-2 text-zinc-500">
					<Activity size={16} />
					<span class="text-xs uppercase tracking-[0.2em]">activity</span>
				</div>
				<p class="text-3xl font-semibold text-zinc-100">{data.activeLast7Days.toLocaleString()}</p>
				<p class="mt-1 text-xs text-zinc-600">active in the last 7 days · {data.onlineUsers} online</p>
			</div>

			<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
				<div class="mb-3 flex items-center gap-2 text-zinc-500">
					<Trophy size={16} />
					<span class="text-xs uppercase tracking-[0.2em]">peak</span>
				</div>
				<p class="text-3xl font-semibold text-zinc-100">{compact(data.topAtoms)}</p>
				<p class="mt-1 text-xs text-zinc-600">filtered top · level {data.topLevel} · {data.outlierUsers} outliers</p>
			</div>
		</div>

		<div class="rounded-md border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30">
			<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2 text-sm font-medium text-zinc-400">
					<Atom size={17} class="text-lime-200" />
					{view === 'history' ? 'Observed user progression' : 'Leaderboard distribution'}
				</div>
				<div class="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
					<button
						type="button"
						class="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition {view === 'history' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
						onclick={() => (view = 'history')}
					>
						History
					</button>
					<button
						type="button"
						class="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition {view === 'levels' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
						onclick={() => (view = 'levels')}
					>
						Levels
					</button>
					<button
						type="button"
						class="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition {view === 'atoms' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'}"
						onclick={() => (view = 'atoms')}
					>
						Atoms
					</button>
				</div>
			</div>

			{#if view === 'history'}
				<div class="grid gap-3 md:grid-cols-[1fr_14rem] md:items-center">
					<div class="flex h-72 items-end gap-1 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
						{#each history as point (point.date)}
							<div
								class="group flex min-w-2 flex-1 cursor-pointer items-end rounded-t bg-zinc-900"
								title="{point.date}: {point.cumulative} observed users"
							>
								<span
									class="block w-full rounded-t bg-linear-to-t from-stone-800 via-zinc-500 to-lime-200 opacity-80 transition group-hover:opacity-100"
									style="height: {Math.max(3, (point.cumulative / maxHistory) * 100)}%"
								></span>
							</div>
						{/each}
					</div>
					<div class="flex aspect-square items-center justify-center rounded-md border border-zinc-800 bg-[radial-gradient(circle_at_center,#18181b,#09090b_64%)] text-center">
						<div>
							<p class="text-4xl font-semibold text-zinc-100">{activeHistory?.cumulative ?? 0}</p>
							<p class="mt-1 text-sm text-zinc-500">{activeHistory?.date ?? 'history'}</p>
							<p class="mt-3 text-xs text-zinc-700">{data.registrationHistory.length > 0 ? 'registered users' : 'observed updates'}</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="grid gap-3 md:grid-cols-[1fr_14rem] md:items-center">
					<div class="space-y-2">
						{#each rows as row (row.label)}
							<button
								type="button"
								class="grid w-full cursor-pointer grid-cols-[5rem_1fr_4rem] items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-left transition hover:border-zinc-600 {activeLabel === row.label ? 'border-zinc-500 bg-zinc-900' : ''}"
								onmouseenter={() => (activeLabel = row.label)}
								onclick={() => (activeLabel = activeLabel === row.label ? null : row.label)}
							>
								<span class="text-xs text-zinc-500">{row.label}</span>
								<span class="h-3 overflow-hidden rounded-full bg-zinc-900">
									<span class="block h-full rounded-full bg-linear-to-r from-stone-700 via-zinc-400 to-lime-200" style="width: {(row.count / maxCount) * 100}%"></span>
								</span>
								<span class="text-right text-sm text-zinc-300">{row.count}</span>
							</button>
						{/each}
					</div>

					<div class="flex aspect-square items-center justify-center rounded-md border border-zinc-800 bg-[radial-gradient(circle_at_center,#18181b,#09090b_64%)] text-center">
						<div>
							<p class="text-4xl font-semibold text-zinc-100">{activeRow?.count ?? 0}</p>
							<p class="mt-1 text-sm text-zinc-500">{activeRow?.label ?? 'bucket'}</p>
							<p class="mt-3 text-xs text-zinc-700">{view === 'levels' ? 'level band' : 'atom band'}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
