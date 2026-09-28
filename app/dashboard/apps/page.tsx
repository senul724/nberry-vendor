import { Metadata } from "next";
import { AppsListView } from "@/components/apps/apps-list-view";

export const metadata: Metadata = {
  title: "Applications - Notify Berry Vendor Portal",
  description: "Manage your Notify Berry vendor applications, credentials, and notification webhooks.",
};

export default function AppsPage() {
  return <AppsListView />;
}
