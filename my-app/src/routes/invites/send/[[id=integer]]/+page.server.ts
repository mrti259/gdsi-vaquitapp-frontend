import { groupService, inviteService } from '$lib/server/api';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserId } from '$lib/auth';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const group_id = Number(params.id) || 0;
	const group: Group = await groupService.get(group_id, cookies);
	return { group };
};

export const actions: Actions = {
	default: async ({ cookies, request, params }) => {
		const group_id = Number(params.id) || 0;
		const data = await request.formData();
		const email = data.get('email')?.toString();

		if (!email) {
			throw error(400, 'Receiver Email is required');
		}

		const invite: SendInvite = {
			sender_id: getUserId(cookies),
			receiver_email: email,
			group_id: group_id
		};
		await inviteService.send(invite, cookies);
		redirect(302, `/groups/members/${group_id}`);
	}
};