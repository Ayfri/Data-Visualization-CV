<script lang="ts">
	import { Gamepad2 } from '@lucide/svelte';
	import GitHubImage from '$lib/assets/github-white-icon.webp';
</script>

<section class="flex flex-col items-center justify-center py-24 text-center">
	<h1 class="text-5xl font-bold tracking-tight">Pierre Ayfri</h1>
	<p class="mt-3 text-xl text-gray-400">Software Engineer</p>
	<div class="mt-6 flex gap-4 text-gray-400">
		<a
			href="https://github.com/Ayfri"
			class="flex items-center gap-1.5 transition-colors hover:text-white"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img src={GitHubImage} alt="GitHub" class="h-4 w-4" />
			GitHub
		</a>
		<span class="flex items-center gap-1.5">
			<Gamepad2 size={18} />
			Steam
		</span>
	</div>
</section>
