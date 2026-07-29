import { getAuthConfig } from '$lib/server/auth/config';
import { revokeDiscordToken } from '$lib/server/auth/discord';
import { clearSession, getSession } from '$lib/server/auth/session';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request, url }) => {
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) error(403, 'Origine invalide');

	const session = await getSession(cookies);
	clearSession(cookies);

	if (session) {
		try {
			await revokeDiscordToken(session.refreshToken, getAuthConfig());
		} catch (cause) {
			console.error('Discord token revocation failed', cause);
		}
	}

	redirect(303, '/');
};
