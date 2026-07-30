<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- les URLs de release sont externes */
	/* eslint-disable svelte/no-at-html-tags -- body_html est rendu et assaini par GitHub */
	import { resolve } from '$app/paths';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import GitBranch from '@lucide/svelte/icons/git-branch';

	let { data } = $props();

	const dateFormat = new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
</script>

<svelte:head>
	<title>Changelog — Kepler</title>
	<meta
		name="description"
		content="Découvrez les dernières nouveautés, améliorations et corrections du dashboard Kepler."
	/>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="border-b border-white/[0.07] bg-black/10">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
			<a href={resolve('/')} class="flex items-center gap-3" aria-label="Accueil Kepler">
				<span class="grid size-9 place-items-center rounded-xl bg-violet-500 font-black">K</span>
				<span class="font-semibold">Kepler</span>
			</a>
			<a
				href={resolve('/dashboard')}
				class="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white"
			>
				Dashboard
			</a>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
		>
			<ArrowLeft size={16} aria-hidden="true" />
			Retour à l’accueil
		</a>

		<div class="mt-10 max-w-2xl">
			<div class="flex items-center gap-2 text-sm font-medium text-violet-300">
				<GitBranch size={17} aria-hidden="true" />
				Évolution du projet
			</div>
			<h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
			<p class="mt-5 text-lg leading-8 text-zinc-400">
				Nouvelles fonctionnalités, améliorations et corrections publiées pour Kepler Dashboard.
				Cette page est synchronisée avec les releases GitHub du projet.
			</p>
		</div>

		{#if data.unavailable}
			<div
				class="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 text-sm text-amber-200"
				role="status"
			>
				GitHub est momentanément indisponible. Les dernières données en cache sont affichées.
			</div>
		{/if}

		{#if data.releases.length}
			<div class="relative mt-14">
				<div class="absolute top-3 bottom-3 left-[5px] w-px bg-white/[0.08] sm:left-[7px]"></div>
				<div class="grid gap-10">
					{#each data.releases as release, index (release.id)}
						<article class="relative pl-9 sm:pl-12">
							<span
								class={[
									'absolute top-2 left-0 size-3 rounded-full border-[3px] border-zinc-950 sm:size-4',
									index === 0 ? 'bg-violet-400' : 'bg-zinc-700'
								]}
							></span>

							<div class="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
								<div class="flex flex-wrap items-start justify-between gap-4">
									<div>
										<div class="flex flex-wrap items-center gap-2">
											<span
												class="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 font-mono text-xs text-violet-300"
											>
												{release.tag}
											</span>
											{#if release.prerelease}
												<span
													class="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300"
												>
													Préversion
												</span>
											{/if}
										</div>
										<h2 class="mt-4 text-2xl font-semibold tracking-tight">{release.name}</h2>
										<p class="mt-2 text-sm text-zinc-600">
											Publiée le {dateFormat.format(new Date(release.publishedAt))}
										</p>
									</div>
									<a
										href={release.url}
										target="_blank"
										rel="noreferrer"
										class="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
									>
										Voir sur GitHub
										<ExternalLink size={15} aria-hidden="true" />
									</a>
								</div>

								{#if release.bodyHtml}
									<div class="release-notes mt-7 border-t border-white/[0.07] pt-6">
										{@html release.bodyHtml}
									</div>
								{:else if release.body}
									<p
										class="mt-7 border-t border-white/[0.07] pt-6 text-sm whitespace-pre-wrap text-zinc-400"
									>
										{release.body}
									</p>
								{:else}
									<p class="mt-7 border-t border-white/[0.07] pt-6 text-sm text-zinc-600">
										Aucune note de publication n’a été fournie pour cette version.
									</p>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			</div>
		{:else}
			<div class="mt-14 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
				<div
					class="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"
				>
					<GitBranch size={22} aria-hidden="true" />
				</div>
				<h2 class="mt-5 text-lg font-semibold">La première release arrive bientôt</h2>
				<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
					Les notes de version apparaîtront automatiquement ici dès leur publication sur GitHub.
				</p>
				<a
					href="https://github.com/Antoww/kepler-dashboard/releases"
					target="_blank"
					rel="noreferrer"
					class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
				>
					Consulter le dépôt
					<ExternalLink size={15} aria-hidden="true" />
				</a>
			</div>
		{/if}
	</main>

	<SiteFooter compact />
</div>

<style>
	.release-notes :global(h1),
	.release-notes :global(h2),
	.release-notes :global(h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.6rem;
		font-weight: 600;
		color: #f4f4f5;
	}

	.release-notes :global(h1:first-child),
	.release-notes :global(h2:first-child),
	.release-notes :global(h3:first-child) {
		margin-top: 0;
	}

	.release-notes :global(p),
	.release-notes :global(li) {
		font-size: 0.875rem;
		line-height: 1.7;
		color: #a1a1aa;
	}

	.release-notes :global(ul),
	.release-notes :global(ol) {
		margin: 0.75rem 0;
		padding-left: 1.4rem;
	}

	.release-notes :global(ul) {
		list-style: disc;
	}

	.release-notes :global(ol) {
		list-style: decimal;
	}

	.release-notes :global(a) {
		color: #c4b5fd;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.release-notes :global(code) {
		border: 1px solid rgb(255 255 255 / 0.08);
		border-radius: 0.35rem;
		background: rgb(0 0 0 / 0.25);
		padding: 0.1rem 0.35rem;
		font-size: 0.8rem;
	}

	.release-notes :global(pre) {
		margin: 1rem 0;
		overflow-x: auto;
		border: 1px solid rgb(255 255 255 / 0.08);
		border-radius: 0.75rem;
		background: rgb(0 0 0 / 0.25);
		padding: 1rem;
	}

	.release-notes :global(pre code) {
		border: 0;
		background: transparent;
		padding: 0;
	}
</style>
