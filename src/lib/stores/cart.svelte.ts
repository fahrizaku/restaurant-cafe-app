export interface CartItem {
	menuId: string;
	name: string;
	price: number;
	image: string | null;
	quantity: number;
}

function createCart() {
	let items = $state<CartItem[]>([]);

	const count = $derived(items.reduce((sum, i) => sum + i.quantity, 0));
	const total = $derived(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

	function add(item: Omit<CartItem, 'quantity'>) {
		const existing = items.find((i) => i.menuId === item.menuId);
		if (existing) {
			existing.quantity += 1;
		} else {
			items.push({ ...item, quantity: 1 });
		}
	}

	function remove(menuId: string) {
		const idx = items.findIndex((i) => i.menuId === menuId);
		if (idx !== -1) items.splice(idx, 1);
	}

	function updateQty(menuId: string, qty: number) {
		if (qty <= 0) {
			remove(menuId);
			return;
		}
		const item = items.find((i) => i.menuId === menuId);
		if (item) item.quantity = qty;
	}

	function clear() {
		items.splice(0, items.length);
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
		remove,
		updateQty,
		clear
	};
}

export const cart = createCart();
