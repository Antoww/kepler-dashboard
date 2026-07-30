import { getBotToken } from '$lib/server/auth/config';
import {
	deleteDiscordMessage,
	getBotGuildIds,
	getGuildCategories,
	getGuildChannels,
	getGuildResources,
	getGuildRoles,
	getGuildStats,
	getManageableGuilds,
	publishComponentsV2Message,
	publishTicketPanel
} from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import {
	getServerActivity,
	getServerConfig,
	updateGeneralConfig,
	updatePublishedTicketPanel,
	updateReportConfig,
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
const HEX_COLOR = /^#[0-9a-f]{6}$/iu;

function optionalHttpUrl(value: string): string | null {
	if (!value) return '';
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ cookies, params }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const manageableGuilds = await getManageableGuilds(session.accessToken);
	const guild = manageableGuilds.find((candidate) => candidate.id === params.guildId);
	if (!guild) error(403, "Tu n'as pas la permission de gérer ce serveur.");

	const botToken = getBotToken();
	const botGuildIds = await getBotGuildIds(botToken);
	if (!botGuildIds.has(guild.id)) error(404, "Kepler n'est pas installé sur ce serveur.");

	let serverConfig;
	let activity;
	let resources;
	let guildStats;
	try {
		[serverConfig, activity, resources, guildStats] = await Promise.all([
			getServerConfig(guild.id),
			getServerActivity(guild.id),
			getGuildResources(guild.id, botToken),
			getGuildStats(guild.id, botToken)
		]);
	} catch (cause) {
		console.error('Unable to load guild dashboard data', cause);
		error(502, 'Impossible de charger les données du serveur pour le moment.');
	}
	const { channels, categories, roles } = resources;

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
			reportsConfigured: Boolean(serverConfig?.report_channel_id),
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
			reportChannelId: serverConfig?.report_channel_id || '',
			reportRoleId: serverConfig?.report_role_id || '',
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
		stats: {
			...guildStats,
			textChannelCount: channels.length,
			categoryCount: categories.length,
			configurableRoleCount: roles.length
		},
		activity,
		timezones: TIMEZONES,
		ticketStyles: TICKET_STYLES
	};
};

export const actions: Actions = {
	publishComponentsV2: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, { section: 'componentsV2', message: 'Tu ne peux plus gérer ce serveur.' });
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, {
				section: 'componentsV2',
				message: "Kepler n'est plus présent sur ce serveur."
			});
		}

		const formData = await request.formData();
		const channelId = String(formData.get('channel_id') || '');
		const title = String(formData.get('title') || '').trim();
		const description = String(formData.get('description') || '').trim();
		const accentColor = String(formData.get('accent_color') || '').trim();
		const thumbnailUrl = optionalHttpUrl(String(formData.get('thumbnail_url') || '').trim());
		const imageUrl = optionalHttpUrl(String(formData.get('image_url') || '').trim());
		const footer = String(formData.get('footer') || '').trim();
		const buttonLabel = String(formData.get('button_label') || '').trim();
		const buttonUrl = optionalHttpUrl(String(formData.get('button_url') || '').trim());

		if (!(await getGuildChannels(guildId, botToken)).some(({ id }) => id === channelId)) {
			return fail(400, { section: 'componentsV2', message: 'Le salon sélectionné est invalide.' });
		}
		if (!title || title.length > 200 || !description || description.length > 3500) {
			return fail(400, {
				section: 'componentsV2',
				message: 'Le titre ou le contenu dépasse les limites autorisées.'
			});
		}
		if (!HEX_COLOR.test(accentColor)) {
			return fail(400, { section: 'componentsV2', message: "La couleur d'accent est invalide." });
		}
		if (thumbnailUrl === null || imageUrl === null || buttonUrl === null) {
			return fail(400, {
				section: 'componentsV2',
				message: 'Une des URL renseignées est invalide.'
			});
		}
		if (
			footer.length > 300 ||
			buttonLabel.length > 80 ||
			Boolean(buttonLabel) !== Boolean(buttonUrl)
		) {
			return fail(400, {
				section: 'componentsV2',
				message: 'Le texte secondaire ou le bouton est invalide.'
			});
		}

		try {
			const published = await publishComponentsV2Message(channelId, botToken, {
				title,
				description,
				accentColor: Number.parseInt(accentColor.slice(1), 16),
				thumbnailUrl: thumbnailUrl || undefined,
				imageUrl: imageUrl || undefined,
				footer: footer || undefined,
				buttonLabel: buttonLabel || undefined,
				buttonUrl: buttonUrl || undefined
			});
			return {
				success: true,
				section: 'componentsV2',
				message: `Message Components V2 publié dans Discord (${published.id}).`
			};
		} catch (cause) {
			console.error('Unable to publish Components V2 message', cause);
			return fail(502, {
				section: 'componentsV2',
				message: 'Discord a refusé la publication. Vérifie les URL et les permissions de Kepler.'
			});
		}
	},
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
		const timezone = String(formData.get('timezone') || '');
		if (!TIMEZONES.includes(timezone))
			return fail(400, { section: 'general', message: 'Le fuseau horaire est invalide.' });

		try {
			await updateGeneralConfig(guildId, { timezone });
		} catch (cause) {
			console.error('Unable to update general server config', cause);
			return fail(502, {
				section: 'general',
				message: "La configuration n'a pas pu être enregistrée."
			});
		}

		return { success: true, section: 'general', message: 'Configuration générale enregistrée.' };
	},
	logs: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, { section: 'logs', message: 'Tu ne peux plus gérer ce serveur.' });
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, { section: 'logs', message: "Kepler n'est plus présent sur ce serveur." });
		}

		const formData = await request.formData();
		const channelId = String(formData.get('log_channel_id') || '');
		if (
			channelId &&
			!(await getGuildChannels(guildId, botToken)).some(({ id }) => id === channelId)
		) {
			return fail(400, { section: 'logs', message: 'Le canal sélectionné est invalide.' });
		}

		try {
			await updateGeneralConfig(guildId, { log_channel_id: channelId || null });
		} catch (cause) {
			console.error('Unable to update log config', cause);
			return fail(502, {
				section: 'logs',
				message: "La configuration des journaux n'a pas pu être enregistrée."
			});
		}

		return {
			success: true,
			section: 'logs',
			message: channelId ? 'Canal des journaux enregistré.' : 'Journaux désactivés.'
		};
	},
	birthdays: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, { section: 'birthdays', message: 'Tu ne peux plus gérer ce serveur.' });
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, {
				section: 'birthdays',
				message: "Kepler n'est plus présent sur ce serveur."
			});
		}

		const formData = await request.formData();
		const channelId = String(formData.get('birthday_channel_id') || '');
		if (
			channelId &&
			!(await getGuildChannels(guildId, botToken)).some(({ id }) => id === channelId)
		) {
			return fail(400, { section: 'birthdays', message: 'Le canal sélectionné est invalide.' });
		}

		try {
			await updateGeneralConfig(guildId, { birthday_channel_id: channelId || null });
		} catch (cause) {
			console.error('Unable to update birthday config', cause);
			return fail(502, {
				section: 'birthdays',
				message: "La configuration des anniversaires n'a pas pu être enregistrée."
			});
		}

		return {
			success: true,
			section: 'birthdays',
			message: channelId ? 'Canal des anniversaires enregistré.' : 'Annonces désactivées.'
		};
	},
	moderation: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, { section: 'moderation', message: 'Tu ne peux plus gérer ce serveur.' });
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, {
				section: 'moderation',
				message: "Kepler n'est plus présent sur ce serveur."
			});
		}

		const formData = await request.formData();
		const channelId = String(formData.get('moderation_channel_id') || '');
		const roleId = String(formData.get('mute_role_id') || '');
		const [channels, roles] = await Promise.all([
			getGuildChannels(guildId, botToken),
			getGuildRoles(guildId, botToken)
		]);
		if (
			(channelId && !channels.some(({ id }) => id === channelId)) ||
			(roleId && !roles.some(({ id }) => id === roleId))
		) {
			return fail(400, {
				section: 'moderation',
				message: 'Le canal ou le rôle sélectionné est invalide.'
			});
		}

		try {
			await updateGeneralConfig(guildId, {
				moderation_channel_id: channelId || null,
				mute_role_id: roleId || null
			});
		} catch (cause) {
			console.error('Unable to update moderation config', cause);
			return fail(502, {
				section: 'moderation',
				message: "La configuration de modération n'a pas pu être enregistrée."
			});
		}

		return {
			success: true,
			section: 'moderation',
			message: 'Configuration de modération enregistrée.'
		};
	},
	reports: async ({ cookies, params, request }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, { message: "Tu n'as plus la permission de gérer ce serveur." });
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, { message: "Kepler n'est plus présent sur ce serveur." });
		}

		const formData = await request.formData();
		const reportChannelId = String(formData.get('report_channel_id') || '');
		const reportRoleId = String(formData.get('report_role_id') || '');
		const [channels, roles] = await Promise.all([
			getGuildChannels(guildId, botToken),
			getGuildRoles(guildId, botToken)
		]);

		if (
			(reportChannelId && !channels.some((channel) => channel.id === reportChannelId)) ||
			(reportRoleId && !roles.some((role) => role.id === reportRoleId))
		) {
			return fail(400, { message: 'Le canal ou le rôle sélectionné est invalide.' });
		}

		try {
			await updateReportConfig(
				guildId,
				reportChannelId || null,
				reportChannelId ? reportRoleId || null : null
			);
		} catch (cause) {
			console.error('Unable to update report config', cause);
			return fail(502, {
				message: "La configuration des signalements n'a pas pu être enregistrée."
			});
		}

		return {
			success: true,
			section: 'reports',
			message: reportChannelId
				? 'Configuration des signalements enregistrée.'
				: 'Module Signalements désactivé.'
		};
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
			message:
				!config.ticket_panel_message_id || !config.ticket_panel_published_channel_id
					? 'Le panneau de tickets a été publié dans Discord.'
					: oldPanelRemoved
						? 'Nouveau panneau publié. L’ancien panneau a été retiré.'
						: "Nouveau panneau publié, mais l'ancien message n'a pas pu être supprimé."
		};
	},
	deleteTicketPanel: async ({ cookies, params }) => {
		const session = await getSession(cookies);
		if (!session) redirect(303, '/');

		const guildId = params.guildId;
		if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
			return fail(403, {
				section: 'deleteTicketPanel',
				message: "Tu n'as plus la permission de gérer ce serveur."
			});
		}

		const botToken = getBotToken();
		if (!(await getBotGuildIds(botToken)).has(guildId)) {
			return fail(404, {
				section: 'deleteTicketPanel',
				message: "Kepler n'est plus présent sur ce serveur."
			});
		}

		const config = await getServerConfig(guildId);
		if (!config?.ticket_panel_message_id || !config.ticket_panel_published_channel_id) {
			return fail(400, {
				section: 'deleteTicketPanel',
				message: 'Aucun panneau publié n’est mémorisé pour ce serveur.'
			});
		}

		try {
			await deleteDiscordMessage(
				config.ticket_panel_published_channel_id,
				config.ticket_panel_message_id,
				botToken
			);
			await updatePublishedTicketPanel(guildId, null, null);
		} catch (cause) {
			console.error('Unable to delete published ticket panel', cause);
			return fail(502, {
				section: 'deleteTicketPanel',
				message: "Le panneau n'a pas pu être supprimé."
			});
		}

		return {
			success: true,
			section: 'deleteTicketPanel',
			message: 'Le panneau de tickets a été supprimé de Discord.'
		};
	}
};
