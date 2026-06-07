"use client";

// Catches errors thrown in the root layout itself (which the segment-level
// error.tsx cannot). Must render its own <html>/<body>.
import "./globals.css";
import MaintenanceNotice from "@/components/common/maintenanceNotice";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <MaintenanceNotice />
      </body>
    </html>
  );
}
