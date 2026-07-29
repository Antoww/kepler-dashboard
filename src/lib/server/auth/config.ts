import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export interface AuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	sessionSecret: string;
}

function requireSecret(name: string): string {
	const value = env[name];

	if (!value) {
		console.error(`Configuration serveur manquante : ${name}`);
		throw error(503, "L'authentification Discord n'est pas encore configurée.");
	}

	return value;
}

export function getAuthConfig(): AuthConfig {
	return {
		clientId: requireSecret('DISCORD_CLIENT_ID'),
		clientSecret: requireSecret('DISCORD_CLIENT_SECRET'),
		redirectUri: requireSecret('DISCORD_REDIRECT_URI'),
		sessionSecret: requireSecret('SESSION_SECRET')
	};
}

export function getBotToken(): string {
	return requireSecret('DISCORD_BOT_TOKEN');
}
