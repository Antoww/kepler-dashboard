import type { Cookies } from '@sveltejs/kit';
import { getAuthConfig } from './config';
import { decryptJson, encryptJson } from './crypto';
import { refreshAccessToken, type DiscordSession } from './discord';

export const SESSION_COOKIE = 'kepler_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const cookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: true,
	maxAge: SESSION_MAX_AGE
};

export async function setSession(cookies: Cookies, session: DiscordSession): Promise<void> {
	const { sessionSecret } = getAuthConfig();
	cookies.set(SESSION_COOKIE, await encryptJson(session, sessionSecret), cookieOptions);
}

export function clearSession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function getSession(cookies: Cookies): Promise<DiscordSession | null> {
	const encrypted = cookies.get(SESSION_COOKIE);
	if (!encrypted) return null;

	const config = getAuthConfig();
	const session = await decryptJson<DiscordSession>(encrypted, config.sessionSecret);
	if (!session) {
		clearSession(cookies);
		return null;
	}

	if (session.expiresAt > Date.now() + 60_000) return session;

	try {
		const tokens = await refreshAccessToken(session.refreshToken, config);
		const refreshedSession: DiscordSession = {
			...session,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: Date.now() + tokens.expires_in * 1000
		};

		await setSession(cookies, refreshedSession);
		return refreshedSession;
	} catch {
		clearSession(cookies);
		return null;
	}
}
