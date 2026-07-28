<svelte:head>
	<title>Kepler — Pilotez votre serveur Discord</title>
	<meta
		name="description"
		content="Configurez Kepler et gérez ses fonctionnalités depuis un tableau de bord simple et sécurisé."
	/>
</svelte:head>

<div class="relative isolate min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
	<div
		class="pointer-events-none absolute inset-x-0 top-[-20rem] -z-10 mx-auto h-[42rem] w-[42rem] rounded-full bg-violet-600/20 blur-[120px]"
	></div>

	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
		<a href="/" class="flex items-center gap-3" aria-label="Accueil Kepler">
			<span
				class="grid size-10 place-items-center rounded-xl bg-violet-500 text-lg font-black shadow-lg shadow-violet-500/20"
				>K</span
			>
			<span class="text-lg font-semibold tracking-tight">Kepler</span>
		</a>

		<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
			Dashboard en préparation
		</span>
	</header>

	<main class="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
		<section class="flex flex-col justify-center">
			<div
				class="mb-6 w-fit rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm font-medium text-violet-300"
			>
				Le centre de contrôle de votre communauté
			</div>

			<h1 class="max-w-3xl text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
				Votre serveur Discord, <span class="text-violet-400">en orbite.</span>
			</h1>

			<p class="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
				Configurez la modération, les journaux, les anniversaires et les tickets de Kepler
				depuis une interface claire.
			</p>

			<div class="mt-9 flex flex-wrap items-center gap-4">
				<button
					type="button"
					disabled
					class="inline-flex cursor-not-allowed items-center gap-3 rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white opacity-70 shadow-xl shadow-violet-950/40"
				>
					<span class="grid size-6 place-items-center rounded-md bg-white/15 text-xs">D</span>
					Connexion avec Discord
				</button>
				<span class="text-sm text-zinc-500">Disponible à la prochaine étape</span>
			</div>
		</section>

		<section
			class="relative rounded-3xl border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/40 backdrop-blur"
			aria-label="Aperçu du dashboard"
		>
			<div class="rounded-2xl border border-white/5 bg-zinc-950/80 p-5">
				<div class="mb-7 flex items-center justify-between">
					<div>
						<p class="text-xs font-medium tracking-widest text-zinc-500 uppercase">Serveur actif</p>
						<p class="mt-1 font-semibold">Kepler Community</p>
					</div>
					<span class="flex items-center gap-2 text-xs text-emerald-400">
						<span class="size-2 rounded-full bg-emerald-400"></span>
						Bot connecté
					</span>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					{#each [
						['Modération', 'Active', 'M'],
						['Journaux', '#logs', 'J'],
						['Anniversaires', '#général', 'A'],
						['Tickets', 'Configurés', 'T']
					] as feature}
						<div class="rounded-xl border border-white/5 bg-white/[0.035] p-4">
							<div class="mb-6 grid size-9 place-items-center rounded-lg bg-violet-400/10 text-sm text-violet-300">
								{feature[2]}
							</div>
							<p class="text-sm font-medium">{feature[0]}</p>
							<p class="mt-1 text-xs text-zinc-500">{feature[1]}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</main>
</div>
