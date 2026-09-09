"use client";

import React from "react";
import { siteConfig } from "@/data/siteConfig";
import { CheckCircle, ShieldCheck, Scissors } from "lucide-react";

export function PolicySection() {
  const icons = [ShieldCheck, Scissors, CheckCircle];

  return (
    <section id="policies" className="py-14 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DFD5] text-[#2B1E1E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-10 bg-[#C5A059]" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
              Official Guidelines
            </span>
            <span className="h-px w-6 sm:w-10 bg-[#C5A059]" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#4E141B] tracking-tight">
            Salon Policies & Guidelines
          </h2>
          <p className="mt-2.5 text-[#6B5B56] text-xs sm:text-sm leading-relaxed">
            Please carefully review our studio booking policies and preparation instructions prior to scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {siteConfig.policies.map((policy, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={policy.title}
                className="bg-white border border-[#E8DFD5] p-6 flex flex-col justify-between hover:border-[#C5A059] transition-all shadow-sm rounded-none"
              >
                <div>
                  <div className="w-10 h-10 bg-[#F5EFE6] flex items-center justify-center mb-4 text-[#4E141B] border border-[#E8DFD5]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-[#4E141B] mb-3">
                    {policy.title}
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#6B5B56] leading-relaxed">
                    {policy.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preparation checklist banner */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 bg-[#F5EFE6] border border-[#E8DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#4E141B] uppercase tracking-wider">
              Appointment Day Hair Preparation
            </h4>
            <p className="text-xs text-[#6B5B56] mt-1 leading-relaxed">
              Freshly washed with shampoo & conditioner • Fully detangled from root to tip • Blown out bone straight • Zero oils, edge controls, or leave-ins
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
