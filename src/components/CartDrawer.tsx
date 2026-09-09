"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore, BookingRecord } from "@/context/StoreContext";
import { downloadIcsCalendar, getGoogleCalendarUrl } from "@/utils/calendar";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalAmount,
    totalDeposit,
    clearCart,
  } = useCart();

  const { createBooking, updateBookingDetails, paymentSettings, salonInfo } = useStore();

  // Steps: 'cart' | 'schedule' | 'confirmation'
  const [step, setStep] = useState<"cart" | "schedule" | "confirmation">("cart");

  // Scheduling Form State
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [hairNotes, setHairNotes] = useState("");

  // Confirmation / Zelle Verification State
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [zelleSenderInput, setZelleSenderInput] = useState("");
  const [zelleMemoInput, setZelleMemoInput] = useState("");
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "Cash App" | "Zelle" | "Apple Pay"
  >("Cash App");

  if (!isOpen) return null;

  const availableTimes = [
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleProceedToSchedule = () => {
    if (items.length === 0) return;
    setStep("schedule");
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert("Please enter your date, time slot, name, and phone number.");
      return;
    }

    const dayOfWeek = new Date(selectedDate + "T00:00:00").getDay();
    if (dayOfWeek === 1) {
      alert("Hair By Maeva is CLOSED on Mondays. Please choose a booking date between Tuesday and Sunday (7:00 AM – 4:00 PM).");
      return;
    }

    const primaryItem = items[0];
    const servicesCombinedName = items.map((i) => i.name).join(" + ");
    const refCode = `HBM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = createBooking({
      clientName,
      clientPhone,
      clientEmail,
      serviceId: primaryItem?.serviceId || "cart-service",
      serviceName: servicesCombinedName,
      selectedLength: primaryItem?.selectedLength,
      totalPrice: totalAmount,
      depositAmount: totalDeposit,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      notes: hairNotes,
      paymentReference: refCode,
    });

    setCreatedBooking(newBooking);
    setZelleSenderInput(clientName);
    setVerificationSubmitted(false);
    clearCart();
    setStep("confirmation");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
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

  const handleClose = () => {
    setStep("cart");
    setVerificationSubmitted(false);
    closeCart();
  };

  const calendarPayload = createdBooking
    ? {
        title: `${createdBooking.serviceName} - ${createdBooking.clientName}`,
        clientName: createdBooking.clientName,
        clientPhone: createdBooking.clientPhone,
        clientEmail: createdBooking.clientEmail,
        serviceName: createdBooking.serviceName,
        selectedLength: createdBooking.selectedLength,
        date: createdBooking.appointmentDate,
        time: createdBooking.appointmentTime,
        depositAmount: createdBooking.depositAmount,
        totalPrice: createdBooking.totalPrice,
        paymentReference: createdBooking.paymentReference,
        location: salonInfo.location,
        notes: createdBooking.notes,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#140608]/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#E8DFD5]">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              {step === "schedule" ? (
                <button
                  onClick={() => setStep("cart")}
                  className="p-1.5 text-[#6B5B56] hover:text-[#4E141B] flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-[#4E141B]" />
                  <h2 className="text-base sm:text-lg font-serif font-medium text-[#4E141B]">
                    {step === "confirmation"
                      ? "Appointment Reserved"
                      : "Your Styling Bag"}
                  </h2>
                </>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#6B5B56] hover:text-[#4E141B] hover:bg-[#F5EFE6] transition-colors rounded-none touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* STAGE 1: CART ITEMS */}
            {step === "cart" && (
              <>
                {items.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-[#D6C7B8] mx-auto stroke-[1.2]" />
                    <p className="text-sm text-[#4E141B] font-medium">
                      Your bag is empty.
                    </p>
                    <p className="text-xs text-[#6B5B56]">
                      Browse our braiding styles and add your preferred look.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E8DFD5]">
                    {items.map((item) => (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-[#4E141B]">
                              {item.name}
                            </h4>
                            {item.selectedLength && (
                              <p className="text-xs text-[#6B5B56] mt-0.5">
                                Length: {item.selectedLength}
                              </p>
                            )}
                            <p className="text-xs text-[#C5A059] font-semibold mt-1">
                              Deposit: ${item.deposit * item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-[#4E141B]">
                              ${item.price * item.quantity}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="block text-[#6B5B56] hover:text-red-600 transition-colors ml-auto mt-2 p-1.5 touch-manipulation"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 border border-[#E8DFD5] text-[#4E141B] hover:bg-[#F5EFE6] rounded-none touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-2 text-[#4E141B]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 border border-[#E8DFD5] text-[#4E141B] hover:bg-[#F5EFE6] rounded-none touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STAGE 2: SCHEDULING FORM */}
            {step === "schedule" && (
              <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs text-[#2B1E1E]">
                <div className="bg-white p-3 border border-[#E8DFD5] space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059]">
                    Booking Summary
                  </p>
                  <p className="font-semibold text-[#4E141B] text-sm">
                    {items.map((i) => i.name).join(" + ")}
                  </p>
                  <p className="text-[#6B5B56]">
                    Total: <strong className="text-[#4E141B]">${totalAmount}</strong> • Required Deposit: <strong className="text-[#C5A059]">${totalDeposit}</strong>
                  </p>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                    Select Appointment Date * <span className="font-normal text-[#6B5B56] normal-case">(Tue – Sun)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const day = new Date(val + "T00:00:00").getDay();
                          if (day === 1) {
                            alert("Hair By Maeva is CLOSED on Mondays. Please select a date from Tuesday to Sunday (7:00 AM – 4:00 PM).");
                            setSelectedDate("");
                            return;
                          }
                        }
                        setSelectedDate(val);
                      }}
                      className="w-full p-2.5 pl-9 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                    />
                    <CalendarIcon className="w-4 h-4 text-[#C5A059] absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-[#6B5B56] mt-1">Hours: Tue – Sun, 7:00 AM – 4:00 PM (Closed Mon)</p>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                    Select Start Time *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`p-2 border text-[11px] font-semibold transition-all touch-manipulation min-h-[38px] ${
                          selectedTime === t
                            ? "bg-[#4E141B] text-white border-[#4E141B]"
                            : "bg-white text-[#2B1E1E] border-[#E8DFD5] hover:border-[#C5A059]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="space-y-3 pt-2 border-t border-[#E8DFD5]">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica Williams"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                      Phone Number (for SMS confirmation) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (773) 000-0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. jessica@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E141B] mb-1">
                      Hair Notes or Color Preferences
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Preferred hair color 1B, washed and blown out..."
                      value={hairNotes}
                      onChange={(e) => setHairNotes(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DFD5] text-xs focus:outline-none focus:border-[#4E141B] rounded-none bg-white text-[#2B1E1E]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#4E141B] text-white hover:bg-[#3A0E14] active:bg-[#2A0A0E] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-none touch-manipulation min-h-[44px]"
                  >
                    <span>Reserve Appointment Slot</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </button>
                </div>
              </form>
            )}

            {/* STAGE 3: CONFIRMATION, ZELLE INSTRUCTIONS & CALENDAR */}
            {step === "confirmation" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-[#F5EFE6] text-[#4E141B] border border-[#C5A059] flex items-center justify-center mx-auto rounded-none">
                  <CheckCircle2 className="w-7 h-7 text-[#C5A059]" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-serif text-[#4E141B]">
                    Appointment Logged!
                  </h3>
                  <p className="text-xs text-[#6B5B56] leading-relaxed max-w-sm mx-auto mt-1">
                    Thank you, <strong className="text-[#4E141B]">{clientName}</strong>. Your session for{" "}
                    <strong className="text-[#4E141B]">{createdBooking?.serviceName}</strong> on{" "}
                    <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong> has been registered into our salon calendar.
                  </p>
                </div>

                {/* Calendar Add Buttons */}
                {calendarPayload && (
                  <div className="p-3 bg-white border border-[#E8DFD5] space-y-2 text-left">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#4E141B]">
                      Add to Your Phone Calendar:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => downloadIcsCalendar(calendarPayload)}
                        className="p-2 bg-[#FAF7F2] border border-[#4E141B] text-[#4E141B] hover:bg-[#4E141B] hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 touch-manipulation min-h-[38px]"
                      >
                        <span>📱 Apple / iPhone (.ics)</span>
                      </button>
                      <a
                        href={getGoogleCalendarUrl(calendarPayload)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#FAF7F2] border border-[#C5A059] text-[#4E141B] hover:bg-[#C5A059] hover:text-[#140608] text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 touch-manipulation min-h-[38px]"
                      >
                        <span>📅 Google / Android</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Ref Code Box */}
                <div className="p-3 bg-white border border-[#C5A059] flex items-center justify-between text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B5B56]">
                      Booking Reference:
                    </span>
                    <p className="font-mono font-bold text-sm text-[#4E141B]">
                      {createdBooking?.paymentReference}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(createdBooking?.paymentReference || "")}
                    className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] font-semibold text-[#4E141B] flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{copiedCode ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {/* Deposit Instructions (All US Payment Methods) */}
                <div className="p-4 bg-[#F5EFE6] border border-[#E8DFD5] text-left text-xs space-y-2.5 text-[#2B1E1E]">
                  <div className="flex justify-between items-center border-b border-[#E8DFD5] pb-1.5">
                    <span className="font-semibold text-[#4E141B]">
                      Required Deposit: ${createdBooking?.depositAmount}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5">
                      Holds Your Slot
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B5B56]">
                    Select payment method to send deposit to <strong>Awa Diongue</strong>:
                  </p>

                  {/* Payment Channel Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {(["Cash App", "Zelle", "Apple Pay"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method)}
                        className={`p-1.5 text-center text-[11px] font-semibold border transition-all ${
                          selectedPaymentMethod === method
                            ? "border-[#4E141B] bg-[#4E141B] text-white"
                            : "border-[#E8DFD5] bg-white text-[#2B1E1E] hover:border-[#C5A059]"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {/* Method details */}
                  <div className="bg-white p-3 border border-[#E8DFD5] space-y-1 text-[11px]">
                    <p><span className="text-[#6B5B56]">Recipient:</span> <strong className="text-[#4E141B]">Awa Diongue</strong></p>

                    {selectedPaymentMethod === "Cash App" && (
                      <p><span className="text-[#6B5B56]">Cash App Phone:</span> <strong className="font-mono text-[#4E141B]">+1 (773) 269-7505</strong></p>
                    )}

                    {selectedPaymentMethod === "Zelle" && (
                      <p><span className="text-[#6B5B56]">Zelle Phone:</span> <strong className="font-mono text-[#4E141B]">+1 (773) 269-7505</strong></p>
                    )}

                    {selectedPaymentMethod === "Apple Pay" && (
                      <p><span className="text-[#6B5B56]">Apple Pay Phone:</span> <strong className="font-mono text-[#4E141B]">+1 (773) 269-7505</strong></p>
                    )}

                    <p><span className="text-[#6B5B56]">Memo:</span> <strong className="font-mono text-[#4E141B]">{createdBooking?.paymentReference} - {clientName}</strong></p>
                  </div>
                </div>

                {/* Payment Verification Form */}
                <div className="p-4 bg-white border-2 border-[#C5A059] text-left text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#4E141B]">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>Payment Verification</span>
                  </div>

                  {verificationSubmitted ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px]">
                      ✓ Verification logged! Awa Diongue has been notified that deposit was sent via <strong>{selectedPaymentMethod}</strong> by <strong>{zelleSenderInput}</strong>.
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyPayment} className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#4E141B] mb-0.5">
                          Method Used
                        </label>
                        <select
                          value={selectedPaymentMethod}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                          className="w-full p-1.5 border border-[#E8DFD5] text-xs bg-white text-[#2B1E1E]"
                        >
                          <option value="Cash App">Cash App (+1 773-269-7505)</option>
                          <option value="Zelle">Zelle (+1 773-269-7505)</option>
                          <option value="Apple Pay">Apple Pay (+1 773-269-7505)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#4E141B] mb-0.5">
                          Name on Payment Account *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jane Doe (or name on payment account)"
                          value={zelleSenderInput}
                          onChange={(e) => setZelleSenderInput(e.target.value)}
                          className="w-full p-2 border border-[#E8DFD5] text-xs bg-white text-[#2B1E1E]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#4E141B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#3A0E14]"
                      >
                        Confirm Deposit Sent
                      </button>
                    </form>
                  )}
                </div>

                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-[#FAF7F2] border border-[#4E141B] text-[#4E141B] hover:bg-[#4E141B] hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Done / Close Bag
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer (Only on Cart Stage) */}
          {items.length > 0 && step === "cart" && (
            <div className="p-4 sm:p-5 border-t border-[#E8DFD5] bg-[#F5EFE6] space-y-3.5 flex-shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#6B5B56]">
                  <span>Service Total Estimate</span>
                  <span className="font-semibold text-[#4E141B]">
                    ${totalAmount}
                  </span>
                </div>
                <div className="flex justify-between text-[#6B5B56]">
                  <span>Deposit Due Today</span>
                  <span className="font-semibold text-[#C5A059]">
                    ${totalDeposit}
                  </span>
                </div>
                <p className="text-[10px] text-[#6B5B56] pt-0.5">
                  Remaining balance payable at salon visit ({salonInfo.location}).
                </p>
              </div>

              <button
                onClick={handleProceedToSchedule}
                className="w-full py-3.5 bg-[#4E141B] text-white hover:bg-[#3A0E14] active:bg-[#2A0A0E] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-none touch-manipulation min-h-[44px]"
              >
                <span>Proceed to Appointment Booking</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
