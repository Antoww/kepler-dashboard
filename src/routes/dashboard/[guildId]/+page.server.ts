import { getBotToken } from '$lib/server/auth/config';
import {
	getBotGuildIds,
	getGuildChannels,
	getGuildRoles,
	getManageableGuilds
} from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import { getServerConfig, updateGeneralConfig } from '$lib/server/database/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const TIMEZONES = [
	'Europe/Paris',
	'Europe/London',
	'Europe/Brussels',
	'Europe/Zurich',
	'America/Montreal',
	'America/New_York',
	'America/Los_Angeles',
	'Asia/Tokyo',
	'Australia/Sydney',
	'UTC'
];

export const load: PageServerLoad = async ({ cookies, params }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const manageableGuilds = await getManageableGuilds(session.accessToken);
	const guild = manageableGuilds.find((candidate) => candidate.id === params.guildId);
	if (!guild) error(403, "Tu n'as pas la permission de gérer ce serveur.");

	const botToken = getBotToken();
	const botGuildIds = await getBotGuildIds(botToken);
	if (!botGuildIds.has(guild.id)) error(404, "Kepler n'est pas installé sur ce serveur.");

	const [channels, roles] = await Promise.all([
		getGuildChannels(guild.id, botToken),
		getGuildRoles(guild.id, botToken)
	]);

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
			updatedAt: serverConfig?.updated_at || null,
			logChannelId: serverConfig?.log_channel_id || '',
			birthdayChannelId: serverConfig?.birthday_channel_id || '',
			moderationChannelId: serverConfig?.moderation_channel_id || '',
			muteRoleId: serverConfig?.mute_role_id || ''
		},
		channels: channels.map(({ id, name }) => ({ id, name })),
		roles: roles.map(({ id, name }) => ({ id, name })),
		timezones: TIMEZONES
	};
};

export const actions: Actions = {
	general: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		const manageableGuilds = await getManageableGuilds(session.accessToken);
		if (!manageableGuilds.some((guild) => guild.id === guildId)) {
			return fail(403, { message: "Tu n'as plus la permission de gérer ce serveur." });
		}

		const botToken = getBotToken();
		const botGuildIds = await getBotGuildIds(botToken);
		if (!botGuildIds.has(guildId)) {
			return fail(404, { message: "Kepler n'est plus présent sur ce serveur." });
		}

		const formData = await request.formData();
		const readValue = (name: string) => String(formData.get(name) || '');
		const logChannelId = readValue('log_channel_id');
		const birthdayChannelId = readValue('birthday_channel_id');
		const moderationChannelId = readValue('moderation_channel_id');
		const muteRoleId = readValue('mute_role_id');
		const timezone = readValue('timezone');
		const [channels, roles] = await Promise.all([
			getGuildChannels(guildId, botToken),
			getGuildRoles(guildId, botToken)
		]);
		const channelIds = new Set(channels.map((channel) => channel.id));
		const roleIds = new Set(roles.map((role) => role.id));
		const validOptionalId = (value: string, allowedIds: Set<string>) =>
			value === '' || allowedIds.has(value);

		if (
			!validOptionalId(logChannelId, channelIds) ||
			!validOptionalId(birthdayChannelId, channelIds) ||
			!validOptionalId(moderationChannelId, channelIds) ||
			!validOptionalId(muteRoleId, roleIds) ||
			!TIMEZONES.includes(timezone)
		) {
			return fail(400, { message: 'Une des valeurs sélectionnées est invalide.' });
		}

		try {
			await updateGeneralConfig(guildId, {
				log_channel_id: logChannelId || null,
				birthday_channel_id: birthdayChannelId || null,
				moderation_channel_id: moderationChannelId || null,
				mute_role_id: muteRoleId || null,
				timezone
			});
		} catch (cause) {
			console.error('Unable to update general server config', cause);
			return fail(502, { message: "La configuration n'a pas pu être enregistrée." });
		}

		return { success: true, message: 'Configuration générale enregistrée.' };
	}
};
