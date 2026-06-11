<script lang="ts">
	import '$lib/styles/admin.css';
	import { enhance } from '$app/forms';
	import { AlertCircle } from 'lucide-svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>{data.setupNeeded ? 'Setup Akun Owner' : 'Login Admin'}</title>
</svelte:head>

<div class="font-outfit flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<span class="text-brand-500 text-2xl font-bold">🍕 RestAdmin</span>
			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				{data.setupNeeded
					? 'Belum ada akun. Buat akun owner pertama untuk mulai.'
					: 'Masuk untuk mengelola restoran'}
			</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
			{#if form?.message}
				<div
					class="border-error-200 bg-error-50 text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400 mb-4 flex items-center gap-2 rounded-xl border px-3 py-2.5"
				>
					<AlertCircle size={15} class="shrink-0" />
					<p class="text-sm">{form.message}</p>
				</div>
			{/if}

			<form
				method="POST"
				action={data.setupNeeded ? '?/setup' : '?/login'}
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
				class="space-y-4"
			>
				{#if data.setupNeeded}
					<div>
						<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Nama
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							maxlength="100"
							placeholder="Contoh: Budi Santoso"
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
						/>
					</div>
				{/if}

				<div>
					<label for="username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						autocomplete="username"
						autocapitalize="none"
						spellcheck="false"
						placeholder="username"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>

				<div>
					<label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						autocomplete={data.setupNeeded ? 'new-password' : 'current-password'}
						minlength={data.setupNeeded ? 8 : undefined}
						placeholder={data.setupNeeded ? 'Minimal 8 karakter' : '••••••••'}
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="bg-brand-500 hover:bg-brand-600 w-full rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-50"
				>
					{submitting ? 'Memproses…' : data.setupNeeded ? 'Buat Akun Owner' : 'Masuk'}
				</button>
			</form>
		</div>
	</div>
</div>
