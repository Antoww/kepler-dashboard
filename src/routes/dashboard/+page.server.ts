import { getSession } from '$lib/server/auth/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = await getSession(cookies);
	if (!session) redirect(303, '/');

	return {
		user: session.user
	};
};
