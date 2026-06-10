import { pusherClientConfig } from '$lib/server/pusher';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform }) => {
	return { pusher: pusherClientConfig(platform?.env) };
};
