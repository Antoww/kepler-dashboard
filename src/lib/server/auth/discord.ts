import type { AuthConfig } from './config';

const DISCORD_API = 'https://discord.com/api/v10';
const USER_AGENT = 'DiscordBot (https://keplerbot.fr, 1.0)';

export interface DiscordTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	scope: string;
	token_type: 'Bearer';
}

export interface DiscordUser {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
	discriminator: string;
}

export interface DiscordSession {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	user: DiscordUser;
}

function basicAuthorization(config: AuthConfig): string {
	return `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`;
}

async function parseDiscordResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		throw new Error(`Discord API request failed (${response.status})`);
	}

	return response.json() as Promise<T>;
}

export async function exchangeAuthorizationCode(
	code: string,
	verifier: string,
	config: AuthConfig
): Promise<DiscordTokenResponse> {
	const response = await fetch(`${DISCORD_API}/oauth2/token`, {
		method: 'POST',
		headers: {
			Authorization: basicAuthorization(config),
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': USER_AGENT
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: config.redirectUri,
			code_verifier: verifier
		})
	});

	return parseDiscordResponse<DiscordTokenResponse>(response);
}

export async function refreshAccessToken(
	refreshToken: string,
	config: AuthConfig
): Promise<DiscordTokenResponse> {
	const response = await fetch(`${DISCORD_API}/oauth2/token`, {
		method: 'POST',
		headers: {
			Authorization: basicAuthorization(config),
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': USER_AGENT
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});

	return parseDiscordResponse<DiscordTokenResponse>(response);
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
	const response = await fetch(`${DISCORD_API}/users/@me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'User-Agent': USER_AGENT
		}
	});

	return parseDiscordResponse<DiscordUser>(response);
}

export async function revokeDiscordToken(token: string, config: AuthConfig): Promise<void> {
	const response = await fetch(`${DISCORD_API}/oauth2/token/revoke`, {
		method: 'POST',
		headers: {
			Authorization: basicAuthorization(config),
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': USER_AGENT
		},
		body: new URLSearchParams({
			token,
			token_type_hint: 'refresh_token'
		})
	});

	if (!response.ok) throw new Error(`Discord token revocation failed (${response.status})`);
}
