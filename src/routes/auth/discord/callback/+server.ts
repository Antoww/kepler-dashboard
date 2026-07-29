import { getAuthConfig } from '$lib/server/auth/config';
import { exchangeAuthorizationCode, getDiscordUser } from '$lib/server/auth/discord';
import { setSession } from '$lib/server/auth/session';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const code = url.searchParams.get('code');
	const returnedState = url.searchParams.get('state');
	const expectedState = cookies.get('discord_oauth_state');
	const verifier = cookies.get('discord_oauth_verifier');

	cookies.delete('discord_oauth_state', { path: '/auth/discord' });
	cookies.delete('discord_oauth_verifier', { path: '/auth/discord' });

	if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) {
		redirect(303, '/?auth_error=invalid_request');
	}

	try {
		const tokens = await exchangeAuthorizationCode(code, verifier, getAuthConfig());
		const user = await getDiscordUser(tokens.access_token);

		await setSession(cookies, {
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: Date.now() + tokens.expires_in * 1000,
			user
		});
	} catch (cause) {
		console.error('Discord OAuth callback failed', cause);
		redirect(303, '/?auth_error=discord');
	}

	redirect(303, '/dashboard');
};
