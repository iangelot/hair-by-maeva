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

const cloudSyncTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function getAdminKey(): string | null {
  try {
    return sessionStorage.getItem("hbm_admin_key");
  } catch {
    return null;
  }
}

function queueCloudSync(key: string, value: unknown) {
  const adminKey = getAdminKey();
  if (!adminKey) return;
  if (cloudSyncTimers[key]) clearTimeout(cloudSyncTimers[key]);
  cloudSyncTimers[key] = setTimeout(() => {
    fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ key, value }),
    }).catch((err) => console.warn("Cloud sync dispatch:", err));
  }, 600);
}

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
      const savedServices = localStorage.getItem("beas_admin_services_v8");
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
        localStorage.setItem("beas_admin_services_v8", JSON.stringify(merged));
      } else {
        setServices(initialServices);
        localStorage.setItem("beas_admin_services_v8", JSON.stringify(initialServices));
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

      const savedImages = localStorage.getItem("beas_admin_hero_images_v6");
      if (savedImages) {
        setHeroImages(JSON.parse(savedImages));
      } else {
        setHeroImages(initialSiteConfig.heroImages);
        localStorage.setItem("beas_admin_hero_images_v6", JSON.stringify(initialSiteConfig.heroImages));
      }

      const savedPayment = localStorage.getItem("beas_admin_payment_settings_v8");
      if (savedPayment) {
        setPaymentSettings(JSON.parse(savedPayment));
      } else {
        setPaymentSettings(defaultPaymentSettings);
        localStorage.setItem("beas_admin_payment_settings_v8", JSON.stringify(defaultPaymentSettings));
      }

      const savedInfo = localStorage.getItem("beas_admin_salon_info_v8");
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
        localStorage.setItem("beas_admin_salon_info_v8", JSON.stringify(freshInfo));
      }

      const savedPolicies = localStorage.getItem("beas_admin_policies_v2");
      if (savedPolicies) {
        setPolicies(JSON.parse(savedPolicies));
      } else {
        setPolicies(initialSiteConfig.policies);
        localStorage.setItem("beas_admin_policies_v2", JSON.stringify(initialSiteConfig.policies));
      }

      // Load live site content from Supabase (source of truth for all visitors)
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("site_content")
          .select("key, value")
          .then(({ data, error }) => {
            if (error || !data || data.length === 0) return;
            for (const row of data as { key: string; value: any }[]) {
              try {
                if (row.key === "services" && Array.isArray(row.value) && row.value.length > 0) {
                  setServices(row.value);
                } else if (row.key === "hero_images" && Array.isArray(row.value) && row.value.length > 0) {
                  setHeroImages(row.value);
                } else if (row.key === "payment_settings" && row.value && typeof row.value === "object") {
                  setPaymentSettings((prev) => ({ ...prev, ...row.value }));
                } else if (row.key === "salon_info" && row.value && typeof row.value === "object") {
                  setSalonInfo((prev) => ({ ...prev, ...row.value }));
                } else if (row.key === "policies" && Array.isArray(row.value) && row.value.length > 0) {
                  setPolicies(row.value);
                }
              } catch {}
            }
          });
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_services_v8", JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_bookings", JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_hero_images_v6", JSON.stringify(heroImages));
    } catch {}
  }, [heroImages]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_payment_settings_v8", JSON.stringify(paymentSettings));
    } catch {}
  }, [paymentSettings]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_salon_info_v8", JSON.stringify(salonInfo));
    } catch {}
  }, [salonInfo]);

  useEffect(() => {
    try {
      localStorage.setItem("beas_admin_policies_v2", JSON.stringify(policies));
    } catch {}
  }, [policies]);

  // Actions
  const addService = (newService: Omit<ServiceItem, "id">) => {
    const id = `service-${Date.now()}`;
    const next = [...services, { ...newService, id }];
    setServices(next);
    queueCloudSync("services", next);
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    const next = services.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setServices(next);
    queueCloudSync("services", next);
  };

  const deleteService = (id: string) => {
    const next = services.filter((s) => s.id !== id);
    setServices(next);
    queueCloudSync("services", next);
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
    const next = [...heroImages, image];
    setHeroImages(next);
    queueCloudSync("hero_images", next);
  };

  const deleteHeroImage = (id: string) => {
    const next = heroImages.filter((img) => img.id !== id);
    setHeroImages(next);
    queueCloudSync("hero_images", next);
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    const next = { ...paymentSettings, ...settings };
    setPaymentSettings(next);
    queueCloudSync("payment_settings", next);
  };

  const updateSalonInfo = (info: Partial<StoreContextType["salonInfo"]>) => {
    const next = { ...salonInfo, ...info };
    setSalonInfo(next);
    queueCloudSync("salon_info", next);
  };

  const updatePolicies = (newPolicies: SiteConfig["policies"]) => {
    setPolicies(newPolicies);
    queueCloudSync("policies", newPolicies);
  };

  const resetToDefaults = () => {
    if (confirm("Reset all services and settings back to original defaults?")) {
      setServices(initialServices);
      setHeroImages(initialSiteConfig.heroImages);
      setPaymentSettings(defaultPaymentSettings);
      const freshInfo = {
        name: initialSiteConfig.name,
        phone: initialSiteConfig.phone,
        email: initialSiteConfig.email,
        location: initialSiteConfig.location,
        notice: initialSiteConfig.notice,
      };
      setSalonInfo(freshInfo);
      setPolicies(initialSiteConfig.policies);
      localStorage.clear();
      queueCloudSync("services", initialServices);
      queueCloudSync("hero_images", initialSiteConfig.heroImages);
      queueCloudSync("payment_settings", defaultPaymentSettings);
      queueCloudSync("salon_info", freshInfo);
      queueCloudSync("policies", initialSiteConfig.policies);
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
