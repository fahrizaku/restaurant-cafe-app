import { browser } from '$app/environment';

export interface CartItem {
	menuId: string;
	name: string;
	price: number;
	image: string | null;
	quantity: number;
	notes?: string;
}

const STORAGE_KEY = 'cafe-cart';

function loadFromStorage(): CartItem[] {
	if (!browser) return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(i): i is CartItem =>
				typeof i?.menuId === 'string' &&
				typeof i?.price === 'number' &&
				Number.isInteger(i?.quantity) &&
				i.quantity > 0
		);
	} catch {
		return [];
	}
}

function createCart() {
	let items = $state<CartItem[]>(loadFromStorage());

	const count = $derived(items.reduce((sum, i) => sum + i.quantity, 0));
	const total = $derived(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

	function persist() {
		if (browser) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
			} catch {
				// storage penuh / private mode — abaikan, cart tetap jalan in-memory
			}
		}
	}

	function add(item: Omit<CartItem, 'quantity'>) {
		const existing = items.find((i) => i.menuId === item.menuId);
		if (existing) {
			existing.quantity += 1;
		} else {
			items.push({ ...item, quantity: 1 });
		}
		persist();
	}

	/** Tambah beberapa sekaligus (dari bottom sheet detail); notes menimpa jika diisi. */
	function addMany(item: Omit<CartItem, 'quantity'>, qty: number, notes?: string) {
		if (!Number.isInteger(qty) || qty <= 0) return;
		const trimmed = notes?.trim().slice(0, 200);
		const existing = items.find((i) => i.menuId === item.menuId);
		if (existing) {
			existing.quantity += qty;
			if (trimmed) existing.notes = trimmed;
		} else {
			items.push({ ...item, quantity: qty, notes: trimmed || undefined });
		}
		persist();
	}

	function remove(menuId: string) {
		const idx = items.findIndex((i) => i.menuId === menuId);
		if (idx !== -1) items.splice(idx, 1);
		persist();
	}

	function updateQty(menuId: string, qty: number) {
		if (qty <= 0) {
			remove(menuId);
			return;
		}
		const item = items.find((i) => i.menuId === menuId);
		if (item) item.quantity = qty;
		persist();
	}

	function updateNotes(menuId: string, notes: string) {
		const item = items.find((i) => i.menuId === menuId);
		if (item) item.notes = notes.slice(0, 200);
		persist();
	}

	function clear() {
		items.splice(0, items.length);
		persist();
	}

	return {
		get items() {
			return items;
		},
		get count() {
			return count;
		},
		get total() {
			return total;
		},
		add,
		addMany,
		remove,
		updateQty,
		updateNotes,
		clear
	};
}

export const cart = createCart();
