<script lang="ts">
	import { resolve } from '$app/paths';
	import ProfileMenu from '$lib/components/ProfileMenu.svelte';

	let { data } = $props();

	function initial(name: string): string {
		return name.slice(0, 1).toUpperCase();
	}
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

			<ProfileMenu user={data.user} />
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-12 lg:px-8">
		<div class="flex items-center gap-4">
			{#if data.user.avatar}
				<img
					src={`https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.${data.user.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=128`}
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

		<section class="mt-12">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="text-sm font-medium text-violet-300">Centre de contrôle</p>
					<h2 class="mt-2 text-2xl font-semibold">Vos serveurs</h2>
					<p class="mt-2 text-sm text-zinc-500">
						Seuls les serveurs que vous pouvez administrer sont affichés.
					</p>
				</div>
				<span class="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
					{data.guilds.length} serveur{data.guilds.length > 1 ? 's' : ''}
				</span>
			</div>

			{#if data.guilds.length > 0}
				<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each data.guilds as guild (guild.id)}
						<article
							class="flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.055]"
						>
							<div class="flex items-start justify-between gap-4">
								{#if guild.iconUrl}
									<img
										src={guild.iconUrl}
										alt=""
										class="size-12 rounded-xl bg-zinc-900 object-cover"
										referrerpolicy="no-referrer"
									/>
								{:else}
									<div
										class="grid size-12 place-items-center rounded-xl bg-zinc-800 text-lg font-bold text-zinc-300"
									>
										{initial(guild.name)}
									</div>
								{/if}

								<span
									class={[
										'flex items-center gap-2 rounded-full px-2.5 py-1 text-xs',
										guild.botInstalled
											? 'bg-emerald-400/10 text-emerald-400'
											: 'bg-zinc-800 text-zinc-400'
									]}
								>
									<span
										class={[
											'size-1.5 rounded-full',
											guild.botInstalled ? 'bg-emerald-400' : 'bg-zinc-500'
										]}
									></span>
									{guild.botInstalled ? 'Kepler actif' : 'Kepler absent'}
								</span>
							</div>

							<h3 class="mt-5 truncate font-semibold" title={guild.name}>{guild.name}</h3>

							<div class="mt-auto pt-5">
								{#if guild.botInstalled}
									<a
										href={resolve(`/dashboard/${guild.id}`)}
										class="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
									>
										Configurer
									</a>
								{:else}
									<a
										href={resolve(`/dashboard/${guild.id}/install`)}
										class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-violet-300"
									>
										Ajouter Kepler
									</a>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center">
					<p class="font-medium">Aucun serveur administrable</p>
					<p class="mt-2 text-sm text-zinc-500">
						Discord n’a retourné aucun serveur où tu possèdes la permission de gestion.
					</p>
				</div>
			{/if}
		</section>
	</main>
</div>
