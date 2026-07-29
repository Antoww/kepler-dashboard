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
	ticket_panel_message_id?: string | null;
	ticket_panel_published_channel_id?: string | null;
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

export async function updateGeneralConfig(
	guildId: string,
	values: Pick<
		ServerConfigRow,
		'log_channel_id' | 'birthday_channel_id' | 'moderation_channel_id' | 'mute_role_id' | 'timezone'
	>
): Promise<void> {
	const { error } = await getSupabase()
		.from('server_configs')
		.upsert(
			{
				guild_id: guildId,
				...values,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'guild_id' }
		);

	if (error) throw error;
}

export async function updateTicketConfig(
	guildId: string,
	values: Pick<
		ServerConfigRow,
		| 'ticket_panel_channel_id'
		| 'ticket_category_id'
		| 'ticket_log_channel_id'
		| 'ticket_support_role_id'
		| 'ticket_panel_title'
		| 'ticket_panel_message'
		| 'ticket_button_label'
		| 'ticket_button_emoji'
		| 'ticket_button_style'
	>
): Promise<void> {
	const { error } = await getSupabase()
		.from('server_configs')
		.upsert(
			{
				guild_id: guildId,
				...values,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'guild_id' }
		);

	if (error) throw error;
}

export async function updatePublishedTicketPanel(
	guildId: string,
	channelId: string | null,
	messageId: string | null
): Promise<void> {
	const { error } = await getSupabase()
		.from('server_configs')
		.update({
			ticket_panel_published_channel_id: channelId,
			ticket_panel_message_id: messageId,
			updated_at: new Date().toISOString()
		})
		.eq('guild_id', guildId);

	if (error) throw error;
}

export async function updateReportConfig(
	guildId: string,
	reportChannelId: string | null,
	reportRoleId: string | null
): Promise<void> {
	const { error } = await getSupabase().from('server_configs').upsert(
		{
			guild_id: guildId,
			report_channel_id: reportChannelId,
			report_role_id: reportRoleId,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'guild_id' }
	);

	if (error) throw error;
}
