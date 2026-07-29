import { getBotToken } from '$lib/server/auth/config';
import { getBotGuildIds, getManageableGuilds } from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import { getServerConfig } from '$lib/server/database/supabase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const manageableGuilds = await getManageableGuilds(session.accessToken);
	const guild = manageableGuilds.find((candidate) => candidate.id === params.guildId);
	if (!guild) error(403, "Tu n'as pas la permission de gérer ce serveur.");

	const botGuildIds = await getBotGuildIds(getBotToken());
	if (!botGuildIds.has(guild.id)) error(404, "Kepler n'est pas installé sur ce serveur.");

	let serverConfig;
	try {
		serverConfig = await getServerConfig(guild.id);
	} catch (cause) {
		console.error('Unable to read server config from Supabase', cause);
		error(502, 'Impossible de lire la configuration du serveur pour le moment.');
	}

	return {
		guild: {
			id: guild.id,
			name: guild.name,
			iconUrl: guild.icon
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
				: null
		},
		config: {
			exists: serverConfig !== null,
			logsConfigured: Boolean(serverConfig?.log_channel_id),
			birthdaysConfigured: Boolean(serverConfig?.birthday_channel_id),
			moderationConfigured: Boolean(serverConfig?.moderation_channel_id),
			muteConfigured: Boolean(serverConfig?.mute_role_id),
			reportsConfigured: Boolean(serverConfig?.report_channel_id && serverConfig?.report_role_id),
			ticketsConfigured: Boolean(
				serverConfig?.ticket_panel_channel_id &&
				serverConfig?.ticket_category_id &&
				serverConfig?.ticket_log_channel_id &&
				serverConfig?.ticket_support_role_id
			),
			timezone: serverConfig?.timezone || 'Europe/Paris',
			updatedAt: serverConfig?.updated_at || null
		}
	};
};
