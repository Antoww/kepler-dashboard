<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.guild.name} — Kepler</title>
	<meta name="description" content={`Configurez Kepler pour ${data.guild.name}.`} />
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="border-b border-white/10">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
			<a href={resolve('/dashboard')} class="text-sm text-zinc-400 transition hover:text-white">
				← Tous les serveurs
			</a>
			<span class="text-sm font-semibold">Kepler</span>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-12 lg:px-8">
		<div class="flex items-center gap-4">
			{#if data.guild.iconUrl}
				<img
					src={data.guild.iconUrl}
					alt=""
					class="size-14 rounded-2xl bg-zinc-900 object-cover"
					referrerpolicy="no-referrer"
				/>
			{:else}
				<div class="grid size-14 place-items-center rounded-2xl bg-zinc-800 text-xl font-bold">
					{data.guild.name.slice(0, 1).toUpperCase()}
				</div>
			{/if}
			<div>
				<p class="text-sm text-emerald-400">Kepler actif</p>
				<h1 class="text-2xl font-semibold">{data.guild.name}</h1>
			</div>
		</div>

		<section class="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-8">
			<p class="text-sm font-medium text-violet-300">Serveur vérifié</p>
			<h2 class="mt-2 text-xl font-semibold">Configuration à venir</h2>
			<p class="mt-3 max-w-2xl text-zinc-400">
				Tes permissions Discord et la présence de Kepler ont été revérifiées côté serveur. Les
				modules de configuration Supabase seront ajoutés à la prochaine étape.
			</p>
		</section>
	</main>
</div>
