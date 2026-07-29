import { getBotToken } from '$lib/server/auth/config';
import { getBotGuildIds, getManageableGuilds } from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
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

	return {
		guild: {
			id: guild.id,
			name: guild.name,
			iconUrl: guild.icon
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
				: null
		}
	};
};
