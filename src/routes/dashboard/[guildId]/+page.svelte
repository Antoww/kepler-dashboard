<script lang="ts">
	import { resolve } from '$app/paths';
	import ProfileMenu from '$lib/components/ProfileMenu.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Cake from '@lucide/svelte/icons/cake';
	import ChartNoAxesColumnIncreasing from '@lucide/svelte/icons/chart-no-axes-column-increasing';
	import Flag from '@lucide/svelte/icons/flag';
	import Gem from '@lucide/svelte/icons/gem';
	import Hash from '@lucide/svelte/icons/hash';
	import Languages from '@lucide/svelte/icons/languages';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import Radio from '@lucide/svelte/icons/radio';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Settings from '@lucide/svelte/icons/settings';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Tags from '@lucide/svelte/icons/tags';
	import Ticket from '@lucide/svelte/icons/ticket';
	import Users from '@lucide/svelte/icons/users';

	let { data, form } = $props();
	let activeTab = $state<
		| 'overview'
		| 'stats'
		| 'componentsV2'
		| 'general'
		| 'logs'
		| 'moderation'
		| 'birthdays'
		| 'reports'
		| 'tickets'
	>('overview');
	let componentTitle = $state('Bienvenue sur notre serveur');
	let componentDescription = $state(
		'Retrouvez ici les informations essentielles et les liens utiles de la communauté.'
	);
	let componentColor = $state('#8b5cf6');
	let componentThumbnailUrl = $state('');
	let componentImageUrl = $state('');
	let componentFooter = $state('');
	let componentButtonLabel = $state('');
	let componentButtonUrl = $state('');
	let ticketPanelTitle = $state('');
	let ticketPanelMessage = $state('');
	let ticketButtonLabel = $state('');
	let ticketButtonEmoji = $state('');
	let ticketButtonStyle = $state('Primary');
	let statsView = $state<'overview' | 'activity' | 'members' | 'channels' | 'users' | 'commands'>(
		'overview'
	);
	let activityPeriod = $state<7 | 30 | 90 | 180 | 360 | 'all'>(30);
	let rankingItems = $state<Array<{ id: string; label: string; count: number }>>([]);
	let rankingLoading = $state(false);
	let rankingError = $state('');

	$effect(() => {
		ticketPanelTitle = data.config.ticketPanelTitle;
		ticketPanelMessage = data.config.ticketPanelMessage;
		ticketButtonLabel = data.config.ticketButtonLabel;
		ticketButtonEmoji = data.config.ticketButtonEmoji;
		ticketButtonStyle = data.config.ticketButtonStyle;
	});

	$effect(() => {
		if (form?.section === 'componentsV2') activeTab = 'componentsV2';
		else if (
			form?.section === 'tickets' ||
			form?.section === 'publishTickets' ||
			form?.section === 'deleteTicketPanel'
		)
			activeTab = 'tickets';
		else if (form?.section === 'reports') activeTab = 'reports';
		else if (form?.section === 'moderation') activeTab = 'moderation';
		else if (form?.section === 'birthdays') activeTab = 'birthdays';
		else if (form?.section === 'logs') activeTab = 'logs';
		else if (form?.section === 'general') activeTab = 'general';
	});

	const ticketButtonClasses: Record<string, string> = {
		Primary: 'bg-indigo-500 text-white',
		Secondary: 'bg-zinc-500 text-white',
		Success: 'bg-emerald-600 text-white',
		Danger: 'bg-red-600 text-white'
	};
	const tabs = [
		['overview', 'Vue d’ensemble', LayoutDashboard],
		['stats', 'Statistiques', ChartNoAxesColumnIncreasing],
		['componentsV2', 'Créateur V2', PanelsTopLeft],
		['general', 'Général', Settings],
		['logs', 'Journaux', ScrollText],
		['moderation', 'Modération', ShieldCheck],
		['birthdays', 'Anniversaires', Cake],
		['reports', 'Signalements', Flag],
		['tickets', 'Tickets', Ticket]
	] as const;
	const numberFormat = new Intl.NumberFormat('fr-FR');
	const serverStats = $derived([
		{
			label: 'Membres',
			value: numberFormat.format(data.stats.memberCount),
			detail: 'Membres du serveur',
			icon: Users
		},
		{
			label: 'En ligne',
			value: numberFormat.format(data.stats.onlineCount),
			detail: 'Estimation Discord',
			icon: Radio
		},
		{
			label: 'Salons textuels',
			value: numberFormat.format(data.stats.textChannelCount),
			detail: `${data.stats.categoryCount} catégorie${data.stats.categoryCount > 1 ? 's' : ''}`,
			icon: Hash
		},
		{
			label: 'Rôles',
			value: numberFormat.format(data.stats.configurableRoleCount),
			detail: 'Rôles configurables',
			icon: Tags
		},
		{
			label: 'Boosts',
			value: numberFormat.format(data.stats.boostCount),
			detail: `Niveau ${data.stats.boostLevel}`,
			icon: Gem
		},
		{
			label: 'Langue Discord',
			value: data.stats.preferredLocale,
			detail: 'Langue préférée du serveur',
			icon: Languages
		}
	]);
	const activityRows = $derived.by(() => {
		const source = new Map(data.activity.map((row) => [row.date, row]));
		const firstDate = data.activity[0]?.date;
		if (!firstDate) return [];
		const dayMs = 24 * 60 * 60 * 1000;
		const todayKey = new Date().toISOString().slice(0, 10);
		const end = Date.parse(`${todayKey}T00:00:00Z`);
		const start =
			activityPeriod === 'all'
				? Date.parse(`${firstDate}T00:00:00Z`)
				: end - (activityPeriod - 1) * dayMs;
		const rows = [];
		for (let timestamp = start; timestamp <= end; timestamp += dayMs) {
			const date = new Date(timestamp).toISOString().slice(0, 10);
			rows.push(source.get(date) ?? { date, messages: 0, commands: 0, users: 0 });
		}
		return rows;
	});
	const activityTotals = $derived({
		messages: activityRows.reduce((total, row) => total + row.messages, 0),
		commands: activityRows.reduce((total, row) => total + row.commands, 0)
	});
	const activityMax = $derived(
		Math.max(1, ...activityRows.flatMap((row) => [row.messages, row.commands]))
	);
	const rankingMax = $derived(Math.max(...rankingItems.map((item) => item.count), 1));
	function activityPoints(metric: 'messages' | 'commands') {
		return activityRows
			.map((row, index) => {
				const x = activityRows.length === 1 ? 400 : (index / (activityRows.length - 1)) * 760 + 20;
				const y = 220 - (row[metric] / activityMax) * 190;
				return `${x},${y}`;
			})
			.join(' ');
	}

	$effect(() => {
		if (!['channels', 'users', 'commands'].includes(statsView)) return;
		const controller = new AbortController();
		rankingLoading = true;
		rankingError = '';
		fetch(`/dashboard/${data.guild.id}/stats?view=${statsView}&days=${activityPeriod}&limit=10`, {
			signal: controller.signal
		})
			.then(async (response) => {
				if (!response.ok) throw new Error('Impossible de charger ce classement.');
				return response.json() as Promise<{
					items: Array<{ id: string; label: string; count: number }>;
				}>;
			})
			.then((result) => {
				rankingItems = result.items;
			})
			.catch((cause) => {
				if (cause instanceof DOMException && cause.name === 'AbortError') return;
				rankingError = cause instanceof Error ? cause.message : 'Une erreur est survenue.';
			})
			.finally(() => {
				if (!controller.signal.aborted) rankingLoading = false;
			});
		return () => controller.abort();
	});

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
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
			<a href={resolve('/dashboard')} class="text-sm text-zinc-400 transition hover:text-white">
				← Tous les serveurs
			</a>
			<ProfileMenu user={data.user} />
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
		<div
			class="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d12] shadow-2xl shadow-black/30"
		>
			<div class="grid min-h-[760px] lg:grid-cols-[240px_minmax(0,1fr)]">
				<aside class="hidden border-r border-white/[0.07] bg-black/10 p-5 lg:block">
					<div class="flex items-center gap-3 px-2 py-2">
						<div
							class="grid size-10 place-items-center rounded-xl bg-violet-500 text-lg font-bold text-white shadow-lg shadow-violet-950/30"
						>
							K
						</div>
						<div>
							<p class="font-semibold">Kepler</p>
							<p class="text-xs text-zinc-600">Configuration</p>
						</div>
					</div>

					<nav class="mt-8 space-y-1.5" aria-label="Configuration">
						{#each tabs as tab (tab[0])}
							{@const Icon = tab[2]}
							<button
								type="button"
								onclick={() => (activeTab = tab[0])}
								class={[
									'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
									activeTab === tab[0]
										? 'bg-violet-500/15 text-violet-300'
										: 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
								]}
							>
								<Icon size={18} strokeWidth={1.8} aria-hidden="true" />
								{tab[1]}
							</button>
						{/each}
					</nav>

					<div class="mt-8 border-t border-white/[0.07] pt-5">
						<a
							href={resolve('/dashboard')}
							class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
						>
							<ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
							Changer de serveur
						</a>
					</div>
				</aside>

				<div class="min-w-0 p-5 sm:p-8 lg:p-10">
					<div class="flex items-center gap-4">
						{#if data.guild.iconUrl}
							<img
								src={data.guild.iconUrl}
								alt=""
								class="size-14 rounded-2xl bg-zinc-900 object-cover"
								referrerpolicy="no-referrer"
							/>
						{:else}
							<div
								class="grid size-14 place-items-center rounded-2xl bg-zinc-800 text-xl font-bold"
							>
								{data.guild.name.slice(0, 1).toUpperCase()}
							</div>
						{/if}
						<div>
							<h1 class="text-xl font-semibold sm:text-2xl">{data.guild.name}</h1>
							<p class="mt-1 flex items-center gap-2 text-sm text-emerald-400">
								<span class="size-2 rounded-full bg-emerald-400"></span>
								Kepler actif
							</p>
						</div>
					</div>

					<nav
						class="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 lg:hidden"
						aria-label="Configuration mobile"
					>
						{#each tabs as tab (tab[0])}
							{@const Icon = tab[2]}
							<button
								type="button"
								onclick={() => (activeTab = tab[0])}
								class={[
									'inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition',
									activeTab === tab[0]
										? 'border-violet-400 text-violet-300'
										: 'border-transparent text-zinc-500'
								]}
							>
								<Icon size={16} strokeWidth={1.8} aria-hidden="true" />
								{tab[1]}
							</button>
						{/each}
					</nav>

					{#if activeTab === 'overview'}
						<section class="mt-10 grid gap-4 sm:grid-cols-3">
							<div class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
								<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">
									Base de données
								</p>
								<p class="mt-3 font-semibold">
									{data.config.exists ? 'Configuration trouvée' : 'À initialiser'}
								</p>
							</div>
							<div class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
								<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">
									Fuseau horaire
								</p>
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
					{/if}

					{#if activeTab === 'stats'}
						<section class="mt-10">
							<div>
								<p class="text-sm font-medium text-violet-300">Statistiques</p>
								<h2 class="mt-2 text-2xl font-semibold">Analyse du serveur</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Retrouvez les données suivies par Kepler et les informations fournies par Discord.
								</p>
							</div>

							<div
								class="mt-6 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/15 p-1"
							>
								{#each [['overview', 'Vue d’ensemble'], ['activity', 'Activité'], ['members', 'Membres'], ['channels', 'Canaux'], ['users', 'Utilisateurs'], ['commands', 'Commandes']] as view (view[0])}
									<button
										type="button"
										onclick={() => (statsView = view[0] as typeof statsView)}
										class={[
											'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition',
											statsView === view[0]
												? 'bg-violet-500/15 text-violet-300'
												: 'text-zinc-500 hover:text-zinc-200'
										]}
									>
										{view[1]}
									</button>
								{/each}
							</div>

							{#if statsView === 'overview'}
								<div class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
									{#each serverStats as stat (stat.label)}
										{@const Icon = stat.icon}
										<article class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
											<div class="flex items-start justify-between gap-4">
												<div>
													<p class="text-xs font-medium tracking-wider text-zinc-500 uppercase">
														{stat.label}
													</p>
													<p class="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
													<p class="mt-2 text-sm text-zinc-600">{stat.detail}</p>
												</div>
												<div
													class="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300"
												>
													<Icon size={20} strokeWidth={1.8} aria-hidden="true" />
												</div>
											</div>
										</article>
									{/each}
								</div>

								<div
									class="mt-5 rounded-2xl border border-white/[0.07] bg-black/10 px-5 py-4 text-sm text-zinc-500"
								>
									Les informations Discord sont conservées cinq minutes pour limiter les appels à
									l’API. Le nombre de membres en ligne reste une estimation fournie par Discord.
								</div>
							{:else if statsView === 'activity'}
								<div class="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
									<div class="flex flex-wrap items-start justify-between gap-5">
										<div class="flex gap-8">
											<div>
												<p class="text-xs tracking-wider text-zinc-500 uppercase">Messages</p>
												<p class="mt-2 text-2xl font-semibold">
													{numberFormat.format(activityTotals.messages)}
												</p>
											</div>
											<div>
												<p class="text-xs tracking-wider text-zinc-500 uppercase">Commandes</p>
												<p class="mt-2 text-2xl font-semibold">
													{numberFormat.format(activityTotals.commands)}
												</p>
											</div>
										</div>
										<div class="flex gap-1 rounded-lg bg-black/20 p-1">
											{#each [7, 30, 90, 180, 360, 'all'] as period (period)}
												<button
													type="button"
													onclick={() => (activityPeriod = period as typeof activityPeriod)}
													class={[
														'rounded-md px-3 py-1.5 text-xs font-medium transition',
														activityPeriod === period
															? 'bg-white/10 text-white'
															: 'text-zinc-600 hover:text-zinc-300'
													]}
												>
													{period === 'all' ? 'Tout' : `${period} j`}
												</button>
											{/each}
										</div>
									</div>

									{#if activityRows.length}
										<div class="mt-8 overflow-hidden rounded-xl bg-black/15 p-3">
											<svg
												viewBox="0 0 800 240"
												class="h-auto w-full"
												role="img"
												aria-label="Évolution quotidienne des messages et commandes"
											>
												{#each [30, 77.5, 125, 172.5, 220] as y (y)}
													<line
														x1="20"
														x2="780"
														y1={y}
														y2={y}
														stroke="rgba(255,255,255,0.06)"
														stroke-width="1"
													/>
												{/each}
												<polyline
													points={activityPoints('messages')}
													fill="none"
													stroke="#8b5cf6"
													stroke-width="4"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												<polyline
													points={activityPoints('commands')}
													fill="none"
													stroke="#34d399"
													stroke-width="4"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												{#each activityRows as row, index (row.date)}
													{@const x =
														activityRows.length === 1
															? 400
															: (index / (activityRows.length - 1)) * 760 + 20}
													{@const messageY = 220 - (row.messages / activityMax) * 190}
													{@const commandY = 220 - (row.commands / activityMax) * 190}
													<circle
														cx={x}
														cy={messageY}
														r={activityRows.length > 100 ? 2 : 3.5}
														fill="#8b5cf6"
													>
														<title
															>{new Date(row.date).toLocaleDateString('fr-FR')} — {row.messages} messages</title
														>
													</circle>
													<circle
														cx={x}
														cy={commandY}
														r={activityRows.length > 100 ? 2 : 3.5}
														fill="#34d399"
													>
														<title
															>{new Date(row.date).toLocaleDateString('fr-FR')} — {row.commands} commandes</title
														>
													</circle>
												{/each}
											</svg>
											<div class="flex justify-between px-2 text-[10px] text-zinc-600">
												<span>{new Date(activityRows[0].date).toLocaleDateString('fr-FR')}</span>
												<span
													>{new Date(
														activityRows[Math.floor(activityRows.length / 2)].date
													).toLocaleDateString('fr-FR')}</span
												>
												<span
													>{new Date(activityRows[activityRows.length - 1].date).toLocaleDateString(
														'fr-FR'
													)}</span
												>
											</div>
										</div>
										<div class="mt-4 flex flex-wrap gap-5 text-xs text-zinc-500">
											<span class="flex items-center gap-2">
												<span class="size-2 rounded-full bg-violet-500"></span> Messages
											</span>
											<span class="flex items-center gap-2">
												<span class="size-2 rounded-full bg-emerald-400"></span> Commandes
											</span>
										</div>
									{:else}
										<div
											class="mt-8 rounded-xl border border-dashed border-white/10 px-5 py-12 text-center text-sm text-zinc-500"
										>
											Aucune activité enregistrée sur cette période.
										</div>
									{/if}
								</div>
							{:else if statsView === 'members'}
								<div class="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
									<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
										<p class="text-sm font-semibold">Présence des membres</p>
										<div class="mt-8 space-y-6">
											<div>
												<div class="flex justify-between text-sm">
													<span class="text-zinc-400">Membres</span>
													<strong>{numberFormat.format(data.stats.memberCount)}</strong>
												</div>
												<div class="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
													<div class="h-full w-full rounded-full bg-violet-500"></div>
												</div>
											</div>
											<div>
												<div class="flex justify-between text-sm">
													<span class="text-zinc-400">En ligne</span>
													<strong>{numberFormat.format(data.stats.onlineCount)}</strong>
												</div>
												<div class="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
													<div
														class="h-full rounded-full bg-emerald-400"
														style:width={`${Math.min(100, (data.stats.onlineCount / Math.max(1, data.stats.memberCount)) * 100)}%`}
													></div>
												</div>
											</div>
										</div>
									</div>
									<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
										<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
											<p class="text-xs tracking-wider text-zinc-500 uppercase">Taux en ligne</p>
											<p class="mt-3 text-3xl font-semibold">
												{Math.round(
													(data.stats.onlineCount / Math.max(1, data.stats.memberCount)) * 100
												)} %
											</p>
										</div>
										<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
											<p class="text-xs tracking-wider text-zinc-500 uppercase">Boosts</p>
											<p class="mt-3 text-3xl font-semibold">{data.stats.boostCount}</p>
											<p class="mt-2 text-sm text-zinc-600">Niveau {data.stats.boostLevel}</p>
										</div>
									</div>
								</div>
							{:else}
								<div class="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
									<div class="flex flex-wrap items-center justify-between gap-4">
										<div>
											<h3 class="font-semibold">
												{statsView === 'channels'
													? 'Canaux les plus actifs'
													: statsView === 'users'
														? 'Utilisateurs les plus actifs'
														: 'Commandes les plus utilisées'}
											</h3>
											<p class="mt-1 text-sm text-zinc-500">Classement par volume d’activité.</p>
										</div>
										<div class="flex gap-1 rounded-lg bg-black/20 p-1">
											{#each [7, 30, 90, 180, 360, 'all'] as period (period)}
												<button
													type="button"
													onclick={() => (activityPeriod = period as typeof activityPeriod)}
													class={[
														'rounded-md px-2.5 py-1.5 text-xs font-medium transition',
														activityPeriod === period
															? 'bg-white/10 text-white'
															: 'text-zinc-600 hover:text-zinc-300'
													]}
												>
													{period === 'all' ? 'Tout' : `${period} j`}
												</button>
											{/each}
										</div>
									</div>

									{#if rankingLoading}
										<div class="mt-8 space-y-3">
											{#each [1, 2, 3, 4, 5, 6] as skeleton (skeleton)}
												<div class="h-12 animate-pulse rounded-lg bg-white/[0.04]"></div>
											{/each}
										</div>
									{:else if rankingError}
										<div class="mt-8 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-300">
											{rankingError}
										</div>
									{:else if rankingItems.length}
										<div class="mt-8 space-y-4">
											{#each rankingItems as item, index (item.id)}
												<div
													class="grid gap-2 sm:grid-cols-[minmax(140px,220px)_1fr_80px] sm:items-center"
												>
													<div class="flex min-w-0 items-center gap-3">
														<span class="w-5 text-xs text-zinc-600">{index + 1}</span>
														<span class="truncate text-sm font-medium">{item.label}</span>
													</div>
													<div class="h-3 overflow-hidden rounded-full bg-white/[0.06]">
														<div
															class="h-full min-w-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
															style:width={`${(item.count / rankingMax) * 100}%`}
														></div>
													</div>
													<p class="text-right text-sm text-zinc-400">
														{numberFormat.format(item.count)}
													</p>
												</div>
											{/each}
										</div>
									{:else}
										<div class="mt-8 py-12 text-center text-sm text-zinc-500">
											Aucune donnée enregistrée sur cette période.
										</div>
									{/if}
								</div>
							{/if}
						</section>
					{/if}

					{#if activeTab === 'general'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Réglages généraux</p>
								<h2 class="mt-2 text-2xl font-semibold">Fuseau horaire du serveur</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Kepler utilise ce fuseau pour les annonces et les fonctionnalités planifiées.
								</p>
							</div>

							{#if form?.section === 'general' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/general" class="mt-7 grid max-w-xl gap-5">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Fuseau horaire</span>
									<select
										name="timezone"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										{#each data.timezones as timezone (timezone)}
											<option value={timezone} selected={timezone === data.config.timezone}
												>{timezone}</option
											>
										{/each}
									</select>
								</label>

								<div>
									<button
										type="submit"
										class="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
									>
										Enregistrer le fuseau horaire
									</button>
								</div>
							</form>
						</section>
					{/if}

					{#if activeTab === 'logs'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Module Journaux</p>
								<h2 class="mt-2 text-2xl font-semibold">Activité du serveur</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Choisis le canal dans lequel Kepler publiera les événements du serveur.
								</p>
							</div>

							{#if form?.section === 'logs' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/logs" class="mt-7 grid max-w-xl gap-5">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal des journaux</span>
									<select
										name="log_channel_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Non configuré — désactiver</option>
										{#each data.channels as channel (channel.id)}
											<option value={channel.id} selected={channel.id === data.config.logChannelId}>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>
								<button
									type="submit"
									class="w-fit rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
								>
									Enregistrer les journaux
								</button>
							</form>
						</section>
					{/if}

					{#if activeTab === 'moderation'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Module Modération</p>
								<h2 class="mt-2 text-2xl font-semibold">Sanctions et notifications</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Configure le canal de suivi et le rôle appliqué aux membres rendus muets.
								</p>
							</div>

							{#if form?.section === 'moderation' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/moderation" class="mt-7 grid gap-5 md:grid-cols-2">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal de modération</span>
									<select
										name="moderation_channel_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Non configuré</option>
										{#each data.channels as channel (channel.id)}
											<option
												value={channel.id}
												selected={channel.id === data.config.moderationChannelId}
											>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Rôle muet</span>
									<select
										name="mute_role_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Non configuré</option>
										{#each data.roles as role (role.id)}
											<option value={role.id} selected={role.id === data.config.muteRoleId}>
												@{role.name}
											</option>
										{/each}
									</select>
								</label>
								<button
									type="submit"
									class="w-fit rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 md:col-span-2"
								>
									Enregistrer la modération
								</button>
							</form>
						</section>
					{/if}

					{#if activeTab === 'birthdays'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Module Anniversaires</p>
								<h2 class="mt-2 text-2xl font-semibold">Annonces automatiques</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Choisis le canal dans lequel Kepler souhaitera les anniversaires.
								</p>
							</div>

							{#if form?.section === 'birthdays' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/birthdays" class="mt-7 grid max-w-xl gap-5">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal des anniversaires</span>
									<select
										name="birthday_channel_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Non configuré — désactiver</option>
										{#each data.channels as channel (channel.id)}
											<option
												value={channel.id}
												selected={channel.id === data.config.birthdayChannelId}
											>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>
								<button
									type="submit"
									class="w-fit rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
								>
									Enregistrer les anniversaires
								</button>
							</form>
						</section>
					{/if}

					{#if activeTab === 'reports'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Module Signalements</p>
								<h2 class="mt-2 text-2xl font-semibold">Traitement des signalements</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Choisis le canal qui recevra les signalements et, si besoin, le rôle à notifier.
								</p>
							</div>

							{#if form?.section === 'reports' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/reports" class="mt-7 grid gap-5 md:grid-cols-2">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal des signalements</span>
									<select
										name="report_channel_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Non configuré — désactiver le module</option>
										{#each data.channels as channel (channel.id)}
											<option
												value={channel.id}
												selected={channel.id === data.config.reportChannelId}
											>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>

								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Rôle à notifier (facultatif)</span>
									<select
										name="report_role_id"
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="">Aucun rôle</option>
										{#each data.roles as role (role.id)}
											<option value={role.id} selected={role.id === data.config.reportRoleId}>
												@{role.name}
											</option>
										{/each}
									</select>
								</label>

								<p class="text-sm leading-6 text-zinc-500 md:col-span-2">
									Sans rôle sélectionné, Kepler enverra seulement le signalement dans le canal
									choisi.
								</p>

								<div class="md:col-span-2">
									<button
										type="submit"
										class="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
									>
										Enregistrer les signalements
									</button>
								</div>
							</form>
						</section>
					{/if}

					{#if activeTab === 'componentsV2'}
						<section class="mt-10">
							<div>
								<p class="text-sm font-medium text-violet-300">Messages Discord</p>
								<h2 class="mt-2 text-2xl font-semibold">Créateur Components V2</h2>
								<p class="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
									Compose un message moderne, visualise son rendu puis publie-le directement avec
									Kepler. Les mentions sont neutralisées lors de l’envoi.
								</p>
							</div>

							{#if form?.section === 'componentsV2' && form.message}
								<div
									class={[
										'mt-6 rounded-xl border px-4 py-3 text-sm',
										form.success
											? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
											: 'border-red-400/20 bg-red-400/10 text-red-300'
									]}
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<div
								class="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]"
							>
								<form
									method="POST"
									action="?/publishComponentsV2"
									class="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
								>
									<label class="grid gap-2 text-sm">
										<span class="font-medium text-zinc-300">Salon de publication</span>
										<select
											name="channel_id"
											required
											class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
										>
											<option value="" disabled selected>Sélectionner un salon</option>
											{#each data.channels as channel (channel.id)}
												<option value={channel.id}>#{channel.name}</option>
											{/each}
										</select>
									</label>

									<div class="grid gap-5 sm:grid-cols-[minmax(0,1fr)_8rem]">
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">Titre</span>
											<input
												name="title"
												required
												maxlength="200"
												bind:value={componentTitle}
												class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
											/>
										</label>
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">Accent</span>
											<input
												name="accent_color"
												type="color"
												bind:value={componentColor}
												class="h-[46px] w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-1.5"
											/>
										</label>
									</div>

									<label class="grid gap-2 text-sm">
										<span class="flex items-center justify-between gap-3 font-medium text-zinc-300">
											Contenu Markdown
											<span class="text-xs font-normal text-zinc-600">
												{componentDescription.length}/3500
											</span>
										</span>
										<textarea
											name="description"
											required
											maxlength="3500"
											rows="8"
											bind:value={componentDescription}
											class="resize-y rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
										></textarea>
										<span class="text-xs text-zinc-600">
											Discord interprétera le gras, les listes, les liens et les autres éléments
											Markdown.
										</span>
									</label>

									<div class="grid gap-5 md:grid-cols-2">
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">URL de la miniature</span>
											<input
												name="thumbnail_url"
												type="url"
												placeholder="https://…"
												bind:value={componentThumbnailUrl}
												class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
											/>
										</label>
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">URL de la bannière</span>
											<input
												name="image_url"
												type="url"
												placeholder="https://…"
												bind:value={componentImageUrl}
												class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
											/>
										</label>
									</div>

									<label class="grid gap-2 text-sm">
										<span class="font-medium text-zinc-300">Texte secondaire</span>
										<input
											name="footer"
											maxlength="300"
											placeholder="Informations complémentaires"
											bind:value={componentFooter}
											class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
										/>
									</label>

									<div class="grid gap-5 border-t border-white/[0.07] pt-5 md:grid-cols-2">
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">Texte du bouton-lien</span>
											<input
												name="button_label"
												maxlength="80"
												placeholder="En savoir plus"
												bind:value={componentButtonLabel}
												class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
											/>
										</label>
										<label class="grid gap-2 text-sm">
											<span class="font-medium text-zinc-300">URL du bouton</span>
											<input
												name="button_url"
												type="url"
												placeholder="https://…"
												bind:value={componentButtonUrl}
												class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
											/>
										</label>
									</div>

									<div class="flex flex-wrap items-center justify-between gap-4 pt-2">
										<p class="max-w-md text-xs leading-5 text-zinc-600">
											La publication est immédiate et ne remplace aucun message existant.
										</p>
										<button
											type="submit"
											class="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
										>
											Publier dans Discord
										</button>
									</div>
								</form>

								<div class="xl:sticky xl:top-6">
									<p class="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
										Aperçu Discord
									</p>
									<div class="rounded-2xl border border-white/[0.08] bg-[#313338] p-4 shadow-2xl">
										<div class="flex items-start gap-3">
											<div
												class="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500 font-bold text-white"
											>
												K
											</div>
											<div class="min-w-0 flex-1">
												<div class="flex flex-wrap items-center gap-2">
													<span class="font-medium text-white">Kepler</span>
													<span
														class="rounded bg-[#5865f2] px-1 text-[10px] font-semibold text-white"
													>
														APP
													</span>
													<span class="text-xs text-[#949ba4]">Aujourd’hui à 12:00</span>
												</div>

												<div
													class="relative mt-2 overflow-hidden rounded-lg border border-black/20 bg-[#2b2d31] p-4"
													style={`border-left: 4px solid ${componentColor}`}
												>
													<div class="flex gap-4">
														<div class="min-w-0 flex-1">
															<p class="text-lg font-semibold text-white">
																{componentTitle || 'Titre du message'}
															</p>
															<p class="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#dbdee1]">
																{componentDescription || 'Contenu du message'}
															</p>
														</div>
														{#if componentThumbnailUrl}
															<img
																src={componentThumbnailUrl}
																alt=""
																class="size-20 shrink-0 rounded-lg object-cover"
																referrerpolicy="no-referrer"
															/>
														{/if}
													</div>

													{#if componentImageUrl}
														<div class="mt-4 border-t border-white/10 pt-4">
															<img
																src={componentImageUrl}
																alt=""
																class="max-h-72 w-full rounded-lg object-cover"
																referrerpolicy="no-referrer"
															/>
														</div>
													{/if}

													{#if componentFooter}
														<p class="mt-4 border-t border-white/10 pt-3 text-xs text-[#949ba4]">
															{componentFooter}
														</p>
													{/if}

													{#if componentButtonLabel}
														<span
															class="mt-4 inline-flex rounded bg-[#4e5058] px-4 py-2 text-sm font-medium text-white"
														>
															{componentButtonLabel}
														</span>
													{/if}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>
					{/if}

					{#if activeTab === 'tickets'}
						<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
							<div>
								<p class="text-sm font-medium text-violet-300">Module Tickets</p>
								<h2 class="mt-2 text-2xl font-semibold">Support et panneau public</h2>
								<p class="mt-2 text-sm text-zinc-500">
									Configure la création des salons privés et personnalise le bouton affiché aux
									membres.
								</p>
							</div>

							{#if form?.section === 'tickets' && form.message}
								<div
									class="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
									role="status"
								>
									{form.message}
								</div>
							{/if}

							<form method="POST" action="?/tickets" class="mt-7 grid gap-5 md:grid-cols-2">
								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal du panneau</span>
									<select
										name="ticket_panel_channel_id"
										required
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="" disabled>Sélectionner un canal</option>
										{#each data.channels as channel (channel.id)}
											<option
												value={channel.id}
												selected={channel.id === data.config.ticketPanelChannelId}
											>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>

								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Catégorie des tickets</span>
									<select
										name="ticket_category_id"
										required
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="" disabled>Sélectionner une catégorie</option>
										{#each data.categories as category (category.id)}
											<option
												value={category.id}
												selected={category.id === data.config.ticketCategoryId}
											>
												{category.name}
											</option>
										{/each}
									</select>
								</label>

								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Canal des journaux</span>
									<select
										name="ticket_log_channel_id"
										required
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="" disabled>Sélectionner un canal</option>
										{#each data.channels as channel (channel.id)}
											<option
												value={channel.id}
												selected={channel.id === data.config.ticketLogChannelId}
											>
												#{channel.name}
											</option>
										{/each}
									</select>
								</label>

								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Rôle support</span>
									<select
										name="ticket_support_role_id"
										required
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									>
										<option value="" disabled>Sélectionner un rôle</option>
										{#each data.roles as role (role.id)}
											<option
												value={role.id}
												selected={role.id === data.config.ticketSupportRoleId}
											>
												@{role.name}
											</option>
										{/each}
									</select>
								</label>

								<label class="grid gap-2 text-sm md:col-span-2">
									<span class="font-medium text-zinc-300">Titre du panneau</span>
									<input
										name="ticket_panel_title"
										required
										maxlength="256"
										bind:value={ticketPanelTitle}
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									/>
								</label>

								<label class="grid gap-2 text-sm md:col-span-2">
									<span class="font-medium text-zinc-300">Message du panneau</span>
									<textarea
										name="ticket_panel_message"
										required
										maxlength="2000"
										rows="4"
										bind:value={ticketPanelMessage}
										class="resize-y rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									></textarea>
								</label>

								<label class="grid gap-2 text-sm">
									<span class="font-medium text-zinc-300">Texte du bouton</span>
									<input
										name="ticket_button_label"
										required
										maxlength="80"
										bind:value={ticketButtonLabel}
										class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
									/>
								</label>

								<div class="grid grid-cols-[0.65fr_1.35fr] gap-4">
									<label class="grid gap-2 text-sm">
										<span class="font-medium text-zinc-300">Emoji</span>
										<input
											name="ticket_button_emoji"
											maxlength="100"
											bind:value={ticketButtonEmoji}
											class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
										/>
									</label>
									<label class="grid gap-2 text-sm">
										<span class="font-medium text-zinc-300">Style</span>
										<select
											name="ticket_button_style"
											bind:value={ticketButtonStyle}
											class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
										>
											{#each data.ticketStyles as style (style)}
												<option value={style}>{style}</option>
											{/each}
										</select>
									</label>
								</div>

								<div class="md:col-span-2">
									<button
										type="submit"
										class="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
									>
										Enregistrer les tickets
									</button>
								</div>
							</form>

							<div class="mt-8 border-t border-white/10 pt-7">
								<h3 class="font-semibold">Aperçu du panneau</h3>
								<p class="mt-2 text-sm text-zinc-500">
									L’aperçu se met à jour pendant la saisie. Discord ajoutera la date de publication.
								</p>

								<div class="mt-5 max-w-2xl rounded-lg bg-[#313338] p-4 text-[#dbdee1]">
									<div class="border-l-4 border-[#5f91c4] bg-[#2b2d31] px-4 py-3">
										<p class="font-semibold text-white">{ticketPanelTitle || 'Titre du panneau'}</p>
										<p class="mt-2 text-sm whitespace-pre-wrap">
											{ticketPanelMessage || 'Message du panneau'}
										</p>
										<p class="mt-4 text-xs text-[#949ba4]">{data.guild.name}</p>
									</div>
									<button
										type="button"
										class={[
											'mt-3 rounded px-4 py-2 text-sm font-medium',
											ticketButtonClasses[ticketButtonStyle] || ticketButtonClasses.Primary
										]}
									>
										{ticketButtonEmoji ? `${ticketButtonEmoji} ` : ''}{ticketButtonLabel ||
											'Bouton du panneau'}
									</button>
								</div>
							</div>

							<div class="mt-8 border-t border-white/10 pt-7">
								<div class="flex flex-wrap items-center justify-between gap-5">
									<div>
										<h3 class="font-semibold">Publication Discord</h3>
										<p class="mt-2 max-w-2xl text-sm text-zinc-500">
											{#if data.config.ticketPanelMessageId}
												Un panneau est publié dans
												<strong class="font-medium text-zinc-300">
													#{data.channels.find(
														(channel) => channel.id === data.config.ticketPanelPublishedChannelId
													)?.name || 'canal inconnu'}
												</strong>. Sa prochaine publication remplacera ce message.
											{:else}
												Aucun panneau publié n’est actuellement mémorisé.
											{/if}
										</p>
									</div>

									<div class="flex flex-wrap gap-3">
										<form
											method="POST"
											action="?/publishTickets"
											onsubmit={(event) => {
												const message = data.config.ticketPanelMessageId
													? 'Remplacer le panneau de tickets actuellement publié ?'
													: 'Publier le panneau de tickets dans Discord ?';
												if (!confirm(message)) event.preventDefault();
											}}
										>
											<button
												type="submit"
												class="rounded-xl border border-violet-400/30 bg-violet-400/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20"
											>
												{data.config.ticketPanelMessageId
													? 'Remplacer le panneau'
													: 'Publier le panneau'}
											</button>
										</form>

										{#if data.config.ticketPanelMessageId}
											<form
												method="POST"
												action="?/deleteTicketPanel"
												onsubmit={(event) => {
													if (
														!confirm('Supprimer définitivement le panneau publié dans Discord ?')
													) {
														event.preventDefault();
													}
												}}
											>
												<button
													type="submit"
													class="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
												>
													Supprimer le panneau
												</button>
											</form>
										{/if}
									</div>
								</div>

								{#if (form?.section === 'publishTickets' || form?.section === 'deleteTicketPanel') && form.message}
									<div
										class={[
											'mt-5 rounded-xl border px-4 py-3 text-sm',
											form.success
												? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
												: 'border-red-400/20 bg-red-400/10 text-red-300'
										]}
										role="status"
									>
										{form.message}
									</div>
								{/if}
							</div>
						</section>
					{/if}
				</div>
			</div>
		</div>
	</main>
	<SiteFooter compact />
</div>
