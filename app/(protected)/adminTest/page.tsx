import { requireAdmin } from "@/lib/authorization";

export default async function AdminTestPage() {
	const user = await requireAdmin();

	return <div>Authorized admin: {user.email}</div>;
}
