"use client";

// If any page errors (e.g. the database is unreachable), show the maintenance
// notice instead of a broken page. Self-healing: once the backend recovers,
// pages render normally again.
import MaintenanceNotice from "@/components/common/maintenanceNotice";

export default function Error() {
  return <MaintenanceNotice />;
}
