import { prisma } from "@/lib/prisma";
import { getPendingPlayerAccessRequests } from "@/features/player-access/data/get-pending-player-access-requests";

export async function getAdminDashboardSummary() {
	const [
		activePlayerCount,
		totalRaised,
		draftFundraiserCount,
		completedFundraiserCount,
		publishedFundraiserCount,
		totalFundraiserCount,
		pendingAccessRequests,
	] = await Promise.all([
		prisma.player.count({
			where: {
				status: true,
			},
		}),
		prisma.fundraiserContribution.aggregate({
			_sum: {
				amount: true,
			},
		}),
		prisma.fundraiser.count({
			where: {
				isCompleted: false,
				isPublished: false,
			},
		}),
		prisma.fundraiser.count({
			where: {
				isCompleted: true,
				isPublished: false,
			},
		}),
		prisma.fundraiser.count({
			where: {
				isCompleted: true,
				isPublished: true,
			},
		}),
		prisma.fundraiser.count(),
		getPendingPlayerAccessRequests(),
	]);

	return {
		activePlayerCount,
		totalRaised: totalRaised._sum.amount ?? 0,
		draftFundraiserCount,
		completedFundraiserCount,
		publishedFundraiserCount,
		totalFundraiserCount,
		pendingAccessRequestCount: pendingAccessRequests.length,
	};
}
