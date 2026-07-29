<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const modules = $derived([
		{
			name: 'Journaux',
			description: 'Événements et activité du serveur',
			configured: data.config.logsConfigured
		},
		{
			name: 'Modération',
			description: 'Sanctions, historique et notifications',
			configured: data.config.moderationConfigured
		},
		{
			name: 'Anniversaires',
			description: 'Canal des annonces automatiques',
			configured: data.config.birthdaysConfigured
		},
		{
			name: 'Rôle muet',
			description: 'Rôle utilisé pour les sanctions longues',
			configured: data.config.muteConfigured
		},
		{
			name: 'Signalements',
			description: 'Canal et rôle de traitement',
			configured: data.config.reportsConfigured
		},
		{
			name: 'Tickets',
			description: 'Panneau, catégorie, équipe et journaux',
			configured: data.config.ticketsConfigured
		}
	]);
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

		<section class="mt-10 grid gap-4 sm:grid-cols-3">
			<div class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
				<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">Base de données</p>
				<p class="mt-3 font-semibold">
					{data.config.exists ? 'Configuration trouvée' : 'À initialiser'}
				</p>
			</div>
			<div class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
				<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">Fuseau horaire</p>
				<p class="mt-3 font-semibold">{data.config.timezone}</p>
			</div>
			<div class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
				<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">
					Dernière modification
				</p>
				<p class="mt-3 font-semibold">
					{data.config.updatedAt
						? new Intl.DateTimeFormat('fr-FR', {
								dateStyle: 'medium',
								timeStyle: 'short'
							}).format(new Date(data.config.updatedAt))
						: 'Aucune'}
				</p>
			</div>
		</section>

		<section class="mt-10">
			<div>
				<p class="text-sm font-medium text-violet-300">Configuration Supabase</p>
				<h2 class="mt-2 text-2xl font-semibold">Modules du serveur</h2>
				<p class="mt-2 text-sm text-zinc-500">
					État lu directement depuis la base partagée avec Kepler.
				</p>
			</div>

			<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each modules as module (module.name)}
					<article class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="font-semibold">{module.name}</h3>
								<p class="mt-2 text-sm leading-6 text-zinc-500">{module.description}</p>
							</div>
							<span
								class={[
									'shrink-0 rounded-full px-2.5 py-1 text-xs',
									module.configured
										? 'bg-emerald-400/10 text-emerald-400'
										: 'bg-amber-400/10 text-amber-300'
								]}
							>
								{module.configured ? 'Configuré' : 'À configurer'}
							</span>
						</div>
					</article>
				{/each}
			</div>
		</section>
	</main>
</div>
