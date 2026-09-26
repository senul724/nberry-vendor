import { Metadata } from "next";
import { DashboardView } from "@/components/notes/dashboard-view";

export const metadata: Metadata = {
	title: "Dashboard - Notes IAM Demo",
	description: "Manage your secure notes.",
};

export default function DashboardPage() {
	return <DashboardView />;
}
