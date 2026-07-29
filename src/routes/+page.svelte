<script lang="ts">
	import { base, resolve } from '$app/paths';
	import ProfileMenu from '$lib/components/ProfileMenu.svelte';

	let { data } = $props();

	const features = [
		{
			icon: '◈',
			name: 'Une modération qui garde le fil',
			description:
				'Avertissements, exclusions, bannissements et mutes sont regroupés dans un historique de sanctions numérotées.'
		},
		{
			icon: '⌁',
			name: 'Des journaux vraiment utiles',
			description:
				'Les actions importantes arrivent dans les bons salons pour que votre équipe sache ce qui s’est passé.'
		},
		{
			icon: '◎',
			name: 'Un support bien rangé',
			description:
				'Publiez votre panneau de tickets, choisissez l’équipe responsable et conservez les échanges dans des salons privés.'
		},
		{
			icon: '✦',
			name: 'Une communauté plus vivante',
			description:
				'Anniversaires, rappels, annonces et commandes interactives donnent de bonnes raisons de revenir discuter.'
		},
		{
			icon: '⚑',
			name: 'Les signalements au bon endroit',
			description:
				'Les membres peuvent alerter votre équipe sans exposer la situation dans les salons publics.'
		},
		{
			icon: '⌖',
			name: 'Des outils pour tous les jours',
			description:
				'Informations sur les membres, rôles et salons, génération de mots de passe, jeux et autres commandes pratiques.'
		}
	];
</script>

<svelte:head>
	<title>Kepler — Le centre de contrôle de votre serveur Discord</title>
	<meta
		name="description"
		content="Kepler est un bot Discord français qui réunit modération, tickets, outils pratiques et animations pour aider les équipes à faire vivre leur communauté."
	/>
</svelte:head>

<div class="min-h-screen overflow-hidden bg-[#08080b] text-zinc-100">
	<div class="relative isolate">
		<div
			class="pointer-events-none absolute top-[-24rem] left-1/2 -z-10 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]"
		></div>
		<div
			class="pointer-events-none absolute top-96 -right-72 -z-10 size-[34rem] rounded-full bg-indigo-600/10 blur-[130px]"
		></div>

		<header class="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08080b]/80 backdrop-blur-xl">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
				<a href={resolve('/')} class="flex items-center gap-3" aria-label="Accueil Kepler">
					<img src={`${base}/favicon.svg`} alt="" class="size-9 rounded-xl" />
					<span class="text-lg font-semibold tracking-tight">Kepler</span>
				</a>

				<nav
					class="hidden items-center gap-8 text-sm text-zinc-400 md:flex"
					aria-label="Navigation"
				>
					<a href="#fonctionnalites" class="transition hover:text-white">Fonctionnalités</a>
					<a href="#fonctionnement" class="transition hover:text-white">Fonctionnement</a>
					<a href="#securite" class="transition hover:text-white">Sécurité</a>
				</nav>

				<ProfileMenu user={data.user} />
			</div>
		</header>

		<main>
			<section
				class="mx-auto grid max-w-7xl items-center gap-16 px-6 pt-20 pb-24 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:pt-28 lg:pb-32"
			>
				<div>
					<div
						class="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-sm font-medium text-violet-300"
					>
						<span class="size-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#a78bfa]"></span>
						Un bot Discord français, pensé avec sa communauté
					</div>

					<h1 class="max-w-3xl text-5xl leading-[1.02] font-bold tracking-[-0.04em] sm:text-7xl">
						Kepler aide votre équipe à
						<span
							class="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent"
							>faire vivre le serveur.</span
						>
					</h1>

					<p class="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
						Modérez proprement, répondez aux membres, automatisez les tâches répétitives et gardez
						une touche de fun. Kepler rassemble les outils utiles au quotidien sans transformer
						votre serveur en usine à gaz.
					</p>

					<div class="mt-10 flex flex-wrap items-center gap-4">
						<a
							href={data.user ? resolve('/dashboard') : resolve('/auth/discord')}
							class="inline-flex items-center gap-3 rounded-xl bg-[#5865f2] px-5 py-3.5 font-semibold text-white shadow-xl shadow-indigo-950/30 transition hover:bg-[#6875f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
						>
							<svg viewBox="0 0 24 24" class="size-5 fill-current" aria-hidden="true">
								<path
									d="M19.5 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.02a15.1 15.1 0 0 0-5.87 0L8.55 4A16.5 16.5 0 0 0 4.5 5.35C1.94 9.15 1.25 12.86 1.6 16.5a16.6 16.6 0 0 0 4.97 2.5l1.2-1.64a10.7 10.7 0 0 1-1.89-.9l.46-.35c3.64 1.7 7.6 1.7 11.2 0l.47.36c-.6.35-1.23.65-1.9.9L17.3 19a16.5 16.5 0 0 0 4.97-2.5c.42-4.22-.72-7.9-2.77-11.16ZM8.84 14.27c-1.09 0-1.99-1-1.99-2.22 0-1.23.88-2.23 1.99-2.23 1.1 0 2 1 1.98 2.23 0 1.23-.88 2.22-1.98 2.22Zm6.32 0c-1.1 0-1.99-1-1.99-2.22 0-1.23.88-2.23 1.99-2.23 1.1 0 2 1 1.98 2.23 0 1.23-.87 2.22-1.98 2.22Z"
								/>
							</svg>
							{data.user ? 'Ouvrir le dashboard' : 'Continuer avec Discord'}
						</a>
						<a
							href="#fonctionnalites"
							class="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
						>
							Voir ce que fait le bot
						</a>
					</div>

					<div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
						<span class="flex items-center gap-2"
							><span class="text-emerald-400">✓</span> Développé activement</span
						>
						<span class="flex items-center gap-2"
							><span class="text-emerald-400">✓</span> Configuration sans commandes</span
						>
					</div>
				</div>

				<div class="relative mx-auto w-full max-w-2xl lg:mx-0">
					<div
						class="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-violet-500/15 to-indigo-500/5 blur-3xl"
					></div>
					<div
						class="overflow-hidden rounded-3xl border border-white/10 bg-[#111116] shadow-2xl shadow-black/60"
					>
						<div class="flex items-center gap-2 border-b border-white/[0.07] px-5 py-4">
							<span class="size-2.5 rounded-full bg-red-400/70"></span>
							<span class="size-2.5 rounded-full bg-amber-400/70"></span>
							<span class="size-2.5 rounded-full bg-emerald-400/70"></span>
							<div class="mx-auto rounded-md bg-white/[0.04] px-14 py-1 text-[10px] text-zinc-600">
								dashboard.kepler-bot.net
							</div>
						</div>

						<div class="grid min-h-[430px] grid-cols-[76px_1fr] sm:grid-cols-[155px_1fr]">
							<div class="border-r border-white/[0.07] bg-black/10 p-3">
								<div class="mb-6 flex items-center gap-2 px-1">
									<img src={`${base}/favicon.svg`} alt="" class="size-7 rounded-lg" />
									<span class="hidden text-xs font-semibold sm:block">Kepler</span>
								</div>
								<div class="space-y-2">
									{#each [['◫', 'Vue d’ensemble'], ['⌁', 'Journaux'], ['◈', 'Modération'], ['◎', 'Tickets']] as item, index (item[1])}
										<div
											class={[
												'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs',
												index === 0 ? 'bg-violet-500/15 text-violet-300' : 'text-zinc-600'
											]}
										>
											<span>{item[0]}</span><span class="hidden sm:block">{item[1]}</span>
										</div>
									{/each}
								</div>
							</div>

							<div class="min-w-0 p-5 sm:p-7">
								<div class="flex items-center gap-3">
									<div
										class="grid size-10 place-items-center rounded-xl bg-violet-500/15 font-bold text-violet-300"
									>
										K
									</div>
									<div>
										<p class="text-sm font-semibold">Kepler Community</p>
										<p class="mt-0.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
											<span class="size-1.5 rounded-full bg-emerald-400"></span> Kepler actif
										</p>
									</div>
								</div>

								<div class="mt-8 grid gap-3 sm:grid-cols-3">
									{#each [['6', 'Modules'], ['Europe/Paris', 'Fuseau'], ['Actif', 'État']] as stat (stat[1])}
										<div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
											<p class="truncate text-xs font-semibold">{stat[0]}</p>
											<p class="mt-1 text-[9px] tracking-wider text-zinc-600 uppercase">
												{stat[1]}
											</p>
										</div>
									{/each}
								</div>

								<p class="mt-7 text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
									Modules du serveur
								</p>
								<div class="mt-3 space-y-2.5">
									{#each [['Tickets', 'Panneau et support'], ['Modération', 'Sanctions et notifications'], ['Signalements', 'Canal et équipe']] as module (module[0])}
										<div
											class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
										>
											<div>
												<p class="text-xs font-medium">{module[0]}</p>
												<p class="mt-1 text-[10px] text-zinc-600">{module[1]}</p>
											</div>
											<span
												class="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-400"
												>Configuré</span
											>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="fonctionnalites" class="border-y border-white/[0.06] bg-white/[0.018]">
				<div class="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
					<div class="max-w-2xl">
						<p class="text-sm font-semibold text-violet-400">Un seul bot, plusieurs rôles</p>
						<h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
							Sérieux quand il le faut.<br />Sympa le reste du temps.
						</h2>
						<p class="mt-5 text-lg leading-8 text-zinc-400">
							Kepler accompagne aussi bien l’équipe qui administre le serveur que les membres qui le
							font vivre.
						</p>
					</div>

					<div
						class="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 lg:grid-cols-3"
					>
						{#each features as feature (feature.name)}
							<article class="bg-[#0d0d11] p-7 transition hover:bg-[#111117]">
								<div
									class="grid size-11 place-items-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07] text-lg text-violet-300"
								>
									{feature.icon}
								</div>
								<h3 class="mt-6 font-semibold">{feature.name}</h3>
								<p class="mt-3 text-sm leading-6 text-zinc-500">{feature.description}</p>
							</article>
						{/each}
					</div>
				</div>
			</section>

			<section id="fonctionnement" class="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
				<div class="text-center">
					<p class="text-sm font-semibold text-violet-400">Le dashboard complète le bot</p>
					<h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
						Vous choisissez. Kepler s’occupe du reste.
					</h2>
				</div>

				<div class="relative mt-16 grid gap-6 md:grid-cols-3">
					<div
						class="absolute top-8 right-[16%] left-[16%] hidden border-t border-dashed border-violet-400/20 md:block"
					></div>
					{#each [['01', 'Retrouvez vos serveurs', 'Connectez Discord et choisissez simplement le serveur sur lequel Kepler est installé.'], ['02', 'Adaptez-le à votre équipe', 'Indiquez les salons et les rôles que le bot doit utiliser pour chaque fonctionnalité.'], ['03', 'Retournez sur Discord', 'Kepler prend en compte vos choix : votre équipe continue à travailler là où elle échange déjà.']] as step (step[0])}
						<article class="relative text-center">
							<div
								class="mx-auto grid size-16 place-items-center rounded-2xl border border-violet-400/20 bg-[#101016] font-mono text-sm text-violet-300 shadow-xl shadow-black/30"
							>
								{step[0]}
							</div>
							<h3 class="mt-6 font-semibold">{step[1]}</h3>
							<p class="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{step[2]}</p>
						</article>
					{/each}
				</div>
			</section>

			<section id="securite" class="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
				<div
					class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/[0.10] to-white/[0.025] px-7 py-12 sm:px-12 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-16 lg:py-16"
				>
					<div
						class="pointer-events-none absolute -top-32 -left-20 size-80 rounded-full bg-violet-600/15 blur-3xl"
					></div>
					<div class="relative">
						<p class="text-sm font-semibold text-violet-300">La confiance n’est pas une option</p>
						<h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
							Kepler ne vous demande pas les clés du serveur.
						</h2>
						<p class="mt-5 leading-7 text-zinc-400">
							Vous vous connectez avec Discord et le dashboard respecte les permissions que vous
							avez déjà. Seules les personnes autorisées peuvent configurer le bot.
						</p>
					</div>
					<div class="relative mt-10 grid gap-4 sm:grid-cols-2 lg:mt-0">
						{#each [['Votre mot de passe reste chez Discord', 'La connexion passe par l’autorisation officielle de Discord.'], ['Vos permissions sont respectées', 'Un serveur n’apparaît que si votre compte peut réellement le gérer.'], ['Chaque choix est vérifié', 'Kepler contrôle les salons et les rôles avant de modifier sa configuration.'], ['Un projet qui évolue', 'Le bot et son dashboard avancent ensemble grâce aux retours de la communauté.']] as item (item[0])}
							<div class="rounded-2xl border border-white/[0.08] bg-black/15 p-5">
								<span class="text-emerald-400">✓</span>
								<p class="mt-3 text-sm font-semibold">{item[0]}</p>
								<p class="mt-2 text-xs leading-5 text-zinc-500">{item[1]}</p>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<section class="border-t border-white/[0.06]">
				<div class="mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
					<h2 class="text-3xl font-bold tracking-tight sm:text-5xl">
						Envie d’essayer Kepler sur votre serveur ?
					</h2>
					<p class="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
						Connectez Discord pour retrouver vos serveurs et découvrir les modules déjà disponibles.
					</p>
					<a
						href={data.user ? resolve('/dashboard') : resolve('/auth/discord')}
						class="mt-9 inline-flex items-center rounded-xl bg-violet-500 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-400"
					>
						{data.user ? 'Accéder à mes serveurs' : 'Commencer avec Discord'}
						<span class="ml-2">→</span>
					</a>
				</div>
			</section>
		</main>

		<footer class="border-t border-white/[0.06]">
			<div
				class="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8"
			>
				<div class="flex items-center gap-2">
					<img src={`${base}/favicon.svg`} alt="" class="size-6 rounded-lg" />
					<span class="font-medium text-zinc-400">Kepler</span>
				</div>
				<p>Un bot français développé pour les communautés Discord.</p>
			</div>
		</footer>
	</div>
</div>
