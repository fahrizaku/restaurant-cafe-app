// Suara notifikasi (admin & customer). Browser memblokir audio yang tidak dipicu interaksi
// user (autoplay policy), jadi AudioContext dibuat/di-resume lebih dulu pada
// interaksi pertama — setelah itu beep dari event Pusher bisa berbunyi.

let ctx: AudioContext | null = null;

function unlock() {
	try {
		if (!ctx) ctx = new AudioContext();
		if (ctx.state === 'suspended') ctx.resume().catch(() => {});
	} catch {
		// audio tidak tersedia — abaikan
	}
}

/** Pasang listener unlock pada interaksi pertama. Panggil dari onMount; mengembalikan cleanup. */
export function initNotificationSound(): () => void {
	window.addEventListener('pointerdown', unlock, { passive: true });
	window.addEventListener('keydown', unlock);
	return () => {
		window.removeEventListener('pointerdown', unlock);
		window.removeEventListener('keydown', unlock);
	};
}

export function playNotificationSound() {
	if (!ctx || ctx.state !== 'running') return;
	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = 880;
		gain.gain.setValueAtTime(0.2, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
		osc.start();
		osc.stop(ctx.currentTime + 0.5);
	} catch {
		// abaikan
	}
}
