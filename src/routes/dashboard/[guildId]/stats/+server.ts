import { getBotToken } from '$lib/server/auth/config';
import {
	getBotGuildIds,
	getDiscordUserNames,
	getGuildResources,
	getManageableGuilds
} from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import { getTopCommands, getTopMessageStats } from '$lib/server/database/supabase';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type RankingView = 'channels' | 'users' | 'commands';
interface RankingItem {
	id: string;
	label: string;
	count: number;
}

const resultCache = new Map<string, { expiresAt: number; items: RankingItem[] }>();
const VALID_PERIODS = new Set([7, 30, 90, 180, 360]);

export const GET: RequestHandler = async ({ cookies, params, url }) => {
	const session = await getSession(cookies);
	if (!session) error(401, 'Connexion requise.');

	const guildId = params.guildId;
	if (!(await getManageableGuilds(session.accessToken)).some((guild) => guild.id === guildId)) {
		error(403, "Tu n'as pas la permission de gérer ce serveur.");
	}

	const botToken = getBotToken();
	if (!(await getBotGuildIds(botToken)).has(guildId)) {
		error(404, "Kepler n'est pas présent sur ce serveur.");
	}

	const view = url.searchParams.get('view') as RankingView;
	if (!['channels', 'users', 'commands'].includes(view)) error(400, 'Vue invalide.');
	const periodValue = url.searchParams.get('days') || '30';
	const days = periodValue === 'all' ? null : Number(periodValue);
	if (days !== null && !VALID_PERIODS.has(days)) error(400, 'Période invalide.');
	const limit = Math.min(15, Math.max(5, Number(url.searchParams.get('limit') || 10)));
	const cacheKey = `${guildId}:${view}:${periodValue}:${limit}`;
	const cached = resultCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) return json({ items: cached.items });

	let items: RankingItem[];
	if (view === 'commands') {
		const stats = await getTopCommands(guildId, days, limit);
		items = stats.map((item) => ({ ...item, label: `/${item.id}` }));
	} else {
		const stats = await getTopMessageStats(
			guildId,
			view === 'channels' ? 'channel_id' : 'user_id',
			days,
			limit
		);
		if (view === 'channels') {
			const resources = await getGuildResources(guildId, botToken);
			const channelNames = new Map(resources.channels.map((channel) => [channel.id, channel.name]));
			items = stats.map((item) => ({
				...item,
				label: channelNames.has(item.id) ? `#${channelNames.get(item.id)}` : 'Canal supprimé'
			}));
		} else {
			const names = await getDiscordUserNames(
				stats.map((item) => item.id),
				botToken
			);
			items = stats.map((item) => ({
				...item,
				label: names.get(item.id) || 'Utilisateur inconnu'
			}));
		}
	}

	resultCache.set(cacheKey, { expiresAt: Date.now() + 2 * 60 * 1000, items });
	return json({ items });
};
