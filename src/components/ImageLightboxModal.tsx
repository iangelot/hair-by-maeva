"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Calendar, Sparkles } from "lucide-react";
import { ServiceItem } from "@/data/services";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onBook: (service: ServiceItem) => void;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  service,
  onBook,
}: ImageLightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service || !service.image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A0A0D]/85 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${service.name} full view`}
    >
      <div
        className="relative w-full max-w-lg sm:max-w-2xl bg-[#FAF7F2] rounded-none border border-[#E8DFD5] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-[#E8DFD5]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[#4E141B] truncate max-w-[240px] sm:max-w-md">
              {service.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#6B5B56] hover:text-[#4E141B] hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Image Container - natural aspect, zero cropping */}
        <div className="relative flex-1 bg-[#140608] min-h-[300px] max-h-[60vh] sm:max-h-[68vh] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            width={1200}
            height={1600}
            unoptimized
            className="w-auto h-auto max-w-full max-h-[58vh] sm:max-h-[64vh] object-contain block mx-auto select-none"
            priority
          />
        </div>

        {/* Details & Action Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#4E141B]">
                ${service.price}
              </span>
              {service.lengths && service.lengths.length > 0 && (
                <span className="text-xs text-[#6B5B56]">
                  (Options available: ${service.lengths[0].price} - ${service.lengths[service.lengths.length - 1].price})
                </span>
              )}
            </div>
            {service.notice && (
              <p className="text-xs text-[#6B5B56] mt-0.5 font-medium">
                {service.notice}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onBook(service);
            }}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-[#4E141B] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#3A0E14] active:bg-[#2A0A0E] transition-colors rounded-none touch-manipulation shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            Book This Style
          </button>
        </div>
      </div>
    </div>
  );
}
