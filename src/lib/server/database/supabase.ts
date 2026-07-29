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

export interface DailyActivityRow {
	date: string;
	commands: number;
	messages: number;
	users: number;
}

export async function getServerActivity(
	guildId: string,
	days: number | null = null
): Promise<DailyActivityRow[]> {
	let query = getSupabase()
		.from('daily_stats')
		.select('stat_date, total_commands, total_messages, unique_users')
		.eq('guild_id', guildId)
		.order('stat_date', { ascending: true });
	if (days !== null) {
		const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
		query = query.gte('stat_date', startDate.toISOString().slice(0, 10));
	}

	const { data, error } = await query;
	if (error) throw error;
	return (data ?? []).map((row) => ({
		date: row.stat_date,
		commands: row.total_commands ?? 0,
		messages: row.total_messages ?? 0,
		users: row.unique_users ?? 0
	}));
}

export interface RankedStat {
	id: string;
	count: number;
}

function periodStart(days: number | null, dateOnly = false): string | null {
	if (days === null) return null;
	const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
	return dateOnly ? start.slice(0, 10) : start;
}

export async function getTopCommands(
	guildId: string,
	days: number | null,
	limit = 10
): Promise<RankedStat[]> {
	const start = periodStart(days);
	let query = getSupabase().from('command_stats').select('command_name').eq('guild_id', guildId);
	if (start) query = query.gte('executed_at', start);
	const { data, error } = await query.limit(10_000);
	if (error) throw error;

	const counts = new Map<string, number>();
	for (const row of data ?? []) {
		counts.set(row.command_name, (counts.get(row.command_name) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([id, count]) => ({ id, count }))
		.sort((first, second) => second.count - first.count)
		.slice(0, limit);
}

export async function getTopMessageStats(
	guildId: string,
	groupBy: 'channel_id' | 'user_id',
	days: number | null,
	limit = 10
): Promise<RankedStat[]> {
	const start = periodStart(days, true);
	let query = getSupabase()
		.from('message_stats')
		.select(`${groupBy}, message_count`)
		.eq('guild_id', guildId);
	if (start) query = query.gte('message_date', start);
	const { data, error } = await query.limit(10_000);
	if (error) throw error;

	const counts = new Map<string, number>();
	for (const row of data ?? []) {
		const id = String(
			groupBy === 'channel_id'
				? (row as { channel_id: string }).channel_id
				: (row as { user_id: string }).user_id
		);
		counts.set(id, (counts.get(id) ?? 0) + (row.message_count ?? 0));
	}
	return [...counts.entries()]
		.map(([id, count]) => ({ id, count }))
		.sort((first, second) => second.count - first.count)
		.slice(0, limit);
}

export async function updateGeneralConfig(
	guildId: string,
	values: Partial<
		Pick<
			ServerConfigRow,
			| 'log_channel_id'
			| 'birthday_channel_id'
			| 'moderation_channel_id'
			| 'mute_role_id'
			| 'timezone'
		>
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
