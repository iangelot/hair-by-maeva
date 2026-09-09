"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroGallery } from "@/components/HeroGallery";
import { ServiceMenu } from "@/components/ServiceMenu";
import { PolicySection } from "@/components/PolicySection";
import { BookingModal } from "@/components/BookingModal";
import { CartDrawer } from "@/components/CartDrawer";
import { NewsletterFooter } from "@/components/NewsletterFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { ServiceItem } from "@/data/services";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | undefined>(undefined);

  const handleOpenBooking = () => {
    setSelectedService(null);
    setSelectedLength(undefined);
    setIsBookingOpen(true);
  };

  const handleSelectServiceForBooking = (service: ServiceItem, length?: string) => {
    setSelectedService(service);
    setSelectedLength(length);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Navigation matching Square header */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Main Flow: Seamless visual image stack exactly like Square Online */}
      <main className="flex-1">
        <HeroGallery onOpenBooking={handleOpenBooking} />

        {/* Interactive Online Services & Add-ons Menu */}
        <ServiceMenu onSelectForBooking={handleSelectServiceForBooking} />

        {/* Text Guidelines & Policies */}
        <PolicySection />
      </main>

      {/* Footer matching Square footer-7 */}
      <NewsletterFooter />

      {/* Interactive Booking Flow Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialService={selectedService}
        initialLength={selectedLength}
      />

      {/* Shopping Bag Slide-over */}
      <CartDrawer />

      {/* Cookie & Cart Persistence Banner */}
      <CookieConsent />
    </div>
  );
}
