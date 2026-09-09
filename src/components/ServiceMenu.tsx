"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { ServiceItem } from "@/data/services";
import { useCart } from "@/context/CartContext";
import { Plus, Check, Info, Maximize2 } from "lucide-react";
import { ImageLightboxModal } from "./ImageLightboxModal";

interface ServiceMenuProps {
  onSelectForBooking: (service: ServiceItem, selectedLength?: string) => void;
}

export function ServiceMenu({ onSelectForBooking }: ServiceMenuProps) {
  const { services } = useStore();
  const { addItem } = useCart();
  const [selectedLengths, setSelectedLengths] = useState<Record<string, string>>({});
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);
  const [previewService, setPreviewService] = useState<ServiceItem | null>(null);

  const handleLengthChange = (serviceId: string, lengthName: string) => {
    setSelectedLengths((prev) => ({ ...prev, [serviceId]: lengthName }));
  };

  const handleAddToCart = (service: ServiceItem) => {
    const selectedLenName = selectedLengths[service.id];
    let finalPrice = service.price;
    if (selectedLenName && service.lengths) {
      const match = service.lengths.find((l) => l.name === selectedLenName);
      if (match) finalPrice = match.price;
    }
    const extraPrice = finalPrice - service.price;

    addItem(service, selectedLenName, extraPrice);
    setAddedAnimation(service.id);
    setTimeout(() => setAddedAnimation(null), 1500);
  };

  return (
    <section id="services" className="py-12 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-10 bg-[#C5A059]" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
              Luxury Braid Menu
            </span>
            <span className="h-px w-6 sm:w-10 bg-[#C5A059]" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#4E141B] tracking-tight">
            Services & Pricing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#6B5B56]">
            Tap any hairstyle photo to view the full uncropped image
          </p>
        </div>

        {/* Service Cards Grid - Mobile first 1 col -> 2 col -> 3 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => {
            const currentSelectedLength = selectedLengths[service.id];
            const lengthObj = service.lengths?.find(
              (l) => l.name === currentSelectedLength
            );
            const displayPrice = lengthObj ? lengthObj.price : service.price;

            return (
              <div
                key={service.id}
                className="border border-[#E8DFD5] bg-white flex flex-col justify-between hover:border-[#C5A059] transition-all duration-200 rounded-none shadow-sm hover:shadow-md overflow-hidden group"
              >
                <div>
                  {/* Photo with portrait 3/4 aspect ratio & Click-to-Expand */}
                  {service.image && (
                    <div
                      onClick={() => setPreviewService(service)}
                      className="relative w-full aspect-[3/4] bg-[#F5EFE6] overflow-hidden border-b border-[#E8DFD5] cursor-pointer touch-manipulation group"
                      title="Tap to view full uncropped photo"
                    >
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Expand Overlay Badge - Visible on Mobile & Desktop hover */}
                      <div className="absolute inset-0 bg-[#4E141B]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="py-2 px-3 bg-[#FAF7F2]/95 border border-[#C5A059] text-[#4E141B] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          View Full Photo
                        </span>
                      </div>

                      {/* Subtle Mobile Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-[#140608]/70 backdrop-blur-sm text-white text-[10px] font-medium py-1 px-2 flex items-center gap-1 border border-white/20 sm:hidden">
                        <Maximize2 className="w-3 h-3 text-[#C5A059]" />
                        Full Photo
                      </div>
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Service Title */}
                    <h3 className="text-lg sm:text-xl font-serif font-medium text-[#4E141B] mb-2">
                      {service.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl font-semibold text-[#4E141B]">
                        ${displayPrice}
                      </span>
                    </div>

                    {/* Notice if provided */}
                    {service.notice && (
                      <div className="mb-4 p-2.5 bg-[#F5EFE6] border-l-2 border-[#4E141B] text-xs text-[#4E141B] flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#C5A059]" />
                        <span className="font-medium">{service.notice}</span>
                      </div>
                    )}

                    {/* Options / Sizing / Lengths */}
                    {service.lengths && service.lengths.length > 0 && (
                      <div className="mb-5 space-y-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5B56]">
                          Options / Sizing:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {service.lengths.map((len) => {
                            const isSelected =
                              currentSelectedLength === len.name ||
                              (!currentSelectedLength && len.name === service.lengths![0].name);

                            return (
                              <button
                                key={len.name}
                                type="button"
                                onClick={() => handleLengthChange(service.id, len.name)}
                                className={`p-2.5 text-xs text-left border rounded-none transition-all touch-manipulation min-h-[44px] flex flex-col justify-center ${
                                  isSelected
                                    ? "border-[#4E141B] bg-[#4E141B] text-white shadow-sm"
                                    : "border-[#E8DFD5] text-[#2B1E1E] hover:border-[#C5A059] bg-[#FAF7F2]"
                                }`}
                              >
                                <div className="font-medium truncate">{len.name}</div>
                                <div className={`text-[11px] ${isSelected ? "text-[#D8B878]" : "text-[#6B5B56]"}`}>
                                  ${len.price}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions - Touch Friendly Mobile Layout */}
                <div className="p-5 sm:p-6 pt-0">
                  <div className="pt-4 border-t border-[#E8DFD5] grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleAddToCart(service)}
                      className="flex items-center justify-center py-3 px-3 border border-[#4E141B] text-xs font-semibold uppercase tracking-wider text-[#4E141B] hover:bg-[#F5EFE6] active:bg-[#E8DFD5] transition-colors rounded-none touch-manipulation min-h-[44px]"
                    >
                      {addedAnimation === service.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-[#4E141B]" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 mr-1 text-[#C5A059]" />
                          Add to Bag
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectForBooking(service, currentSelectedLength || (service.lengths ? service.lengths[0].name : undefined))}
                      className="py-3 px-3 bg-[#4E141B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#3A0E14] active:bg-[#2A0A0E] transition-colors rounded-none text-center touch-manipulation min-h-[44px] shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Lightbox Modal for Uncropped Viewing */}
      <ImageLightboxModal
        isOpen={!!previewService}
        onClose={() => setPreviewService(null)}
        service={previewService}
        onBook={(svc) => {
          const selectedLen = selectedLengths[svc.id] || (svc.lengths ? svc.lengths[0].name : undefined);
          onSelectForBooking(svc, selectedLen);
        }}
      />
    </section>
  );
}
