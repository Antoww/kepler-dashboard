import { getSupabaseConfig } from '$lib/server/auth/config';
import { createClient } from '@supabase/supabase-js';

export interface ServerConfigRow {
	id?: number;
	guild_id: string;
	log_channel_id?: string | null;
	birthday_channel_id?: string | null;
	moderation_channel_id?: string | null;
	mute_role_id?: string | null;
	report_channel_id?: string | null;
	report_role_id?: string | null;
	ticket_panel_channel_id?: string | null;
	ticket_category_id?: string | null;
	ticket_log_channel_id?: string | null;
	ticket_support_role_id?: string | null;
	ticket_panel_title?: string | null;
	ticket_panel_message?: string | null;
	ticket_button_label?: string | null;
	ticket_button_emoji?: string | null;
	ticket_button_style?: string | null;
	timezone?: string | null;
	created_at?: string;
	updated_at?: string;
}

function getSupabase() {
	const { url, serviceRoleKey } = getSupabaseConfig();

	return createClient(url, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		},
		global: {
			headers: {
				'X-Client-Info': 'kepler-dashboard/0.1'
			}
		}
	});
}

export async function getServerConfig(guildId: string): Promise<ServerConfigRow | null> {
	const { data, error } = await getSupabase()
		.from('server_configs')
		.select('*')
		.eq('guild_id', guildId)
		.maybeSingle();

	if (error) throw error;
	return data as ServerConfigRow | null;
}
