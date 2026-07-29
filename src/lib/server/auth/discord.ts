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

export interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
}

interface DiscordApplication {
	id: string;
}

export interface DiscordChannel {
	id: string;
	name: string;
	type: number;
	position: number;
}

export interface DiscordRole {
	id: string;
	name: string;
	position: number;
	managed: boolean;
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

async function getGuildPage(authorization: string, after?: string): Promise<DiscordGuild[]> {
	const url = new URL(`${DISCORD_API}/users/@me/guilds`);
	url.searchParams.set('limit', '200');
	if (after) url.searchParams.set('after', after);

	const response = await fetch(url, {
		headers: {
			Authorization: authorization,
			'User-Agent': USER_AGENT
		}
	});

	return parseDiscordResponse<DiscordGuild[]>(response);
}

export function canManageGuild(guild: DiscordGuild): boolean {
	if (guild.owner) return true;

	const permissions = BigInt(guild.permissions);
	const administrator = 1n << 3n;
	const manageGuild = 1n << 5n;

	return (
		(permissions & administrator) === administrator || (permissions & manageGuild) === manageGuild
	);
}

export async function getManageableGuilds(accessToken: string): Promise<DiscordGuild[]> {
	const guilds = await getGuildPage(`Bearer ${accessToken}`);
	return guilds
		.filter(canManageGuild)
		.sort((first, second) => first.name.localeCompare(second.name));
}

export async function getBotGuildIds(botToken: string): Promise<Set<string>> {
	const guildIds = new Set<string>();
	let after: string | undefined;

	while (true) {
		const guilds = await getGuildPage(`Bot ${botToken}`, after);
		for (const guild of guilds) guildIds.add(guild.id);

		if (guilds.length < 200) break;
		after = guilds.at(-1)?.id;
		if (!after) break;
	}

	return guildIds;
}

export async function getBotApplicationId(botToken: string): Promise<string> {
	const response = await fetch(`${DISCORD_API}/oauth2/applications/@me`, {
		headers: {
			Authorization: `Bot ${botToken}`,
			'User-Agent': USER_AGENT
		}
	});
	const application = await parseDiscordResponse<DiscordApplication>(response);

	return application.id;
}

export async function getGuildChannels(
	guildId: string,
	botToken: string
): Promise<DiscordChannel[]> {
	const response = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
		headers: {
			Authorization: `Bot ${botToken}`,
			'User-Agent': USER_AGENT
		}
	});
	const channels = await parseDiscordResponse<DiscordChannel[]>(response);

	return channels
		.filter((channel) => channel.type === 0 || channel.type === 5)
		.sort((first, second) => first.position - second.position);
}

export async function getGuildRoles(guildId: string, botToken: string): Promise<DiscordRole[]> {
	const response = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
		headers: {
			Authorization: `Bot ${botToken}`,
			'User-Agent': USER_AGENT
		}
	});
	const roles = await parseDiscordResponse<DiscordRole[]>(response);

	return roles
		.filter((role) => role.id !== guildId && !role.managed)
		.sort((first, second) => second.position - first.position);
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
