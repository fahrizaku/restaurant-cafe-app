<script lang="ts">
	let {
		title,
		message = '',
		confirmLabel = 'Ya',
		cancelLabel = 'Batal',
		confirmClass = 'bg-error-500 hover:bg-error-600',
		onConfirm,
		onCancel
	}: {
		title: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		confirmClass?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

<div class="fixed inset-0 z-[200000] flex items-center justify-center">
	<div
		class="absolute inset-0 bg-black/40 backdrop-blur-sm"
		role="presentation"
		onclick={onCancel}
	></div>
	<div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
		<h2 class="mb-2 text-base font-semibold text-gray-800 dark:text-white">{title}</h2>
		{#if message}
			<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>
		{/if}
		<div class="flex gap-3 {message ? '' : 'mt-5'}">
			<button
				onclick={onCancel}
				class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
			>
				{cancelLabel}
			</button>
			<button
				onclick={onConfirm}
				class="flex-1 rounded-xl py-2.5 text-sm font-medium text-white {confirmClass}"
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</div>
