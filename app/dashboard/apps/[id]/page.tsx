import { Metadata } from "next";
import { AppDetailsView } from "@/components/apps/app-details-view";

export const metadata: Metadata = {
  title: "App Settings & Diagnostics - Notify Berry Vendor Portal",
  description: "Manage app settings, metrics, webhook diagnostics, and API credentials.",
};

export default async function AppDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppDetailsView appId={id} />;
}
