"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  useStore,
  BookingRecord,
  PaymentSettings,
} from "@/context/StoreContext";
import { ServiceItem } from "@/data/services";
import { downloadIcsCalendar, getGoogleCalendarUrl } from "@/utils/calendar";
import {
  Scissors,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  ArrowLeft,
  Lock,
  RotateCcw,
  Sparkles,
  Upload,
  MapPin,
  Copy,
} from "lucide-react";

export default function AdminPage() {
  const {
    services,
    addService,
    updateService,
    deleteService,
    bookings,
    updateBookingStatus,
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
  } = useStore();

  // Authentication State & Persistent 45-min Session
  const ADMIN_SESSION_KEY = "hbm_admin_session_auth_v1";
  const SESSION_DURATION_MS = 45 * 60 * 1000; // 45 minutes

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setIsAuthenticated(true);
          // Restore admin key for cloud sync
          if (parsed.key) {
            try {
              sessionStorage.setItem("hbm_admin_key", parsed.key);
            } catch {}
          }
          // Refresh sliding session window
          localStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify({
              authenticated: true,
              key: parsed.key,
              expiresAt: Date.now() + SESSION_DURATION_MS,
            })
          );
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch {}
  }, []);

  // Tabs: 'services' | 'bookings' | 'gallery' | 'payments' | 'policies' | 'subscribers'
  const [activeTab, setActiveTab] = useState<
    "services" | "bookings" | "gallery" | "payments" | "policies" | "subscribers"
  >("services");

  // VIP Subscribers State
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [copiedSubs, setCopiedSubs] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const res = await fetch("/api/newsletter");
      const data = await res.json();
      if (Array.isArray(data.subscribers) && data.subscribers.length > 0) {
        setSubscribers(data.subscribers);
      } else {
        const local = JSON.parse(localStorage.getItem("beas_subscribers") || "[]");
        setSubscribers(local);
      }
    } catch {
      const local = JSON.parse(localStorage.getItem("beas_subscribers") || "[]");
      setSubscribers(local);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleCopyAllSubscribers = () => {
    if (subscribers.length === 0) return;
    navigator.clipboard.writeText(subscribers.join(", "));
    setCopiedSubs(true);
    setTimeout(() => setCopiedSubs(false), 2000);
  };

  // Add / Edit Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState<{
    name: string;
    price: number;
    deposit: number;
    notice: string;
    image: string;
    lengths: { name: string; price: number }[];
  }>({
    name: "",
    price: 200,
    deposit: 20,
    notice: "",
    image: "",
    lengths: [],
  });

  // Add Image State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageTitleInput, setImageTitleInput] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmAndNotifyClient = async (booking: BookingRecord) => {
    setConfirmingId(booking.id);
    updateBookingStatus(booking.id, "confirmed");

    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      const data = await res.json();
      if (data.emailSent) {
        alert(`✅ Deposit verified! Confirmation email has been sent to ${booking.clientName} (${booking.clientEmail}).`);
      } else {
        alert(`✅ Deposit verified! Booking for ${booking.clientName} is now Confirmed.`);
      }
    } catch {
      alert(`✅ Deposit verified! Booking for ${booking.clientName} is now Confirmed.`);
    } finally {
      setConfirmingId(null);
    }
  };

  // Passkey unlock with session storage
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = passkey.trim();
    if (cleanKey === "admin123" || cleanKey.toLowerCase() === "admin") {
      setIsAuthenticated(true);
      setAuthError(false);
      // Normalize to the canonical passkey expected by /api/content
      const syncKey = cleanKey.toLowerCase() === "admin" ? "admin123" : cleanKey;
      try {
        sessionStorage.setItem("hbm_admin_key", syncKey);
        localStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({
            authenticated: true,
            key: syncKey,
            expiresAt: Date.now() + SESSION_DURATION_MS,
          })
        );
      } catch {}
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem("hbm_admin_key");
    } catch {}
    setIsAuthenticated(false);
    setPasskey("");
  };

  // Open Service Modal
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceFormData({
      name: "",
      price: 200,
      deposit: 20,
      notice: "",
      image: "",
      lengths: [],
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setServiceFormData({
      name: service.name,
      price: service.price,
      deposit: service.deposit,
      notice: service.notice || "",
      image: service.image || "",
      lengths: service.lengths ? [...service.lengths] : [],
    });
    setIsServiceModalOpen(true);
  };

  const handleAddLengthTier = () => {
    setServiceFormData((prev) => ({
      ...prev,
      lengths: [...prev.lengths, { name: "", price: prev.price }],
    }));
  };

  const handleUpdateLengthTier = (index: number, field: "name" | "price", value: string | number) => {
    setServiceFormData((prev) => {
      const updated = [...prev.lengths];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, lengths: updated };
    });
  };

  const handleRemoveLengthTier = (index: number) => {
    setServiceFormData((prev) => ({
      ...prev,
      lengths: prev.lengths.filter((_, i) => i !== index),
    }));
  };

  const compressImageFile = (file: File, maxWidth = 800, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve((readerEvent.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((readerEvent.target?.result as string) || "");
        img.src = (readerEvent.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 800, 0.82);
      setServiceFormData((prev) => ({ ...prev, image: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setServiceFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePosterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.85);
      setImageUrlInput(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrlInput(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name.trim()) {
      alert("Please enter a hairstyle name.");
      return;
    }
    if (editingServiceId) {
      updateService(editingServiceId, serviceFormData);
    } else {
      addService(serviceFormData);
    }
    setIsServiceModalOpen(false);
  };

  // Add New Image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput) return;
    addHeroImage({
      id: `img-${Date.now()}`,
      title: imageTitleInput || "Hairstyle Showcase",
      src: imageUrlInput,
      alt: imageTitleInput || "Hair By Maeva Showcase",
      width: 1200,
      height: 1200,
    });
    setImageUrlInput("");
    setImageTitleInput("");
    setIsImageModalOpen(false);
  };

  // Login Barrier
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A0508] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FAF7F2] p-8 border border-[#E8DFD5] rounded-none shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#4E141B] text-[#C5A059] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif text-[#4E141B]">
              Salon Admin Portal
            </h1>
            <p className="text-xs text-[#C5A059] uppercase tracking-widest mt-1 font-semibold">
              Hair By Maeva Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1.5">
                Admin Passkey
              </label>
              <input
                type="password"
                required
                placeholder="Enter passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
              />
              {authError && (
                <p className="text-xs text-red-600 mt-1.5">
                  Incorrect passkey. Please check and try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4E141B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#3A0E14] active:bg-[#2A0A0E] rounded-none transition-colors touch-manipulation min-h-[44px]"
            >
              Sign In to Dashboard
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-[#6B5B56] hover:text-[#4E141B] inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 text-[#C5A059]" /> Back to live site
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#26080D] text-white border-b border-[#4E141B] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-lg font-serif tracking-tight text-white hover:opacity-80 flex items-center gap-2"
              >
                <span className="font-semibold">{salonInfo.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#4E141B] text-[#C5A059] px-2 py-0.5 border border-[#C5A059]/40">
                  Admin
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#C5A059] text-[#140608] hover:bg-[#D8B878] rounded-none transition-colors"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D6C7B8] hover:text-white border border-[#4E141B] rounded-none"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8DFD5] mb-8 overflow-x-auto scrollbar-none bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap touch-manipulation min-h-[44px] ${
              activeTab === "services"
                ? "border-[#4E141B] text-[#4E141B] bg-[#F5EFE6]"
                : "border-transparent text-[#6B5B56] hover:text-[#4E141B]"
            }`}
          >
            <Scissors className="w-4 h-4 text-[#C5A059]" />
            <span>Hairstyles & Services ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-black text-black bg-neutral-50"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Client Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-black text-black bg-neutral-50"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Homepage Posters & Photos ({heroImages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap ${
              activeTab === "payments"
                ? "border-black text-black bg-neutral-50"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>US Payments & Salon Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap ${
              activeTab === "policies"
                ? "border-[#4E141B] text-[#4E141B] bg-[#F5EFE6]"
                : "border-transparent text-[#6B5B56] hover:text-[#4E141B]"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Policies & Guidelines</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("subscribers");
              fetchSubscribers();
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 rounded-none transition-all whitespace-nowrap ${
              activeTab === "subscribers"
                ? "border-[#4E141B] text-[#4E141B] bg-[#F5EFE6]"
                : "border-transparent text-[#6B5B56] hover:text-[#4E141B]"
            }`}
          >
            <Mail className="w-4 h-4 text-[#C5A059]" />
            <span>VIP Subscribers ({subscribers.length})</span>
          </button>
        </div>

        {/* TAB 1: SERVICES MANAGEMENT */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-neutral-200">
              <div>
                <h2 className="text-xl font-serif font-medium text-neutral-900">
                  Manage Braiding Services
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Add, edit prices, durations, or delete hairstyles. Changes reflect live on the website immediately.
                </p>
              </div>
              <button
                onClick={handleOpenAddService}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#212121] text-white text-xs uppercase tracking-widest font-semibold hover:bg-black rounded-none transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Hairstyle
              </button>
            </div>

            {/* Services Table */}
            <div className="bg-white border border-[#E8DFD5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5EFE6] text-[#4E141B] uppercase tracking-wider border-b border-[#E8DFD5]">
                    <tr>
                      <th className="p-4 font-semibold w-20">Photo</th>
                      <th className="p-4 font-semibold">Service Name</th>
                      <th className="p-4 font-semibold">Base Price</th>
                      <th className="p-4 font-semibold">Deposit</th>
                      <th className="p-4 font-semibold">Notice</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFD5]">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-4">
                          {service.image ? (
                            <div className="w-14 h-14 bg-[#F5EFE6] border border-[#E8DFD5] overflow-hidden flex-shrink-0 shadow-sm relative group cursor-pointer"
                              onClick={() => handleOpenEditService(service)}
                              title="Click to view/edit hairstyle photo"
                            >
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-200"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-[#F5EFE6] border border-dashed border-[#D6C7B8] flex items-center justify-center text-[#A69590]">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-[#4E141B] text-sm">
                            {service.name}
                          </div>
                          {service.lengths && service.lengths.length > 0 && (
                            <div className="text-[#6B5B56] text-[11px] mt-0.5">
                              {service.lengths.map((l) => `${l.name}: $${l.price}`).join(" • ")}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-[#4E141B] text-sm">
                          ${service.price}
                        </td>
                        <td className="p-4 text-[#C5A059] font-semibold text-sm">
                          ${service.deposit}
                        </td>
                        <td className="p-4 text-[#6B5B56]">
                          {service.notice ? (
                            <span className="inline-block px-2 py-0.5 bg-[#F5EFE6] text-[#4E141B] border border-[#E8DFD5] text-[11px]">
                              {service.notice}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditService(service)}
                              className="p-2 text-[#4E141B] hover:text-black hover:bg-[#F5EFE6] rounded-none transition-colors"
                              title="Edit service & photo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete "${service.name}" from your braiding menu?`
                                  )
                                ) {
                                  deleteService(service.id);
                                }
                              }}
                              className="p-2 text-[#6B5B56] hover:text-red-600 hover:bg-red-50 rounded-none transition-colors"
                              title="Delete service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-medium text-neutral-900">
                  Client Appointments & Reservations
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage incoming bookings made on the website, verify deposits, and communicate with clients.
                </p>
              </div>
              <div className="text-xs font-medium text-neutral-600">
                Total Bookings:{" "}
                <span className="font-bold text-black">{bookings.length}</span>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white border border-neutral-200 p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-neutral-300 mx-auto stroke-[1.5]" />
                <p className="text-sm font-medium text-neutral-700">
                  No appointments booked yet.
                </p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  When clients schedule knotless braids or styling sessions on the website, their details and contact numbers will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => {
                  const bookedService = services.find(
                    (s) => s.id === booking.serviceId || s.name.toLowerCase() === booking.serviceName.toLowerCase()
                  );

                  return (
                    <div
                      key={booking.id}
                      className="bg-white border border-[#E8DFD5] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm hover:border-[#C5A059] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {bookedService?.image ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5EFE6] border border-[#E8DFD5] overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={bookedService.image}
                              alt={booking.serviceName}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5EFE6] border border-dashed border-[#D6C7B8] flex items-center justify-center text-[#A69590] flex-shrink-0">
                            <Scissors className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-[#4E141B]">
                              {booking.clientName}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : booking.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "cancelled"
                                  ? "bg-neutral-100 text-neutral-500 line-through"
                                  : "bg-[#F5EFE6] text-[#4E141B] border border-[#C5A059]"
                              }`}
                            >
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="text-xs text-[#6B5B56] flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-[#4E141B]">
                              {booking.serviceName}
                            </span>
                            {booking.selectedLength && (
                              <span>• {booking.selectedLength}</span>
                            )}
                            <span>• Total: ${booking.totalPrice}</span>
                            <span className="font-semibold text-[#C5A059]">
                              • Deposit: ${booking.depositAmount}
                            </span>
                          </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Date: {booking.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Time: {booking.appointmentTime}</span>
                        </div>
                      </div>

                      {/* Contact & Location Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-700 pt-1">
                        <a
                          href={`tel:${booking.clientPhone}`}
                          className="flex items-center gap-1 underline underline-offset-2 hover:text-black"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {booking.clientPhone}
                        </a>
                        {booking.clientEmail && (
                          <a
                            href={`mailto:${booking.clientEmail}`}
                            className="flex items-center gap-1 underline underline-offset-2 hover:text-black"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {booking.clientEmail}
                          </a>
                        )}
                        {booking.clientLocation && (
                          <span className="flex items-center gap-1 text-[#4E141B] font-medium bg-[#F5EFE6] px-2 py-0.5 border border-[#E8DFD5]">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                            {booking.clientLocation}
                          </span>
                        )}
                      </div>

                      {/* Deposit Verification & Ref Code */}
                      <div className="mt-2.5 p-3 bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-[#4E141B]">
                            Ref Code: <span className="font-mono bg-white px-2 py-0.5 border border-[#E8DFD5]">{booking.paymentReference || "N/A"}</span>
                          </span>
                          {booking.status === "confirmed" ? (
                            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                              ✓ Deposit Verified & Confirmed
                            </span>
                          ) : booking.zelleSenderName ? (
                            <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-300">
                              ★ Deposit Sent — Needs Awa's Verification
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5">
                              ⏳ Awaiting Deposit Payment
                            </span>
                          )}
                        </div>

                        {booking.zelleSenderName ? (
                          <div className="pt-1 text-[#2B1E1E]">
                            <p>
                              <span className="text-[#6B5B56]">Client Payment Account Name:</span>{" "}
                              <strong className="text-[#4E141B] font-semibold">{booking.zelleSenderName}</strong>
                            </p>
                            {booking.zelleMemo && (
                              <p className="text-[10px] text-[#6B5B56] mt-0.5">
                                Channel & Notes: <em>{booking.zelleMemo}</em>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#6B5B56] italic text-[10px] pt-0.5">
                            Client has not submitted their payment sender name yet.
                          </p>
                        )}
                      </div>

                      {booking.notes && (
                        <p className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 border border-neutral-100 mt-2">
                          Notes: {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                      {/* Calendar sync for iPhone / Android */}
                      <div className="inline-flex items-center gap-1 border border-[#E8DFD5] bg-[#FAF7F2] p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            downloadIcsCalendar({
                              title: `${booking.serviceName} - ${booking.clientName}`,
                              clientName: booking.clientName,
                              clientPhone: booking.clientPhone,
                              clientEmail: booking.clientEmail,
                              serviceName: booking.serviceName,
                              selectedLength: booking.selectedLength,
                              date: booking.appointmentDate,
                              time: booking.appointmentTime,
                              depositAmount: booking.depositAmount,
                              totalPrice: booking.totalPrice,
                              paymentReference: booking.paymentReference,
                              location: salonInfo.location,
                              notes: booking.notes,
                            })
                          }
                          className="px-2 py-1 text-[10px] font-semibold text-[#4E141B] hover:bg-white transition-colors"
                          title="Open/save in Apple Calendar (iPhone / iPad / Mac)"
                        >
                          📱 iPhone Cal (.ics)
                        </button>
                        <span className="text-[#D6C7B8]">|</span>
                        <a
                          href={getGoogleCalendarUrl({
                            title: `${booking.serviceName} - ${booking.clientName}`,
                            clientName: booking.clientName,
                            clientPhone: booking.clientPhone,
                            clientEmail: booking.clientEmail,
                            serviceName: booking.serviceName,
                            selectedLength: booking.selectedLength,
                            date: booking.appointmentDate,
                            time: booking.appointmentTime,
                            depositAmount: booking.depositAmount,
                            totalPrice: booking.totalPrice,
                            paymentReference: booking.paymentReference,
                            location: salonInfo.location,
                            notes: booking.notes,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-[10px] font-semibold text-[#C5A059] hover:bg-white transition-colors"
                          title="Open/save in Google Calendar (Android / PC)"
                        >
                          📅 Google / Android
                        </a>
                      </div>

                      {/* 1-Tap Pre-formatted SMS & Email for Client */}
                      <a
                        href={`sms:${booking.clientPhone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(
                          `Hi ${booking.clientName}! This is Maeva from Hair By Maeva. Your appointment for ${booking.serviceName}${booking.selectedLength ? ` (${booking.selectedLength})` : ""} on ${booking.appointmentDate} at ${booking.appointmentTime} is confirmed! Deposit of $${booking.depositAmount || 20} received. Location: 1941 W Huron St, Chicago, IL 60622. Remaining balance: $${Math.max(0, booking.totalPrice - (booking.depositAmount || 20))} (Cash only). Hair must be washed & blown out. See you then! ✨`
                        )}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        title="Open native Messages app with ready-to-send confirmation text"
                      >
                        💬 Text SMS
                      </a>

                      {booking.clientEmail && (
                        <a
                          href={`mailto:${booking.clientEmail}?subject=${encodeURIComponent(
                            `Appointment Confirmed: ${booking.serviceName} - Hair By Maeva`
                          )}&body=${encodeURIComponent(
                            `Hi ${booking.clientName},\n\nYour appointment with Hair By Maeva is officially confirmed!\n\nService: ${booking.serviceName}${booking.selectedLength ? ` (${booking.selectedLength})` : ""}\nDate: ${booking.appointmentDate}\nTime: ${booking.appointmentTime}\nSalon Address: 1941 West Huron Street, Chicago, IL 60622\nDeposit Verified: $${booking.depositAmount || 20}\nRemaining Balance Due: $${Math.max(0, booking.totalPrice - (booking.depositAmount || 20))} (Cash only at appointment)\n\nPlease arrive with hair washed, detangled, and blown out straight.\n\nThank you,\nMaeva\n+1 (773) 269-7505`
                          )}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#4E141B] bg-[#FAF7F2] border border-[#E8DFD5] hover:bg-white transition-colors flex items-center gap-1"
                          title="Open Mail app with ready-to-send confirmation email"
                        >
                          ✉️ Email Client
                        </a>
                      )}

                      {booking.status !== "confirmed" && (
                        <button
                          onClick={() => handleConfirmAndNotifyClient(booking)}
                          disabled={confirmingId === booking.id}
                          className="px-3 py-1.5 bg-emerald-700 text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-emerald-800 rounded-none transition-colors disabled:opacity-50"
                        >
                          {confirmingId === booking.id ? "Confirming..." : "✓ Confirm Deposit"}
                        </button>
                      )}
                      {booking.status !== "completed" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.id, "completed")
                          }
                          className="px-3 py-1.5 bg-neutral-800 text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-black rounded-none transition-colors"
                        >
                          Completed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this booking record?")) {
                            deleteBooking(booking.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-none transition-colors"
                        title="Delete booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

        {/* TAB 3: HOMEPAGE POSTERS & PHOTOS */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-medium text-neutral-900">
                  Homepage Visual Posters & Gallery
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage the full-width seamless posters displayed on your main page.
                </p>
              </div>
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#212121] text-white text-xs uppercase tracking-widest font-semibold hover:bg-black rounded-none transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Image URL
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="bg-white border border-neutral-200 p-4 space-y-3"
                >
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden border border-neutral-100">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-medium text-neutral-900">
                        {img.title}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                        Poster Position #{idx + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remove this graphic from the homepage?`)) {
                          deleteHeroImage(img.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: US PAYMENTS & SALON SETTINGS */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-neutral-200">
              <h2 className="text-xl font-serif font-medium text-neutral-900">
                US Payment & Deposit Settings
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Configure the payment channels your US clients will use to submit deposits from their phones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Handles */}
              <div className="bg-white border border-[#E8DFD5] p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-[#4E141B] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#C5A059]" />
                  Accepted US Payment Channels
                </h3>
                <p className="text-xs text-[#6B5B56]">
                  Configure your verified deposit details. These are displayed to clients on the booking confirmation and checkout screens.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Recipient Full Name (All Methods)
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.recipientName || paymentSettings.zelleRecipientName || "Awa Diongue"}
                    onChange={(e) =>
                      updatePaymentSettings({
                        recipientName: e.target.value,
                        zelleRecipientName: e.target.value,
                      })
                    }
                    placeholder="Awa Diongue"
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-[#4E141B] rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Payment Phone (Cash App, Zelle, Apple Pay)
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.phone || paymentSettings.zellePhone || "+1 (773) 269-7505"}
                      onChange={(e) =>
                        updatePaymentSettings({
                          phone: e.target.value,
                          zellePhone: e.target.value,
                          applePayNumber: e.target.value,
                          paypalPhone: e.target.value,
                          cashAppCashtag: e.target.value,
                        })
                      }
                      placeholder="+1 (773) 269-7505"
                      className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-[#4E141B] rounded-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.recipientName || "Awa Diongue"}
                      onChange={(e) =>
                        updatePaymentSettings({
                          recipientName: e.target.value,
                          zelleRecipientName: e.target.value,
                        })
                      }
                      placeholder="Awa Diongue"
                      className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-[#4E141B] rounded-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFD5]">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Client Deposit Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.instructions}
                    onChange={(e) =>
                      updatePaymentSettings({ instructions: e.target.value })
                    }
                    placeholder="Deposits accepted via Cash App, Zelle, or Apple Pay on +1 (773) 269-7505..."
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-[#4E141B] rounded-none"
                  />
                </div>
              </div>

              {/* Salon Details */}
              <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-700" />
                  Salon Contact Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Salon Name
                  </label>
                  <input
                    type="text"
                    value={salonInfo.name}
                    onChange={(e) =>
                      updateSalonInfo({ name: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={salonInfo.phone}
                    onChange={(e) =>
                      updateSalonInfo({ phone: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={salonInfo.email}
                    onChange={(e) =>
                      updateSalonInfo({ email: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Studio Location
                  </label>
                  <input
                    type="text"
                    value={salonInfo.location}
                    onChange={(e) =>
                      updateSalonInfo({ location: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetToDefaults}
                    className="text-xs text-neutral-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset all settings to initial defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POLICIES & GUIDELINES */}
        {activeTab === "policies" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-medium text-neutral-900">
                  Salon Policies & Guidelines
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Edit the policy cards displayed on the website. Changes update live on the homepage immediately.
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = [
                    ...policies,
                    { title: "New Policy", items: ["Add your first policy point here"] },
                  ];
                  updatePolicies(updated);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#212121] text-white text-xs uppercase tracking-widest font-semibold hover:bg-black rounded-none transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Policy Section
              </button>
            </div>

            <div className="space-y-6">
              {policies.map((policy, policyIdx) => (
                <div
                  key={policyIdx}
                  className="bg-white border border-[#E8DFD5] p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1">
                        Policy Section Title
                      </label>
                      <input
                        type="text"
                        value={policy.title}
                        onChange={(e) => {
                          const updated = policies.map((p, i) =>
                            i === policyIdx ? { ...p, title: e.target.value } : p
                          );
                          updatePolicies(updated);
                        }}
                        className="w-full p-2.5 border border-[#E8DFD5] text-sm font-serif font-medium text-[#4E141B] focus:outline-none focus:border-[#4E141B] rounded-none bg-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete the entire "${policy.title}" policy section?`)) {
                          const updated = policies.filter((_, i) => i !== policyIdx);
                          updatePolicies(updated);
                        }
                      }}
                      className="p-2 text-[#6B5B56] hover:text-red-600 hover:bg-red-50 rounded-none transition-colors mt-6"
                      title="Delete policy section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B56]">
                        Policy Items ({policy.items.length})
                      </label>
                      <button
                        onClick={() => {
                          const updated = policies.map((p, i) =>
                            i === policyIdx
                              ? { ...p, items: [...p.items, "New policy item"] }
                              : p
                          );
                          updatePolicies(updated);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E141B] hover:text-[#C5A059] bg-[#FAF7F2] border border-[#C5A059] px-2 py-1"
                      >
                        <Plus className="w-3 h-3 text-[#C5A059]" />
                        Add Item
                      </button>
                    </div>

                    {policy.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-2">
                        <span className="text-xs text-[#C5A059] font-bold mt-2.5 w-5 text-right flex-shrink-0">
                          {itemIdx + 1}.
                        </span>
                        <textarea
                          rows={2}
                          value={item}
                          onChange={(e) => {
                            const updated = policies.map((p, i) =>
                              i === policyIdx
                                ? {
                                    ...p,
                                    items: p.items.map((it, j) =>
                                      j === itemIdx ? e.target.value : it
                                    ),
                                  }
                                : p
                            );
                            updatePolicies(updated);
                          }}
                          className="flex-1 p-2.5 border border-[#E8DFD5] text-xs text-[#2B1E1E] focus:outline-none focus:border-[#4E141B] rounded-none bg-white leading-relaxed resize-none"
                        />
                        <button
                          onClick={() => {
                            const updated = policies.map((p, i) =>
                              i === policyIdx
                                ? { ...p, items: p.items.filter((_, j) => j !== itemIdx) }
                                : p
                            );
                            updatePolicies(updated);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors mt-1"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: VIP SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-[#E8DFD5] shadow-sm">
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4E141B] flex items-center gap-2">
                  <span>VIP Newsletter Subscribers</span>
                  <span className="text-xs bg-[#FAF7F2] text-[#C5A059] border border-[#C5A059] px-2.5 py-0.5 font-sans font-bold">
                    {subscribers.length} Contacts
                  </span>
                </h2>
                <p className="text-xs text-[#6B5B56] mt-1">
                  Clients who signed up via the website footer to receive announcements, newly opened slots, and holiday specials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAllSubscribers}
                  disabled={subscribers.length === 0}
                  className="px-4 py-2.5 bg-[#4E141B] text-[#FAF7F2] hover:bg-[#3A0E14] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 disabled:opacity-40"
                >
                  {copiedSubs ? <Check className="w-4 h-4 text-[#C5A059]" /> : <Copy className="w-4 h-4 text-[#C5A059]" />}
                  <span>{copiedSubs ? "Copied All!" : "Copy All Emails"}</span>
                </button>
                <button
                  onClick={fetchSubscribers}
                  disabled={loadingSubs}
                  className="px-3 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] text-[#4E141B] hover:bg-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Refresh subscriber list"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loadingSubs ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {subscribers.length === 0 ? (
              <div className="bg-white p-12 text-center border border-[#E8DFD5]">
                <Mail className="w-8 h-8 text-[#D6C7B8] mx-auto mb-3" />
                <h3 className="text-sm font-serif font-medium text-[#4E141B]">No subscribers yet</h3>
                <p className="text-xs text-[#6B5B56] max-w-sm mx-auto mt-1">
                  When clients sign up on the footer form, their emails will appear right here automatically.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#E8DFD5] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between text-xs font-semibold text-[#4E141B]">
                  <span>Subscriber Email</span>
                  <span>Quick Actions</span>
                </div>
                <div className="divide-y divide-[#E8DFD5]">
                  {subscribers.map((subEmail, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#A69590] w-6">{idx + 1}.</span>
                        <span className="text-sm font-medium text-[#2B1E1E]">{subEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${subEmail}?subject=Special Announcement from Hair By Maeva`}
                          className="px-2.5 py-1 text-xs font-medium text-[#4E141B] bg-[#FAF7F2] border border-[#E8DFD5] hover:bg-white transition-colors"
                        >
                          ✉️ Send Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-neutral-200 rounded-none shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-serif font-medium text-neutral-900">
                {editingServiceId ? "Edit Hairstyle" : "Add New Hairstyle"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Hairstyle / Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Small Bohemian Knotless"
                  value={serviceFormData.name}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, name: e.target.value })
                  }
                  className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Base Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={serviceFormData.price}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Required Deposit ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={serviceFormData.deposit}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        deposit: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 border border-neutral-300 text-xs focus:outline-none focus:border-black rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1">
                  Hair Requirement / Notice (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Boho hair is not included, Hair is not included"
                  value={serviceFormData.notice}
                  onChange={(e) =>
                    setServiceFormData({
                      ...serviceFormData,
                      notice: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                />
              </div>

              {/* Length Variations / Pricing */}
              <div className="border-t border-b border-[#E8DFD5] py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B]">
                      Length Tiers & Pricing
                    </label>
                    <p className="text-[11px] text-[#6B5B56]">
                      Optional: Add length options like Bob, Mid back, Waist, Butt length.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLengthTier}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E141B] hover:text-[#C5A059] bg-[#FAF7F2] border border-[#C5A059] px-2.5 py-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Add Length</span>
                  </button>
                </div>

                {serviceFormData.lengths && serviceFormData.lengths.length > 0 && (
                  <div className="space-y-2 pt-1 max-h-40 overflow-y-auto pr-1">
                    {serviceFormData.lengths.map((len, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Waist length"
                          value={len.name}
                          onChange={(e) => handleUpdateLengthTier(idx, "name", e.target.value)}
                          className="flex-1 p-2 border border-[#E8DFD5] text-xs rounded-none bg-white text-[#2B1E1E]"
                        />
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-xs text-[#6B5B56]">$</span>
                          <input
                            type="number"
                            min="0"
                            value={len.price}
                            onChange={(e) => handleUpdateLengthTier(idx, "price", Number(e.target.value))}
                            className="w-full p-2 border border-[#E8DFD5] text-xs rounded-none bg-white text-[#2B1E1E]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLengthTier(idx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Remove length tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1.5">
                  Hairstyle Photo
                </label>
                
                {/* Upload from device OR enter URL */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#FAF7F2] border border-[#C5A059] text-[#4E141B] text-xs font-semibold hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation">
                      <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Upload from Device / Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleServiceImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-[#6B5B56]">or paste image URL / path below:</span>
                  </div>

                  <input
                    type="text"
                    placeholder="/images/styles/your-photo.jpg or https://..."
                    value={serviceFormData.image}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        image: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  />
                </div>

                {/* Live Photo Preview */}
                {serviceFormData.image ? (
                  <div className="mt-2.5 p-3 bg-[#F5EFE6] border border-[#E8DFD5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-16 h-16 bg-white border border-[#E8DFD5] overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={serviceFormData.image}
                          alt="Preview"
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-[#4E141B]">Photo Ready</p>
                        <p className="text-[11px] text-[#6B5B56] truncate max-w-[200px] sm:max-w-xs">
                          {serviceFormData.image.startsWith("data:") ? "Direct device photo loaded" : serviceFormData.image}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setServiceFormData((prev) => ({ ...prev, image: "" }))}
                      className="text-xs text-red-600 hover:underline flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6B5B56] mt-1 italic">
                    Tip: Upload any photo from your phone or computer, or enter an image link.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E8DFD5] text-xs uppercase tracking-wider font-semibold text-[#6B5B56] rounded-none hover:bg-[#F5EFE6] touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4E141B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#3A0E14] active:bg-[#2A0A0E] rounded-none transition-colors touch-manipulation min-h-[44px]"
                >
                  {editingServiceId ? "Save Changes" : "Add Hairstyle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD IMAGE URL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] max-w-md w-full border border-[#E8DFD5] rounded-none shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5] mb-4">
              <h3 className="text-base font-serif font-medium text-[#4E141B]">
                Add Homepage Photo / Poster
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-[#4E141B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1">
                  Poster Title / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Knotless Braids Portfolio"
                  value={imageTitleInput}
                  onChange={(e) => setImageTitleInput(e.target.value)}
                  className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-1.5">
                  Poster Image Source *
                </label>

                {/* Upload from device OR enter URL */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#C5A059] text-[#4E141B] text-xs font-semibold hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation">
                      <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Upload from Device / Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-[#6B5B56]">or paste image URL:</span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="https://... or /images/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  />
                </div>

                {/* Live Preview */}
                {imageUrlInput && (
                  <div className="mt-2.5 p-3 bg-white border border-[#E8DFD5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-16 h-16 bg-[#F5EFE6] border border-[#E8DFD5] overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={imageUrlInput}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-[#4E141B]">Poster Ready</p>
                        <p className="text-[11px] text-[#6B5B56] truncate max-w-[200px]">
                          {imageUrlInput.startsWith("data:") ? "Image loaded from device" : imageUrlInput}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrlInput("")}
                      className="text-xs text-red-600 hover:underline flex-shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DFD5] text-xs uppercase tracking-wider font-semibold text-[#6B5B56] rounded-none hover:bg-[#F5EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4E141B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#3A0E14] active:bg-[#2A0A0E] rounded-none transition-colors"
                >
                  Add Poster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
