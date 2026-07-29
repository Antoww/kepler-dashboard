<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	interface User {
		id: string;
		username: string;
		global_name: string | null;
		avatar: string | null;
	}

	let { user }: { user: User | null } = $props();
	let menu = $state<HTMLDetailsElement>();

	const avatarUrl = $derived(
		user?.avatar
			? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=128`
			: null
	);

	onMount(() => {
		const closeOutside = (event: PointerEvent) => {
			if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && menu?.open) {
				menu.open = false;
				menu.querySelector('summary')?.focus();
			}
		};

		document.addEventListener('pointerdown', closeOutside);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('pointerdown', closeOutside);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});
</script>

{#if user}
	<details bind:this={menu} class="group relative">
		<summary
			class="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-1.5 transition hover:border-white/20 hover:bg-white/10 [&::-webkit-details-marker]:hidden"
		>
			{#if avatarUrl}
				<img
					src={avatarUrl}
					alt=""
					class="size-8 rounded-lg object-cover"
					referrerpolicy="no-referrer"
				/>
			{:else}
				<span class="grid size-8 place-items-center rounded-lg bg-violet-500 text-sm font-bold">
					{user.username.slice(0, 1).toUpperCase()}
				</span>
			{/if}
			<span class="hidden max-w-36 truncate text-sm font-medium sm:block">
				{user.global_name ?? user.username}
			</span>
			<span class="text-xs text-zinc-500 transition group-open:rotate-180">⌄</span>
		</summary>

		<div
			class="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl shadow-black/50"
		>
			<div class="border-b border-white/10 px-3 py-2">
				<p class="truncate text-sm font-medium">{user.global_name ?? user.username}</p>
				<p class="truncate text-xs text-zinc-500">@{user.username}</p>
			</div>
			<a
				href={resolve('/dashboard')}
				class="mt-2 block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
			>
				Mes serveurs
			</a>
			<form method="POST" action="/auth/logout">
				<button
					type="submit"
					class="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-400/10"
				>
					Se déconnecter
				</button>
			</form>
		</div>
	</details>
{:else}
	<a
		href={resolve('/auth/discord')}
		class="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
	>
		<span class="grid size-5 place-items-center rounded bg-white/15 text-[10px]">D</span>
		Se connecter
	</a>
{/if}
