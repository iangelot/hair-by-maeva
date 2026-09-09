"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Check, ExternalLink, ShieldCheck, DollarSign, Copy, CheckCircle2 } from "lucide-react";
import { useStore, BookingRecord } from "@/context/StoreContext";
import { ServiceItem } from "@/data/services";
import { downloadIcsCalendar, getGoogleCalendarUrl } from "@/utils/calendar";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceItem | null;
  initialLength?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  initialService,
  initialLength,
}: BookingModalProps) {
  const { services, createBooking, updateBookingDetails, paymentSettings, salonInfo } = useStore();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService?.id || (services[0] ? services[0].id : "")
  );
  const [selectedLength, setSelectedLength] = useState<string>(
    initialLength || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [hairNotes, setHairNotes] = useState("");
  const [step, setStep] = useState<"details" | "confirmation">("details");
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [zelleSenderInput, setZelleSenderInput] = useState("");
  const [zelleMemoInput, setZelleMemoInput] = useState("");
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "Zelle" | "PayPal" | "Apple Pay" | "Cash App / Venmo"
  >("Zelle");

  if (!isOpen) return null;

  const currentService =
    services.find((s) => s.id === selectedServiceId) || services[0] || {
      id: "unknown",
      name: "Braiding Service",
      price: 200,
      deposit: 20,
      duration: "4h",
      lengths: [],
    };

  const lengthObj = currentService.lengths?.find(
    (l) => l.name === selectedLength
  );
  const totalPrice = lengthObj ? lengthObj.price : currentService.price;

  const availableTimes = [
    "09:00 AM",
    "10:30 AM",
    "12:00 PM",
    "01:30 PM",
    "03:00 PM",
    "04:30 PM",
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert("Please complete all required fields.");
      return;
    }

    const refCode = `HBM-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save into Admin Store
    const newBooking = createBooking({
      clientName,
      clientPhone,
      clientEmail,
      serviceId: currentService.id,
      serviceName: currentService.name,
      selectedLength,
      totalPrice,
      depositAmount: currentService.deposit,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      notes: hairNotes,
      paymentReference: refCode,
    });

    setCreatedBooking(newBooking);
    setZelleSenderInput(clientName);
    setVerificationSubmitted(false);
    setStep("confirmation");
  };

  const handleCopyReference = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdBooking) return;
    updateBookingDetails(createdBooking.id, {
      paymentMethod: selectedPaymentMethod,
      zelleSenderName: zelleSenderInput.trim() || clientName,
      zelleMemo: `${selectedPaymentMethod}: ${zelleMemoInput.trim() || createdBooking.paymentReference}`.trim(),
    });
    setVerificationSubmitted(true);
  };

  const handleReset = () => {
    setStep("details");
    setVerificationSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#140608]/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E8DFD5] rounded-none shadow-2xl my-4 sm:my-8 max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E8DFD5] flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-medium text-[#4E141B]">
              {step === "confirmation"
                ? "Appointment Reserved"
                : "Schedule an Appointment"}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#6B5B56] uppercase tracking-wider mt-0.5">
              {salonInfo.name} • {salonInfo.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B5B56] hover:text-[#4E141B] hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1">
          {step === "details" ? (
            <form onSubmit={handleBookingSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Square Link Banner if configured */}
              {paymentSettings.squareBookingLink && (
                <div className="p-3.5 bg-[#F5EFE6] border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4E141B]">
                  <span>
                    Prefer to book directly on Square Appointments?
                  </span>
                  <a
                    href={paymentSettings.squareBookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-[#4E141B] underline underline-offset-4 hover:text-[#C5A059]"
                  >
                    Open Square Scheduler
                    <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#C5A059]" />
                  </a>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-2">
                  1. Select Braiding Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setSelectedLength("");
                  }}
                  className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — ${service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Length selector if available */}
              {currentService.lengths && currentService.lengths.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-2">
                    2. Select Option / Length
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentService.lengths.map((len) => {
                      const isSelected =
                        selectedLength === len.name ||
                        (!selectedLength && len.name === currentService.lengths![0].name);

                      return (
                        <button
                          key={len.name}
                          type="button"
                          onClick={() => setSelectedLength(len.name)}
                          className={`p-2.5 text-xs text-center border rounded-none transition-all touch-manipulation min-h-[44px] ${
                            isSelected
                              ? "border-[#4E141B] bg-[#4E141B] text-white shadow-sm"
                              : "border-[#E8DFD5] text-[#2B1E1E] hover:border-[#C5A059] bg-white"
                          }`}
                        >
                          <div className="font-semibold">{len.name}</div>
                          <div className={`text-[11px] ${isSelected ? "text-[#D8B878]" : "text-[#6B5B56]"}`}>
                            ${len.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-2">
                    3. Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B] mb-2">
                    4. Time Slot *
                  </label>
                  <select
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  >
                    <option value="">Select a time...</option>
                    {availableTimes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4 pt-2 border-t border-[#E8DFD5]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E141B]">
                  5. Client Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (for SMS confirmation) *"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address (for appointment confirmation)"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                />
                <textarea
                  placeholder="Special notes, preferred hair color (e.g., 1B, 4), or existing hair condition..."
                  rows={2}
                  value={hairNotes}
                  onChange={(e) => setHairNotes(e.target.value)}
                  className="w-full p-3 border border-[#E8DFD5] text-sm focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                />
              </div>

              {/* Pricing Summary */}
              <div className="p-4 bg-[#F5EFE6] border border-[#E8DFD5] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6B5B56] uppercase tracking-wider">
                    Total Service Estimate
                  </p>
                  <p className="text-lg font-bold text-[#4E141B]">
                    ${totalPrice}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B5B56] uppercase tracking-wider">
                    Deposit Due Today
                  </p>
                  <p className="text-lg font-bold text-[#C5A059]">
                    ${currentService.deposit}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-xs uppercase tracking-wider font-semibold border border-[#E8DFD5] text-[#6B5B56] hover:bg-[#F5EFE6] rounded-none touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-[#4E141B] text-white hover:bg-[#3A0E14] active:bg-[#2A0A0E] transition-colors rounded-none shadow-sm touch-manipulation min-h-[44px]"
                >
                  Confirm Booking Request
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 sm:p-8 text-center space-y-5">
              <div className="w-14 h-14 bg-[#F5EFE6] text-[#4E141B] border border-[#C5A059] flex items-center justify-center mx-auto rounded-none">
                <Check className="w-7 h-7 text-[#C5A059]" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] bg-[#4E141B] px-2.5 py-1">
                  Step 2 of 2 • Deposit Verification
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-[#4E141B] mt-2 mb-1">
                  Appointment Reserved!
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5B56] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-[#4E141B]">{clientName}</span>. Your reservation for{" "}
                  <span className="font-semibold text-[#4E141B]">{currentService.name}</span> on{" "}
                  <span className="font-semibold text-[#4E141B]">{selectedDate}</span> at{" "}
                  <span className="font-semibold text-[#4E141B]">{selectedTime}</span> is held.
                </p>
              </div>

              {/* Add to Calendar (iPhone / Android) */}
              {createdBooking && (
                <div className="max-w-md mx-auto p-3 bg-white border border-[#E8DFD5] space-y-2 text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#4E141B]">
                    Add to Your Phone Calendar:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadIcsCalendar({
                          title: `${currentService.name} - ${clientName}`,
                          clientName,
                          clientPhone,
                          clientEmail,
                          serviceName: currentService.name,
                          selectedLength,
                          date: selectedDate,
                          time: selectedTime,
                          depositAmount: currentService.deposit,
                          totalPrice,
                          paymentReference: createdBooking.paymentReference,
                          location: salonInfo.location,
                          notes: hairNotes,
                        })
                      }
                      className="p-2 bg-[#FAF7F2] border border-[#4E141B] text-[#4E141B] hover:bg-[#4E141B] hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 touch-manipulation min-h-[38px]"
                    >
                      <span>📱 Apple / iPhone (.ics)</span>
                    </button>
                    <a
                      href={getGoogleCalendarUrl({
                        title: `${currentService.name} - ${clientName}`,
                        clientName,
                        clientPhone,
                        clientEmail,
                        serviceName: currentService.name,
                        selectedLength,
                        date: selectedDate,
                        time: selectedTime,
                        depositAmount: currentService.deposit,
                        totalPrice,
                        paymentReference: createdBooking.paymentReference,
                        location: salonInfo.location,
                        notes: hairNotes,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#FAF7F2] border border-[#C5A059] text-[#4E141B] hover:bg-[#C5A059] hover:text-[#140608] text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 touch-manipulation min-h-[38px]"
                    >
                      <span>📅 Google / Android</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Unique Verification Reference */}
              <div className="max-w-md mx-auto p-3.5 bg-white border border-[#C5A059] flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B5B56]">
                    Your Unique Booking Reference:
                  </span>
                  <p className="text-base font-mono font-bold text-[#4E141B] tracking-wider">
                    {createdBooking?.paymentReference || "HBM-PENDING"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyReference(
                      createdBooking?.paymentReference || "HBM-PENDING"
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] hover:border-[#4E141B] text-[11px] font-semibold text-[#4E141B] transition-colors"
                  title="Copy reference code to paste into Zelle memo"
                >
                  <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              {/* Deposit Instructions (All US Payment Methods) */}
              <div className="max-w-md mx-auto p-5 bg-[#F5EFE6] border border-[#E8DFD5] text-left text-xs space-y-3.5 text-[#2B1E1E]">
                <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-2.5">
                  <div className="flex items-center gap-2 text-[#4E141B] font-semibold text-sm">
                    <DollarSign className="w-4 h-4 text-[#C5A059]" />
                    <span>Deposit Due: ${currentService.deposit}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    Holds Your Slot
                  </span>
                </div>

                <p className="text-[#6B5B56] leading-relaxed text-[11px]">
                  Choose your preferred payment method below to send your <strong>${currentService.deposit}</strong> deposit to salon owner <strong>Awa Diongue</strong>:
                </p>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {(["Zelle", "PayPal", "Apple Pay", "Cash App / Venmo"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`p-2 text-center text-[11px] font-semibold border transition-all ${
                        selectedPaymentMethod === method
                          ? "border-[#4E141B] bg-[#4E141B] text-white"
                          : "border-[#E8DFD5] bg-white text-[#2B1E1E] hover:border-[#C5A059]"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {/* Method Specific Details */}
                <div className="space-y-2 bg-white p-3.5 border border-[#E8DFD5] text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                    <span className="text-[#6B5B56]">Recipient Name:</span>
                    <strong className="text-[#4E141B] font-semibold">Awa Diongue</strong>
                  </div>

                  {selectedPaymentMethod === "Zelle" && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">Zelle Phone:</span>
                        <strong className="text-[#4E141B] font-mono font-semibold">(773) 269-7505</strong>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">Zelle Email:</span>
                        <strong className="text-[#4E141B] font-semibold">Maevausa@outlook.com</strong>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "PayPal" && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">PayPal Email:</span>
                        <strong className="text-[#4E141B] font-semibold">Maevausa@outlook.com</strong>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">PayPal Phone:</span>
                        <strong className="text-[#4E141B] font-mono font-semibold">(773) 269-7505</strong>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "Apple Pay" && (
                    <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                      <span className="text-[#6B5B56]">Apple Pay Phone:</span>
                      <strong className="text-[#4E141B] font-mono font-semibold">(682) 454-1530</strong>
                    </div>
                  )}

                  {selectedPaymentMethod === "Cash App / Venmo" && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">Cash App Cashtag:</span>
                        <strong className="text-[#4E141B] font-mono font-semibold">$BANDSOFTHAIR</strong>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                        <span className="text-[#6B5B56]">Venmo / Contact:</span>
                        <strong className="text-[#4E141B] font-mono font-semibold">(682) 454-1530</strong>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-start py-0.5">
                    <span className="text-[#6B5B56]">Required Memo:</span>
                    <span className="text-right font-mono font-bold text-[#4E141B]">
                      {createdBooking?.paymentReference} - {clientName}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#6B5B56] space-y-1 pt-1">
                  <p>• Studio: <strong>Home-based in Chicago, Illinois</strong></p>
                  <p>• Deposit is credited toward your total remaining balance (Cash Only at appointment).</p>
                </div>
              </div>

              {/* WHO SENT WHAT: Real-time Payment Verification Form */}
              <div className="max-w-md mx-auto p-4 sm:p-5 bg-white border-2 border-[#C5A059] text-left text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <h4 className="font-semibold text-sm text-[#4E141B]">
                    Payment Verification
                  </h4>
                </div>

                {verificationSubmitted ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>Deposit Verification Submitted!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Awa Diongue has been notified that your deposit was sent via <strong>{selectedPaymentMethod}</strong> by <strong>{zelleSenderInput}</strong> (Ref: <strong>{createdBooking?.paymentReference}</strong>). You will receive confirmation once verified.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyPayment} className="space-y-3">
                    <p className="text-[11px] text-[#6B5B56] leading-relaxed">
                      To help <strong>Awa Diongue</strong> verify your deposit immediately, enter your payment account name:
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                        Payment Method Used
                      </label>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                        className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                      >
                        <option value="Cash App / Venmo">Cash App ($BANDSOFTHAIR)</option>
                        <option value="Apple Pay">Apple Pay (682-454-1530)</option>
                        <option value="Zelle">Zelle (773-269-7505 / Maevausa@outlook.com)</option>
                        <option value="PayPal">PayPal (Maevausa@outlook.com)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                        Name on Your Payment Account *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Doe (or your bank / PayPal name)"
                        value={zelleSenderInput}
                        onChange={(e) => setZelleSenderInput(e.target.value)}
                        className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                        Confirmation / Memo Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. Sent ${selectedPaymentMethod} / ${createdBooking?.paymentReference}`}
                        value={zelleMemoInput}
                        onChange={(e) => setZelleMemoInput(e.target.value)}
                        className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#4E141B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#3A0E14] rounded-none transition-colors touch-manipulation min-h-[44px]"
                    >
                      Confirm I Sent My Deposit
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 text-xs uppercase tracking-widest font-semibold bg-[#FAF7F2] border border-[#4E141B] text-[#4E141B] hover:bg-[#4E141B] hover:text-white rounded-none transition-colors touch-manipulation min-h-[44px]"
                >
                  Close & Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
