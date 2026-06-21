"use client";
import { useState, useEffect } from "react";
import CloseIcon from "@/assets/close.svg";

// Bump the suffix when the message changes so a past dismissal doesn't hide
// the new announcement.
const DISMISS_KEY = "jemberry-banner-free-shipping";

export default function AnnouncementBanner() {
  // Start hidden so the server-rendered markup matches the first client paint;
  // reveal only after we've checked localStorage on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen after mount to avoid a hydration
    // mismatch, so the reveal is necessarily a post-render state update.
    if (localStorage.getItem(DISMISS_KEY) !== "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-primary text-white text-center text-sm font-bold tracking-wide px-10 py-2.5">
      <span>FREE SHIPPING ON ALL ORDERS OVER $100 USD</span>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-80 hover:opacity-100"
      >
        <CloseIcon className="w-4 h-4 fill-white" />
      </button>
    </div>
  );
}
