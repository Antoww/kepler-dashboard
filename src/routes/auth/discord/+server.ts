import { getAuthConfig } from '$lib/server/auth/config';
import { createCodeChallenge, createRandomValue } from '$lib/server/auth/crypto';
import { redirect, type RequestHandler } from '@sveltejs/kit';

const TRANSIENT_COOKIE_MAX_AGE = 60 * 10;

export const GET: RequestHandler = async ({ cookies }) => {
	const config = getAuthConfig();
	const state = createRandomValue();
	const verifier = createRandomValue(64);
	const cookieOptions = {
		path: '/auth/discord',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: true,
		maxAge: TRANSIENT_COOKIE_MAX_AGE
	};

	cookies.set('discord_oauth_state', state, cookieOptions);
	cookies.set('discord_oauth_verifier', verifier, cookieOptions);

	const authorizationUrl = new URL('https://discord.com/oauth2/authorize');
	authorizationUrl.search = new URLSearchParams({
		response_type: 'code',
		client_id: config.clientId,
		scope: 'identify guilds',
		redirect_uri: config.redirectUri,
		state,
		code_challenge: await createCodeChallenge(verifier),
		code_challenge_method: 'S256'
	}).toString();

	redirect(302, authorizationUrl.toString());
};
