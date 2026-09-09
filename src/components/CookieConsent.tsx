"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Check, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("hbm_cookie_consent");
      if (!consent) {
        // Show banner after a slight initial delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("hbm_cookie_consent", "accepted");
      document.cookie = "hbm_cart_persistence=true; max-age=31536000; path=/; SameSite=Lax";
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("hbm_cookie_consent", "declined");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-50 bg-[#FAF7F2] border border-[#C5A059] shadow-2xl p-4 sm:p-5 text-left animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-[#4E141B] text-[#C5A059] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="space-y-1.5 flex-1 text-xs text-[#2B1E1E]">
          <h4 className="font-serif font-semibold text-sm text-[#4E141B]">
            Save Your Cart & Choices
          </h4>
          <p className="text-[#6B5B56] leading-relaxed text-[11px]">
            We use cookies to save your hairstyle selections, shopping bag items, and booking preferences so you can return anytime without losing your cart.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-[#4E141B] text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-[#3A0E14] active:bg-[#2A0A0E] transition-colors rounded-none touch-manipulation min-h-[38px] flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Accept Cookies</span>
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-2 border border-[#E8DFD5] text-[#6B5B56] hover:text-[#4E141B] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-h-[38px]"
            >
              Decline
            </button>
          </div>
        </div>

        <button
          onClick={handleDecline}
          className="p-1 text-[#A69590] hover:text-[#4E141B]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
