<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const avatarUrl = $derived(
		data.user.avatar
			? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.webp?size=128`
			: null
	);
</script>

<svelte:head>
	<title>Dashboard — Kepler</title>
	<meta name="description" content="Gérez vos serveurs Discord avec Kepler." />
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="border-b border-white/10">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
			<a href={resolve('/')} class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-xl bg-violet-500 font-black">K</span>
				<span class="font-semibold">Kepler</span>
			</a>

			<form method="POST" action="/auth/logout">
				<button
					type="submit"
					class="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
				>
					Se déconnecter
				</button>
			</form>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-12 lg:px-8">
		<div class="flex items-center gap-4">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					alt=""
					class="size-14 rounded-2xl bg-zinc-900 object-cover"
					referrerpolicy="no-referrer"
				/>
			{:else}
				<div class="grid size-14 place-items-center rounded-2xl bg-violet-500 text-xl font-bold">
					{data.user.username.slice(0, 1).toUpperCase()}
				</div>
			{/if}

			<div>
				<p class="text-sm text-zinc-500">Connecté avec Discord</p>
				<h1 class="text-2xl font-semibold">
					Bonjour, {data.user.global_name ?? data.user.username}
				</h1>
			</div>
		</div>

		<section class="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-8">
			<p class="text-sm font-medium text-violet-300">Prochaine étape</p>
			<h2 class="mt-2 text-xl font-semibold">Vos serveurs administrables</h2>
			<p class="mt-3 max-w-2xl text-zinc-400">
				La connexion est prête. La prochaine vue affichera les serveurs où vous possédez la
				permission de gestion, ainsi que l’état d’installation de Kepler.
			</p>
		</section>
	</main>
</div>
