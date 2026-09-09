"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ServiceItem, servicesData as initialServices } from "@/data/services";
import { siteConfig as initialSiteConfig, SiteConfig } from "@/data/siteConfig";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface BookingRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  selectedLength?: string;
  totalPrice: number;
  depositAmount: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status: "pending_deposit" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  paymentReference?: string;
  paymentMethod?: string;
  zelleSenderName?: string;
  zelleMemo?: string;
  zelleProofImage?: string;
}

export interface PaymentSettings {
  recipientName: string;
  phone: string;
  email: string;
  zelleRecipientName: string;
  zelleEmail: string;
  zellePhone: string;
  zelleIdentifier: string;
  paypalEmail: string;
  paypalPhone: string;
  applePayNumber: string;
  cashAppCashtag: string;
  venmoHandle: string;
  squareBookingLink: string;
  stripePaymentLink: string;
  instructions: string;
}

interface StoreContextType {
  // Services
  services: ServiceItem[];
  addService: (newService: Omit<ServiceItem, "id">) => void;
  updateService: (id: string, updated: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Bookings
  bookings: BookingRecord[];
  createBooking: (booking: Omit<BookingRecord, "id" | "createdAt" | "status">) => BookingRecord;
  updateBookingStatus: (id: string, status: BookingRecord["status"]) => void;
  updateBookingDetails: (id: string, details: Partial<BookingRecord>) => void;
  deleteBooking: (id: string) => void;

  // Hero Images / Posters
  heroImages: SiteConfig["heroImages"];
  addHeroImage: (image: SiteConfig["heroImages"][0]) => void;
  deleteHeroImage: (id: string) => void;

  // Payment & Salon Settings
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  salonInfo: {
    name: string;
    phone: string;
    email: string;
    location: string;
    notice: string;
  };
  updateSalonInfo: (info: Partial<StoreContextType["salonInfo"]>) => void;

  // Policies
  policies: SiteConfig["policies"];
  updatePolicies: (policies: SiteConfig["policies"]) => void;

  // Reset to defaults
  resetToDefaults: () => void;
}

const defaultPaymentSettings: PaymentSettings = {
  recipientName: "Awa Diongue",
  phone: "+1 (773) 269-7505",
  email: "Maevausa@outlook.com",
  zelleRecipientName: "Awa Diongue",
  zelleEmail: "Maevausa@outlook.com",
  zellePhone: "+1 (773) 269-7505",
  zelleIdentifier: "+1 (773) 269-7505 (Awa Diongue)",
  paypalEmail: "",
  paypalPhone: "+1 (773) 269-7505",
  applePayNumber: "+1 (773) 269-7505",
  cashAppCashtag: "+1 (773) 269-7505 (Awa Diongue)",
  venmoHandle: "",
  squareBookingLink: "",
  stripePaymentLink: "",
  instructions: "Deposits are $20 and are strictly non-refundable. Send $20 deposit via Cash App, Zelle, or Apple Pay to Awa Diongue using phone +1 (773) 269-7505. Remaining balance is CASH ONLY at appointment!",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [heroImages, setHeroImages] = useState(initialSiteConfig.heroImages);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [salonInfo, setSalonInfo] = useState({
    name: initialSiteConfig.name,
    phone: initialSiteConfig.phone,
    email: initialSiteConfig.email,
    location: initialSiteConfig.location,
    notice: initialSiteConfig.notice,
  });
  const [policies, setPolicies] = useState(initialSiteConfig.policies);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedServices = localStorage.getItem("beas_admin_services_v7");
      if (savedServices) {
        const parsed: ServiceItem[] = JSON.parse(savedServices);
        const merged = parsed.map((s) => {
          const initial = initialServices.find((init) => init.id === s.id || init.name.toLowerCase() === s.name.toLowerCase());
          let updated = { ...s };
          // Ensure default deposit is $20
          if (updated.deposit === 50 || !updated.deposit) {
            updated.deposit = 20;
          }
          if ((!updated.image || updated.image.trim() === "") && initial?.image) {
            updated.image = initial.image;
          }
          if ((!updated.notice || updated.notice.trim() === "") && initial?.notice) {
            updated.notice = initial.notice;
          }
          return updated;
        });
        setServices(merged);
        localStorage.setItem("beas_admin_services_v7", JSON.stringify(merged));
      } else {
        setServices(initialServices);
        localStorage.setItem("beas_admin_services_v7", JSON.stringify(initialServices));
      }

      const savedBookings = localStorage.getItem("beas_admin_bookings");
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      // Fetch live cloud bookings from Supabase if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              const mapped: BookingRecord[] = data.map((d: any) => ({
                id: d.id,
                clientName: d.client_name,
                clientPhone: d.client_phone,
                clientEmail: d.client_email || "",
                serviceId: d.service_id || "",
                serviceName: d.service_name,
                selectedLength: d.selected_length,
                totalPrice: Number(d.total_amount ?? d.total_price ?? 0),
                depositAmount: Number(d.deposit_amount ?? 20),
                appointmentDate: d.appointment_date,
                appointmentTime: d.appointment_time,
                notes: d.notes,
                status: d.status,
                createdAt: d.created_at,
                paymentReference: d.reference_code || d.payment_reference,
                zelleSenderName: d.zelle_sender_name,
                zelleMemo: d.zelle_memo,
              }));
              setBookings(mapped);
              try {
                localStorage.setItem("beas_admin_bookings", JSON.stringify(mapped));
              } catch {}
            }
          });
      }

      const savedImages = localStorage.getItem("beas_admin_hero_images_v5");
      if (savedImages) {
        setHeroImages(JSON.parse(savedImages));
      } else {
        setHeroImages(initialSiteConfig.heroImages);
        localStorage.setItem("beas_admin_hero_images_v5", JSON.stringify(initialSiteConfig.heroImages));
      }

      const savedPayment = localStorage.getItem("beas_admin_payment_settings_v7");
      if (savedPayment) {
        setPaymentSettings(JSON.parse(savedPayment));
      } else {
        setPaymentSettings(defaultPaymentSettings);
        localStorage.setItem("beas_admin_payment_settings_v7", JSON.stringify(defaultPaymentSettings));
      }

      const savedInfo = localStorage.getItem("beas_admin_salon_info_v7");
      if (savedInfo) {
        setSalonInfo(JSON.parse(savedInfo));
      } else {
        const freshInfo = {
          name: initialSiteConfig.name,
          phone: initialSiteConfig.phone,
          email: initialSiteConfig.email,
          location: initialSiteConfig.location,
          notice: initialSiteConfig.notice,
        };
        setSalonInfo(freshInfo);
        localStorage.setItem("beas_admin_salon_info_v7", JSON.stringify(freshInfo));
      }

      const savedPolicies = localStorage.getItem("beas_admin_policies_v1");
      if (savedPolicies) {
        setPolicies(JSON.parse(savedPolicies));
      } else {
        setPolicies(initialSiteConfig.policies);
        localStorage.setItem("beas_admin_policies_v1", JSON.stringify(initialSiteConfig.policies));
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_services_v7", JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_bookings", JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_hero_images_v5", JSON.stringify(heroImages));
    } catch {}
  }, [heroImages]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_payment_settings_v7", JSON.stringify(paymentSettings));
    } catch {}
  }, [paymentSettings]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_salon_info_v7", JSON.stringify(salonInfo));
    } catch {}
  }, [salonInfo]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_policies_v1", JSON.stringify(policies));
    } catch {}
  }, [policies]);

  // Actions
  const addService = (newService: Omit<ServiceItem, "id">) => {
    const id = `service-${Date.now()}`;
    setServices((prev) => [...prev, { ...newService, id }]);
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const createBooking = (bookingData: Omit<BookingRecord, "id" | "createdAt" | "status">) => {
    const ref = bookingData.paymentReference || `HBM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: BookingRecord = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      paymentReference: ref,
      status: "pending_deposit",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newRecord, ...prev]);

    // Dispatch background email notification & Supabase sync
    try {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      }).catch((err) => console.warn("Background notification dispatch:", err));
    } catch {}

    return newRecord;
  };

  const updateBookingStatus = (id: string, status: BookingRecord["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from("bookings").update({ status }).eq("id", id).then();
    }
  };

  const updateBookingDetails = (id: string, details: Partial<BookingRecord>) => {
    let updatedRecord: BookingRecord | null = null;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          updatedRecord = { ...b, ...details };
          return updatedRecord;
        }
        return b;
      })
    );

    if (updatedRecord) {
      try {
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecord),
        }).catch((err) => console.warn("Background notification dispatch:", err));
      } catch {}
    }

    if (isSupabaseConfigured && supabase) {
      const dbPayload: Record<string, any> = {};
      if (details.zelleSenderName !== undefined) dbPayload.zelle_sender_name = details.zelleSenderName;
      if (details.zelleMemo !== undefined) dbPayload.zelle_memo = details.zelleMemo;
      if (details.status !== undefined) dbPayload.status = details.status;
      if (Object.keys(dbPayload).length > 0) {
        supabase.from("bookings").update(dbPayload).eq("id", id).then();
      }
    }
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase.from("bookings").delete().eq("id", id).then();
    }
  };

  const addHeroImage = (image: SiteConfig["heroImages"][0]) => {
    setHeroImages((prev) => [...prev, image]);
  };

  const deleteHeroImage = (id: string) => {
    setHeroImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateSalonInfo = (info: Partial<StoreContextType["salonInfo"]>) => {
    setSalonInfo((prev) => ({ ...prev, ...info }));
  };

  const updatePolicies = (newPolicies: SiteConfig["policies"]) => {
    setPolicies(newPolicies);
  };

  const resetToDefaults = () => {
    if (confirm("Reset all services and settings back to original defaults?")) {
      setServices(initialServices);
      setHeroImages(initialSiteConfig.heroImages);
      setPaymentSettings(defaultPaymentSettings);
      setSalonInfo({
        name: initialSiteConfig.name,
        phone: initialSiteConfig.phone,
        email: initialSiteConfig.email,
        location: initialSiteConfig.location,
        notice: initialSiteConfig.notice,
      });
      setPolicies(initialSiteConfig.policies);
      localStorage.clear();
    }
  };

  return (
    <StoreContext.Provider
      value={{
        services,
        addService,
        updateService,
        deleteService,
        bookings,
        createBooking,
        updateBookingStatus,
        updateBookingDetails,
        deleteBooking,
        heroImages,
        addHeroImage,
        deleteHeroImage,
        paymentSettings,
        updatePaymentSettings,
        salonInfo,
        updateSalonInfo,
        policies,
        updatePolicies,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
