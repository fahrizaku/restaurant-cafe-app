<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { AlertCircle, CheckCircle2, KeyRound, Trash2, UserPlus } from 'lucide-svelte';

	let { data, form } = $props();
	let creating = $state(false);
	let resetTarget = $state<{ id: string; name: string } | null>(null);
	let confirmDialog = $state<{
		title: string;
		message?: string;
		confirmLabel?: string;
		confirmClass?: string;
		onConfirm: () => void;
	} | null>(null);

	const roleLabel: Record<string, { label: string; cls: string }> = {
		owner: { label: 'Owner', cls: 'bg-brand-50 text-brand-500 dark:bg-brand-500/10' },
		cashier: { label: 'Kasir', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
	};

	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('id-ID', { dateStyle: 'medium' });
	}
</script>

<div class="max-w-3xl space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Pengguna</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			Kelola akun staf. Owner punya akses penuh; kasir tidak bisa membuka laporan, pengaturan, dan
			halaman ini.
		</p>
	</div>

	{#if form?.message}
		<div
			class="border-error-200 bg-error-50 text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400 flex items-center gap-3 rounded-xl border px-4 py-3"
		>
			<AlertCircle size={16} class="shrink-0" />
			<p class="text-sm">{form.message}</p>
		</div>
	{:else if form?.success}
		<div
			class="border-success-200 bg-success-50 text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-500 flex items-center gap-3 rounded-xl border px-4 py-3"
		>
			<CheckCircle2 size={16} class="shrink-0" />
			<p class="text-sm">Perubahan tersimpan.</p>
		</div>
	{/if}

	<!-- Daftar user -->
	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
			<h2 class="text-base font-semibold text-gray-800 dark:text-white">
				Daftar Akun ({data.users.length})
			</h2>
		</div>
		<div class="divide-y divide-gray-50 dark:divide-gray-800">
			{#each data.users as user (user.id)}
				<div class="flex flex-wrap items-center gap-3 px-5 py-3">
					<div
						class="bg-brand-500 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
					>
						{user.name.charAt(0).toUpperCase()}
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium text-gray-800 dark:text-white">
							{user.name}
							{#if user.id === data.currentUserId}
								<span class="text-xs text-gray-400">(Anda)</span>
							{/if}
						</p>
						<p class="text-xs text-gray-400">@{user.username} · sejak {formatDate(user.createdAt)}</p>
					</div>
					<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {roleLabel[user.role].cls}">
						{roleLabel[user.role].label}
					</span>
					<div class="flex gap-1.5">
						<button
							onclick={() => (resetTarget = { id: user.id, name: user.name })}
							title="Reset password"
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
						>
							<KeyRound size={14} />
						</button>
						{#if user.id !== data.currentUserId}
							<form method="POST" action="?/deleteUser" use:enhance={() => () => invalidateAll()}>
								<input type="hidden" name="userId" value={user.id} />
								<button
									type="submit"
									title="Hapus akun"
									class="border-error-200 text-error-500 hover:bg-error-50 dark:border-error-500/30 flex h-8 w-8 items-center justify-center rounded-lg border"
									onclick={(e) => {
										e.preventDefault();
										const formEl = (e.currentTarget as HTMLButtonElement).closest('form') as HTMLFormElement;
										confirmDialog = {
											title: `Hapus akun ${user.name}?`,
											message: 'Akun langsung keluar dari semua perangkat dan tidak bisa login lagi.',
											confirmLabel: 'Hapus',
											confirmClass: 'bg-error-500 hover:bg-error-600',
											onConfirm: () => formEl.requestSubmit()
										};
									}}
								>
									<Trash2 size={14} />
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Form reset password -->
	{#if resetTarget}
		<div class="border-warning-300 dark:border-warning-500/40 rounded-2xl border-2 bg-white p-5 dark:bg-gray-900">
			<h2 class="mb-1 text-base font-semibold text-gray-800 dark:text-white">
				Reset Password — {resetTarget.name}
			</h2>
			<p class="mb-4 text-xs text-gray-400">User akan keluar dari semua perangkat dan harus login ulang.</p>
			<form
				method="POST"
				action="?/resetPassword"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						resetTarget = null;
					};
				}}
				class="flex flex-wrap items-end gap-3"
			>
				<input type="hidden" name="userId" value={resetTarget.id} />
				<div class="min-w-48 flex-1">
					<label for="resetPassword" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password Baru
					</label>
					<input
						type="password"
						id="resetPassword"
						name="password"
						required
						minlength="8"
						autocomplete="new-password"
						placeholder="Minimal 8 karakter"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>
				<button
					type="submit"
					class="bg-warning-500 hover:bg-warning-600 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
				>
					Reset
				</button>
				<button
					type="button"
					onclick={() => (resetTarget = null)}
					class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
				>
					Batal
				</button>
			</form>
		</div>
	{/if}

	<!-- Form tambah user -->
	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
			<UserPlus size={18} class="text-brand-500" />
			<h2 class="text-base font-semibold text-gray-800 dark:text-white">Tambah Akun</h2>
		</div>
		<form
			method="POST"
			action="?/createUser"
			use:enhance={() => {
				creating = true;
				return async ({ update }) => {
					await update();
					creating = false;
				};
			}}
			class="space-y-4 p-5"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="newName" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Nama
					</label>
					<input
						type="text"
						id="newName"
						name="name"
						required
						maxlength="100"
						placeholder="Contoh: Siti Aminah"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>
				<div>
					<label for="newUsername" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Username
					</label>
					<input
						type="text"
						id="newUsername"
						name="username"
						required
						autocapitalize="none"
						spellcheck="false"
						placeholder="huruf kecil, angka, _ . -"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>
				<div>
					<label for="newPassword" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						type="password"
						id="newPassword"
						name="password"
						required
						minlength="8"
						autocomplete="new-password"
						placeholder="Minimal 8 karakter"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					/>
				</div>
				<div>
					<label for="newRole" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Role
					</label>
					<select
						id="newRole"
						name="role"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					>
						<option value="cashier">Kasir</option>
						<option value="owner">Owner</option>
					</select>
				</div>
			</div>
			<button
				type="submit"
				disabled={creating}
				class="bg-brand-500 hover:bg-brand-600 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
			>
				{creating ? 'Menyimpan…' : 'Tambah Akun'}
			</button>
		</form>
	</div>
</div>

{#if confirmDialog}
	<ConfirmDialog
		title={confirmDialog.title}
		message={confirmDialog.message}
		confirmLabel={confirmDialog.confirmLabel}
		confirmClass={confirmDialog.confirmClass}
		onConfirm={() => {
			confirmDialog!.onConfirm();
			confirmDialog = null;
		}}
		onCancel={() => (confirmDialog = null)}
	/>
{/if}
