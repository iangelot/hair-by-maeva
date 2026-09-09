"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Mail, Phone, MapPin, Check } from "lucide-react";

export function NewsletterFooter() {
  const { salonInfo, paymentSettings } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const paymentBadges = [
    "VISA",
    "Mastercard",
    "AMEX",
    "Discover",
    "Apple Pay",
    "Google Pay",
    "Cash App",
    "Square Pay",
  ];

  return (
    <footer id="contact" className="bg-[#26080D] text-[#E8DFD5] pt-14 sm:pt-16 pb-12 border-t border-[#4E141B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-[#3A0E14]">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-2xl font-serif text-[#FAF7F2] tracking-tight flex items-center gap-2">
              <span>{salonInfo.name}</span>
            </h3>
            <p className="text-xs text-[#D6C7B8] max-w-sm leading-relaxed">
              Luxury Protective Braiding & Hair Care. Dedicated to master craftsmanship, neat tension-free parting, and preserving natural hair vitality.
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#D6C7B8]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{salonInfo.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{salonInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{salonInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#C5A059]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D6C7B8]">
              <li>
                <a href="#gallery" className="hover:text-[#FAF7F2] transition-colors py-1 inline-block">
                  Style Posters & Gallery
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FAF7F2] transition-colors py-1 inline-block">
                  Services & Pricing
                </a>
              </li>
              <li>
                <a href="#policies" className="hover:text-[#FAF7F2] transition-colors py-1 inline-block">
                  Booking Guidelines & Policies
                </a>
              </li>
              {paymentSettings.squareBookingLink && (
                <li>
                  <a
                    href={paymentSettings.squareBookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C5A059] transition-colors py-1 inline-block"
                  >
                    Square Appointments Link
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#C5A059]">
              Stay in the Loop
            </h4>
            <p className="text-xs text-[#D6C7B8] leading-relaxed">
              Subscribe to get notified about newly opened weekend calendar slots, seasonal hair discounts, and holiday schedules.
            </p>

            {subscribed ? (
              <div className="p-3.5 bg-[#3A0E14] border border-[#C5A059] text-xs text-[#FAF7F2] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Thank you! You are now subscribed to salon updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1A0508] border border-[#4E141B] px-4 py-3 text-xs text-[#FAF7F2] placeholder-[#8A7A76] focus:outline-none focus:border-[#C5A059] flex-1 rounded-none min-h-[44px]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C5A059] text-[#140608] hover:bg-[#D8B878] active:bg-[#B38D42] text-xs uppercase tracking-wider font-semibold transition-colors rounded-none touch-manipulation min-h-[44px]"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Section: Payment Methods and Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] text-[#A69590]">
            <span>
              © {new Date().getFullYear()} {salonInfo.name}. All rights reserved.
            </span>
          </div>

          {/* Accepted Payment Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#A69590] mr-1">
              Accepted:
            </span>
            {paymentBadges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-1 bg-[#1A0508] border border-[#3A0E14] text-[10px] font-medium tracking-tight text-[#D6C7B8] rounded-none"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
