"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Calendar } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";

interface NavbarProps {
  onOpenBooking: () => void;
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Services & Pricing", href: "#services" },
    { label: "Guidelines & Policies", href: "#policies" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl sm:text-2xl lg:text-3xl font-serif tracking-tight text-[#4E141B] hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <span>{siteConfig.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs sm:text-sm font-medium text-[#6B5B56] hover:text-[#4E141B] tracking-wide transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              aria-label="View shopping bag"
              className="relative p-2.5 text-[#4E141B] hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C5A059] text-[#140608] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-none shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Book Appointment CTA Button */}
            <button
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 border border-transparent text-xs uppercase tracking-widest font-semibold bg-[#4E141B] text-white hover:bg-[#3A0E14] active:bg-[#2A0A0E] transition-colors rounded-none shadow-sm touch-manipulation"
            >
              <Calendar className="w-3.5 h-3.5 mr-2 text-[#C5A059]" />
              Book Appointment
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4E141B] hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD5] bg-[#FAF7F2] px-4 pt-4 pb-6 space-y-4 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#4E141B] hover:text-[#C5A059] hover:bg-[#F5EFE6] py-3 px-2 transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E8DFD5]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 text-center text-xs uppercase tracking-widest font-semibold bg-[#4E141B] text-white rounded-none touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
