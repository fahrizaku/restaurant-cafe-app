<script lang="ts">
	import { enhance } from '$app/forms';
	import { AlertCircle, CheckCircle2, Landmark } from 'lucide-svelte';

	let { data, form } = $props();
	let saving = $state(false);
</script>

<div class="max-w-2xl space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Pengaturan</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400">Konfigurasi aplikasi</p>
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
			<p class="text-sm">Pengaturan tersimpan.</p>
		</div>
	{/if}

	<div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
			<Landmark size={18} class="text-brand-500" />
			<div>
				<h2 class="text-base font-semibold text-gray-800 dark:text-white">Rekening Transfer</h2>
				<p class="text-xs text-gray-400">
					Ditampilkan ke customer yang memilih bayar via transfer di meja. Kosongkan untuk
					menonaktifkan opsi transfer.
				</p>
			</div>
		</div>

		<form
			method="POST"
			action="?/saveBank"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
			class="space-y-4 p-5"
		>
			<div>
				<label
					for="bankName"
					class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Nama Bank
				</label>
				<input
					type="text"
					id="bankName"
					name="bankName"
					value={data.settings.bank_name ?? ''}
					placeholder="Contoh: BCA"
					class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
				/>
			</div>

			<div>
				<label
					for="bankAccount"
					class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Nomor Rekening
				</label>
				<input
					type="text"
					id="bankAccount"
					name="bankAccount"
					inputmode="numeric"
					value={data.settings.bank_account ?? ''}
					placeholder="Contoh: 1234567890"
					class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
				/>
			</div>

			<div>
				<label
					for="bankHolder"
					class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Atas Nama
				</label>
				<input
					type="text"
					id="bankHolder"
					name="bankHolder"
					value={data.settings.bank_holder ?? ''}
					placeholder="Contoh: Budi Santoso"
					class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
				/>
			</div>

			<button
				type="submit"
				disabled={saving}
				class="bg-brand-500 hover:bg-brand-600 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
			>
				{saving ? 'Menyimpan...' : 'Simpan'}
			</button>
		</form>
	</div>
</div>
