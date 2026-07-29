import { getBotToken } from '$lib/server/auth/config';
import { getBotApplicationId, getManageableGuilds } from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const guildId = params.guildId;
	if (!guildId) error(400, 'Serveur Discord manquant.');

	const manageableGuilds = await getManageableGuilds(session.accessToken);
	if (!manageableGuilds.some((guild) => guild.id === guildId)) {
		error(403, "Tu n'as pas la permission d'ajouter Kepler à ce serveur.");
	}

	const clientId = await getBotApplicationId(getBotToken());
	const authorizationUrl = new URL('https://discord.com/oauth2/authorize');
	authorizationUrl.search = new URLSearchParams({
		client_id: clientId,
		guild_id: guildId,
		disable_guild_select: 'true',
		integration_type: '0',
		scope: 'bot applications.commands'
	}).toString();

	redirect(302, authorizationUrl.toString());
};
