"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";

interface HeroGalleryProps {
  onOpenBooking: () => void;
}

export function HeroGallery({ onOpenBooking }: HeroGalleryProps) {
  const { heroImages } = useStore();

  return (
    <section id="gallery" className="bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-0 sm:px-4">
        {/* Seamless Image Stack mirroring Square Online */}
        <div className="flex flex-col items-center space-y-0 divide-y-0">
          {heroImages.map((img, index) => (
            <div
              key={img.id}
              onClick={onOpenBooking}
              className="relative w-full cursor-pointer transition-opacity hover:opacity-95"
              title="Click to book an appointment"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width || 1200}
                height={img.height || 1200}
                priority={index === 0}
                unoptimized
                className="w-full h-auto block object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
