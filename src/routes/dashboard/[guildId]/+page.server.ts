import { getBotToken } from '$lib/server/auth/config';
import {
	deleteDiscordMessage,
	getBotGuildIds,
	getGuildCategories,
	getGuildChannels,
	getGuildRoles,
	getManageableGuilds,
	publishTicketPanel
} from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import {
	getServerConfig,
	updateGeneralConfig,
	updatePublishedTicketPanel,
	updateTicketConfig
} from '$lib/server/database/supabase';
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
const TICKET_STYLES = ['Primary', 'Secondary', 'Success', 'Danger'];

export const load: PageServerLoad = async ({ cookies, params }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const manageableGuilds = await getManageableGuilds(session.accessToken);
	const guild = manageableGuilds.find((candidate) => candidate.id === params.guildId);
	if (!guild) error(403, "Tu n'as pas la permission de gérer ce serveur.");

	const botToken = getBotToken();
	const botGuildIds = await getBotGuildIds(botToken);
	if (!botGuildIds.has(guild.id)) error(404, "Kepler n'est pas installé sur ce serveur.");

	const [channels, categories, roles] = await Promise.all([
		getGuildChannels(guild.id, botToken),
		getGuildCategories(guild.id, botToken),
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
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'webp'}?size=128`
				: null
		},
		user: session.user,
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
			muteRoleId: serverConfig?.mute_role_id || '',
			ticketPanelChannelId: serverConfig?.ticket_panel_channel_id || '',
			ticketCategoryId: serverConfig?.ticket_category_id || '',
			ticketLogChannelId: serverConfig?.ticket_log_channel_id || '',
			ticketSupportRoleId: serverConfig?.ticket_support_role_id || '',
			ticketPanelTitle: serverConfig?.ticket_panel_title || 'Besoin d’aide ?',
			ticketPanelMessage:
				serverConfig?.ticket_panel_message ||
				'Cliquez sur le bouton ci-dessous pour ouvrir un ticket privé avec l’équipe du serveur.',
			ticketButtonLabel: serverConfig?.ticket_button_label || 'Ouvrir un ticket',
			ticketButtonEmoji: serverConfig?.ticket_button_emoji ?? '🎫',
			ticketButtonStyle: serverConfig?.ticket_button_style || 'Primary',
			ticketPanelMessageId: serverConfig?.ticket_panel_message_id || '',
			ticketPanelPublishedChannelId: serverConfig?.ticket_panel_published_channel_id || ''
		},
		channels: channels.map(({ id, name }) => ({ id, name })),
		categories: categories.map(({ id, name }) => ({ id, name })),
		roles: roles.map(({ id, name }) => ({ id, name })),
		timezones: TIMEZONES,
		ticketStyles: TICKET_STYLES
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

		return { success: true, section: 'general', message: 'Configuration générale enregistrée.' };
	},
	tickets: async ({ cookies, params, request }) => {
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
		const readValue = (name: string) => String(formData.get(name) || '').trim();
		const panelChannelId = readValue('ticket_panel_channel_id');
		const categoryId = readValue('ticket_category_id');
		const logChannelId = readValue('ticket_log_channel_id');
		const supportRoleId = readValue('ticket_support_role_id');
		const panelTitle = readValue('ticket_panel_title');
		const panelMessage = readValue('ticket_panel_message');
		const buttonLabel = readValue('ticket_button_label');
		const buttonEmoji = readValue('ticket_button_emoji');
		const buttonStyle = readValue('ticket_button_style');
		const [channels, categories, roles] = await Promise.all([
			getGuildChannels(guildId, botToken),
			getGuildCategories(guildId, botToken),
			getGuildRoles(guildId, botToken)
		]);

		if (
			!channels.some((channel) => channel.id === panelChannelId) ||
			!categories.some((category) => category.id === categoryId) ||
			!channels.some((channel) => channel.id === logChannelId) ||
			!roles.some((role) => role.id === supportRoleId) ||
			panelTitle.length < 1 ||
			panelTitle.length > 256 ||
			panelMessage.length < 1 ||
			panelMessage.length > 2000 ||
			buttonLabel.length < 1 ||
			buttonLabel.length > 80 ||
			buttonEmoji.length > 100 ||
			!TICKET_STYLES.includes(buttonStyle)
		) {
			return fail(400, { message: 'La configuration des tickets contient une valeur invalide.' });
		}

		try {
			await updateTicketConfig(guildId, {
				ticket_panel_channel_id: panelChannelId,
				ticket_category_id: categoryId,
				ticket_log_channel_id: logChannelId,
				ticket_support_role_id: supportRoleId,
				ticket_panel_title: panelTitle,
				ticket_panel_message: panelMessage,
				ticket_button_label: buttonLabel,
				ticket_button_emoji: buttonEmoji || null,
				ticket_button_style: buttonStyle
			});
		} catch (cause) {
			console.error('Unable to update ticket config', cause);
			return fail(502, { message: "La configuration des tickets n'a pas pu être enregistrée." });
		}

		return { success: true, section: 'tickets', message: 'Configuration des tickets enregistrée.' };
	},
	publishTickets: async ({ cookies, params }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		const guild = (await getManageableGuilds(session.accessToken)).find(
			(candidate) => candidate.id === guildId
		);
		if (!guild) return fail(403, { message: "Tu n'as plus la permission de gérer ce serveur." });

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, { message: "Kepler n'est plus présent sur ce serveur." });
		}

		const config = await getServerConfig(guildId);
		if (
			!config?.ticket_panel_channel_id ||
			!config.ticket_category_id ||
			!config.ticket_log_channel_id ||
			!config.ticket_support_role_id ||
			!config.ticket_panel_title ||
			!config.ticket_panel_message ||
			!config.ticket_button_label
		) {
			return fail(400, { message: 'Configure entièrement le module Tickets avant publication.' });
		}

		let publishedMessage: { id: string; channel_id: string };
		try {
			publishedMessage = await publishTicketPanel(config.ticket_panel_channel_id, botToken, {
				title: config.ticket_panel_title,
				message: config.ticket_panel_message,
				buttonLabel: config.ticket_button_label,
				buttonEmoji: config.ticket_button_emoji || null,
				buttonStyle: config.ticket_button_style || 'Primary',
				guildName: guild.name
			});
		} catch (cause) {
			console.error('Unable to publish ticket panel', cause);
			return fail(502, { message: "Le panneau n'a pas pu être envoyé dans Discord." });
		}

		try {
			await updatePublishedTicketPanel(guildId, publishedMessage.channel_id, publishedMessage.id);
		} catch (cause) {
			console.error('Unable to persist published ticket panel', cause);
			await deleteDiscordMessage(publishedMessage.channel_id, publishedMessage.id, botToken).catch(
				(deleteCause) => console.error('Unable to rollback ticket panel publication', deleteCause)
			);
			return fail(502, { message: "La publication n'a pas pu être mémorisée dans Supabase." });
		}

		let oldPanelRemoved = true;
		if (
			config.ticket_panel_message_id &&
			config.ticket_panel_published_channel_id &&
			config.ticket_panel_message_id !== publishedMessage.id
		) {
			try {
				await deleteDiscordMessage(
					config.ticket_panel_published_channel_id,
					config.ticket_panel_message_id,
					botToken
				);
			} catch (cause) {
				oldPanelRemoved = false;
				console.error('Unable to remove previous ticket panel', cause);
			}
		}

		return {
			success: true,
			section: 'publishTickets',
			message: oldPanelRemoved
				? 'Nouveau panneau publié. L’ancien panneau a été retiré.'
				: "Nouveau panneau publié, mais l'ancien message n'a pas pu être supprimé."
		};
	}
};
