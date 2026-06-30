<script lang="ts">
	interface Props {
		items: { semester: string; languages: Record<string, number> }[];
	}

	let { items }: Props = $props();
	let focusedLanguage = $state<string | null>(null);

	const languages = $derived.by(() => {
		const totals = new Map<string, number>();
		for (const item of items) {
			for (const [language, count] of Object.entries(item.languages)) {
				totals.set(language, Math.max(totals.get(language) ?? 0, count));
			}
		}
		return [...totals.entries()]
			.sort(([, a], [, b]) => b - a)
			.slice(0, 8)
			.map(([name]) => name);
	});
	const maxValue = $derived(Math.max(1, ...items.flatMap((item) => languages.map((language) => item.languages[language] ?? 0))));
	const colors = ['#c8d08a', '#8aa1a8', '#b8926a', '#a8a29e', '#8f9b77', '#c6976b', '#7a8a99', '#9d8d7a'];

	function heightFor(language: string, semester: { languages: Record<string, number> }) {
		return Math.max(4, ((semester.languages[language] ?? 0) / maxValue) * 100);
	}

	function focusLanguage(language: string) {
		focusedLanguage = language;
	}
</script>

<div class="space-y-5">
	<div class="flex flex-wrap gap-2">
		{#each languages as language, index (language)}
			<button
				type="button"
				class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs transition hover:border-zinc-600 {focusedLanguage === language ? 'border-zinc-500 bg-zinc-900 text-zinc-100' : 'text-zinc-500'}"
				onclick={() => (focusedLanguage = focusedLanguage === language ? null : language)}
			>
				<span class="h-2 w-2 rounded-full" style="background-color: {colors[index % colors.length]}"></span>
				{language}
			</button>
		{/each}
	</div>

	<div class="overflow-x-auto">
		<div class="grid min-w-240 gap-2" style="grid-template-columns: repeat({items.length}, minmax(0, 1fr));">
			{#each items as item (item.semester)}
				<div class="flex h-72 flex-col justify-end gap-1 rounded-md border border-zinc-900 bg-zinc-950/60 p-1.5">
					<div class="flex flex-1 items-end gap-px">
						{#each languages as language, index (language)}
							<button
								type="button"
								class="min-w-1 flex-1 cursor-pointer rounded-t transition focus:outline-none focus:ring-1 focus:ring-zinc-300"
								style="height: {heightFor(language, item)}%; background-color: {colors[index % colors.length]}; opacity: {!focusedLanguage || focusedLanguage === language ? 0.9 : 0.14};"
								title="{item.semester} · {language}: {item.languages[language] ?? 0} repos"
								onmouseenter={() => focusLanguage(language)}
								onfocus={() => focusLanguage(language)}
								onclick={() => (focusedLanguage = focusedLanguage === language ? null : language)}
								aria-label="{item.semester}, {language}: {item.languages[language] ?? 0} repos"
							></button>
						{/each}
					</div>
					<p class="truncate text-center text-[10px] text-zinc-600">{item.semester}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
