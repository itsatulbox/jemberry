import type { Metadata } from "next";
import MaintenanceNotice from "@/components/common/maintenanceNotice";

export const metadata: Metadata = {
  title: "Under maintenance | Jemberry Studio",
  description: "Jemberry Studio is briefly offline for maintenance. Back soon!",
  robots: { index: false, follow: false },
};

// Fully static — never touches the database, so it renders even while the
// backend is down.
export const dynamic = "force-static";

export default function MaintenancePage() {
  return <MaintenanceNotice />;
}
