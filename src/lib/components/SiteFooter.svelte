<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- les ancres sont ajoutées après une route résolue */
	import { base } from '$app/paths';
	import { resolve } from '$app/paths';

	let { compact = false }: { compact?: boolean } = $props();

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-white/[0.07] bg-black/10">
	{#if compact}
		<div
			class="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8"
		>
			<div class="flex items-center gap-2.5">
				<img src={`${base}/favicon.svg`} alt="" class="size-6 rounded-lg" />
				<span>© {year} Kepler</span>
			</div>
			<nav class="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Liens du pied de page">
				<a href={resolve('/')} class="transition hover:text-zinc-300">Accueil</a>
				<a href={`${resolve('/')}#fonctionnalites`} class="transition hover:text-zinc-300">
					Fonctionnalités
				</a>
				<a href={resolve('/dashboard')} class="transition hover:text-zinc-300">Mes serveurs</a>
				<a href={resolve('/changelog')} class="transition hover:text-zinc-300">Changelog</a>
			</nav>
		</div>
	{:else}
		<div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
			<div class="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-16">
				<div class="max-w-sm">
					<a href={resolve('/')} class="inline-flex items-center gap-3" aria-label="Accueil Kepler">
						<img src={`${base}/favicon.svg`} alt="" class="size-9 rounded-xl" />
						<span class="font-semibold text-zinc-200">Kepler</span>
					</a>
					<p class="mt-4 text-sm leading-6 text-zinc-500">
						Le bot Discord français conçu pour administrer, protéger et faire vivre votre communauté
						depuis une interface claire.
					</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-zinc-300 uppercase">Découvrir</p>
					<nav class="mt-4 flex flex-col gap-3 text-sm text-zinc-500" aria-label="Découvrir Kepler">
						<a href={`${resolve('/')}#fonctionnalites`} class="transition hover:text-white">
							Fonctionnalités
						</a>
						<a href={`${resolve('/')}#fonctionnement`} class="transition hover:text-white">
							Fonctionnement
						</a>
						<a href={`${resolve('/')}#securite`} class="transition hover:text-white">Sécurité</a>
					</nav>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-zinc-300 uppercase">Dashboard</p>
					<nav class="mt-4 flex flex-col gap-3 text-sm text-zinc-500" aria-label="Dashboard Kepler">
						<a href={resolve('/dashboard')} class="transition hover:text-white">Mes serveurs</a>
						<a href={resolve('/changelog')} class="transition hover:text-white">Changelog</a>
						<a href={resolve('/auth/discord')} class="transition hover:text-white">
							Connexion Discord
						</a>
					</nav>
				</div>
			</div>

			<div
				class="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"
			>
				<p>© {year} Kepler. Tous droits réservés.</p>
				<p class="flex items-center gap-2">
					<span class="size-1.5 rounded-full bg-emerald-400"></span>
					Développement actif
				</p>
			</div>
		</div>
	{/if}
</footer>
