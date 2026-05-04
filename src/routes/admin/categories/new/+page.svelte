<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
	let loading = $state(false);
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a
			href="/admin/categories"
			aria-label="Back to categories"
			class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
		>
			<svg class="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"
					fill=""
				/>
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-semibold text-gray-800 dark:text-white">Add Category</h1>
		</div>
	</div>

	{#if form?.message}
		<div class="bg-error-50 text-error-600 rounded-lg px-4 py-3 text-sm">{form.message}</div>
	{/if}

	<div
		class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
	>
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="max-w-md space-y-5"
		>
			<div>
				<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
					Name <span class="text-error-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Pizzas"
					required
					class="focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
				/>
			</div>
			<div>
				<label for="order" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
					>Display Order</label
				>
				<input
					id="order"
					name="order"
					type="number"
					min="0"
					value="0"
					class="focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-none dark:border-gray-700 dark:text-white/90"
				/>
				<p class="mt-1 text-xs text-gray-400">Lower number = shown first</p>
			</div>
			<div class="flex items-center gap-3 pt-2">
				<button
					type="submit"
					disabled={loading}
					class="bg-brand-500 hover:bg-brand-600 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
				>
					{loading ? 'Saving...' : 'Save Category'}
				</button>
				<a
					href="/admin/categories"
					class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
					>Cancel</a
				>
			</div>
		</form>
	</div>
</div>
