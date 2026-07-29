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

export interface DiscordGuildStats {
	memberCount: number;
	onlineCount: number;
	boostCount: number;
	boostLevel: number;
	preferredLocale: string;
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

export async function getGuildStats(guildId: string, botToken: string): Promise<DiscordGuildStats> {
	const response = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
		headers: {
			Authorization: `Bot ${botToken}`,
			'User-Agent': USER_AGENT
		}
	});
	const guild = await parseDiscordResponse<{
		approximate_member_count?: number;
		approximate_presence_count?: number;
		premium_subscription_count?: number;
		premium_tier?: number;
		preferred_locale?: string;
	}>(response);

	return {
		memberCount: guild.approximate_member_count ?? 0,
		onlineCount: guild.approximate_presence_count ?? 0,
		boostCount: guild.premium_subscription_count ?? 0,
		boostLevel: guild.premium_tier ?? 0,
		preferredLocale: guild.preferred_locale ?? 'fr'
	};
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

export async function getGuildCategories(
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
		.filter((channel) => channel.type === 4)
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

interface TicketPanelPayload {
	title: string;
	message: string;
	buttonLabel: string;
	buttonEmoji: string | null;
	buttonStyle: string;
	guildName: string;
}

function discordEmoji(value: string): { id?: string; name: string; animated?: boolean } {
	const customEmoji = value.match(/^<(a?):([A-Za-z0-9_]+):(\d+)>$/u);
	if (customEmoji) {
		return {
			animated: customEmoji[1] === 'a',
			name: customEmoji[2],
			id: customEmoji[3]
		};
	}

	return { name: value };
}

export async function publishTicketPanel(
	channelId: string,
	botToken: string,
	panel: TicketPanelPayload
): Promise<{ id: string; channel_id: string }> {
	const style = (
		{
			Primary: 1,
			Secondary: 2,
			Success: 3,
			Danger: 4
		} as Record<string, number>
	)[panel.buttonStyle];
	const button: Record<string, unknown> = {
		type: 2,
		style: style ?? 1,
		custom_id: 'ticket:open',
		label: panel.buttonLabel
	};
	if (panel.buttonEmoji) button.emoji = discordEmoji(panel.buttonEmoji);

	const response = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bot ${botToken}`,
			'Content-Type': 'application/json',
			'User-Agent': USER_AGENT
		},
		body: JSON.stringify({
			embeds: [
				{
					color: 0x5f91c4,
					title: panel.title,
					description: panel.message,
					footer: { text: panel.guildName },
					timestamp: new Date().toISOString()
				}
			],
			components: [{ type: 1, components: [button] }],
			allowed_mentions: { parse: [] }
		})
	});

	return parseDiscordResponse<{ id: string; channel_id: string }>(response);
}

export async function deleteDiscordMessage(
	channelId: string,
	messageId: string,
	botToken: string
): Promise<void> {
	const response = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bot ${botToken}`,
			'User-Agent': USER_AGENT
		}
	});

	if (!response.ok && response.status !== 404) {
		throw new Error(`Discord message deletion failed (${response.status})`);
	}
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
