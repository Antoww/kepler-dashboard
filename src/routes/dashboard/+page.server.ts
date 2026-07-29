import { getBotToken } from '$lib/server/auth/config';
import { getBotGuildIds, getManageableGuilds } from '$lib/server/auth/discord';
import { getSession } from '$lib/server/auth/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	const [manageableGuilds, botGuildIds] = await Promise.all([
		getManageableGuilds(session.accessToken),
		getBotGuildIds(getBotToken())
	]);
	return {
		user: session.user,
		guilds: manageableGuilds.map((guild) => ({
			id: guild.id,
			name: guild.name,
			iconUrl: guild.icon
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
				: null,
			botInstalled: botGuildIds.has(guild.id)
		}))
	};
};
