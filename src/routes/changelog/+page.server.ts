import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

const RELEASES_URL = 'https://api.github.com/repos/Antoww/kepler-dashboard/releases?per_page=30';
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string | null;
	html_url: string;
	body: string | null;
	body_html?: string | null;
	published_at: string | null;
	prerelease: boolean;
	draft: boolean;
}

export interface ChangelogRelease {
	id: number;
	tag: string;
	name: string;
	url: string;
	body: string;
	bodyHtml: string | null;
	publishedAt: string;
	prerelease: boolean;
}

let releaseCache: { expiresAt: number; releases: ChangelogRelease[] } | null = null;

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'
	});

	if (releaseCache && releaseCache.expiresAt > Date.now()) {
		return { releases: releaseCache.releases, unavailable: false };
	}

	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.html+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'kepler-dashboard'
	};
	if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

	try {
		const response = await fetch(RELEASES_URL, { headers });
		if (!response.ok) throw new Error(`GitHub releases request failed (${response.status})`);

		const releases = ((await response.json()) as GitHubRelease[])
			.filter((release) => !release.draft && release.published_at)
			.map((release) => ({
				id: release.id,
				tag: release.tag_name,
				name: release.name || release.tag_name,
				url: release.html_url,
				body: release.body || '',
				bodyHtml: release.body_html || null,
				publishedAt: release.published_at as string,
				prerelease: release.prerelease
			}));

		releaseCache = { expiresAt: Date.now() + CACHE_DURATION_MS, releases };
		return { releases, unavailable: false };
	} catch (cause) {
		console.error('Unable to load GitHub releases', cause);
		return {
			releases: releaseCache?.releases ?? [],
			unavailable: true
		};
	}
};
