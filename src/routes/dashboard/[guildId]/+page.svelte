<script lang="ts">
	import { resolve } from '$app/paths';
	import ProfileMenu from '$lib/components/ProfileMenu.svelte';

	let { data, form } = $props();
	let activeTab = $state<'overview' | 'general' | 'reports' | 'tickets'>('overview');
	let ticketPanelTitle = $state('');
	let ticketPanelMessage = $state('');
	let ticketButtonLabel = $state('');
	let ticketButtonEmoji = $state('');
	let ticketButtonStyle = $state('Primary');

	$effect(() => {
		ticketPanelTitle = data.config.ticketPanelTitle;
		ticketPanelMessage = data.config.ticketPanelMessage;
		ticketButtonLabel = data.config.ticketButtonLabel;
		ticketButtonEmoji = data.config.ticketButtonEmoji;
		ticketButtonStyle = data.config.ticketButtonStyle;
	});

	$effect(() => {
		if (
			form?.section === 'tickets' ||
			form?.section === 'publishTickets' ||
			form?.section === 'deleteTicketPanel'
		)
			activeTab = 'tickets';
		else if (form?.section === 'reports') activeTab = 'reports';
		else if (form?.section === 'general') activeTab = 'general';
	});

	const ticketButtonClasses: Record<string, string> = {
		Primary: 'bg-indigo-500 text-white',
		Secondary: 'bg-zinc-500 text-white',
		Success: 'bg-emerald-600 text-white',
		Danger: 'bg-red-600 text-white'
	};

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
			<ProfileMenu user={data.user} />
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

		<nav
			class="mt-10 flex gap-1 overflow-x-auto border-b border-white/10"
			aria-label="Configuration"
		>
			{#each [['overview', 'Vue d’ensemble'], ['general', 'Général'], ['reports', 'Signalements'], ['tickets', 'Tickets']] as tab (tab[0])}
				<button
					type="button"
					onclick={() => (activeTab = tab[0] as typeof activeTab)}
					class={[
						'border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition',
						activeTab === tab[0]
							? 'border-violet-400 text-violet-300'
							: 'border-transparent text-zinc-500 hover:text-zinc-200'
					]}
				>
					{tab[1]}
				</button>
			{/each}
		</nav>

		{#if activeTab === 'overview'}
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
		{/if}

		{#if activeTab === 'general'}
			<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
				<div>
					<p class="text-sm font-medium text-violet-300">Réglages généraux</p>
					<h2 class="mt-2 text-2xl font-semibold">Canaux, rôle et fuseau horaire</h2>
					<p class="mt-2 text-sm text-zinc-500">
						Les options sont chargées directement depuis Discord et validées avant enregistrement.
					</p>
				</div>

				{#if form?.message}
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

				<form method="POST" action="?/general" class="mt-7 grid gap-5 md:grid-cols-2">
					<label class="grid gap-2 text-sm">
						<span class="font-medium text-zinc-300">Canal des journaux</span>
						<select
							name="log_channel_id"
							class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
						>
							<option value="">Non configuré</option>
							{#each data.channels as channel (channel.id)}
								<option value={channel.id} selected={channel.id === data.config.logChannelId}>
									#{channel.name}
								</option>
							{/each}
						</select>
					</label>

					<label class="grid gap-2 text-sm">
						<span class="font-medium text-zinc-300">Canal des anniversaires</span>
						<select
							name="birthday_channel_id"
							class="rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-100 transition outline-none focus:border-violet-400/60"
						>
							<option value="">Non configuré</option>
							{#each data.channels as channel (channel.id)}
								<option value={channel.id} selected={channel.id === data.config.birthdayChannelId}>
									#{channel.name}
								</option>
							{/each}
						</select>
					</label>

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

					<label class="grid gap-2 text-sm md:col-span-2">
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

					<div class="md:col-span-2">
						<button
							type="submit"
							class="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
						>
							Enregistrer les réglages
						</button>
					</div>
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
								<option value={channel.id} selected={channel.id === data.config.reportChannelId}>
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
						Sans rôle sélectionné, Kepler enverra seulement le signalement dans le canal choisi.
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

		{#if activeTab === 'tickets'}
			<section class="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
				<div>
					<p class="text-sm font-medium text-violet-300">Module Tickets</p>
					<h2 class="mt-2 text-2xl font-semibold">Support et panneau public</h2>
					<p class="mt-2 text-sm text-zinc-500">
						Configure la création des salons privés et personnalise le bouton affiché aux membres.
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
								<option value={category.id} selected={category.id === data.config.ticketCategoryId}>
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
								<option value={channel.id} selected={channel.id === data.config.ticketLogChannelId}>
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
								<option value={role.id} selected={role.id === data.config.ticketSupportRoleId}>
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
									{data.config.ticketPanelMessageId ? 'Remplacer le panneau' : 'Publier le panneau'}
								</button>
							</form>

							{#if data.config.ticketPanelMessageId}
								<form
									method="POST"
									action="?/deleteTicketPanel"
									onsubmit={(event) => {
										if (!confirm('Supprimer définitivement le panneau publié dans Discord ?')) {
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
	</main>
</div>
