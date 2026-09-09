export interface SiteConfig {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  location: string;
  instagram: string;
  squareBookingUrl: string;
  squareMerchantId: string;
  squareSellerKey: string;
  notice: string;
  policies: {
    title: string;
    items: string[];
  }[];
  heroImages: {
    id: string;
    title: string;
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
}

export const siteConfig: SiteConfig = {
  name: "Hair By Maeva",
  tagline: "Luxury Hairstylist Based in Chicago, IL",
  phone: "+1 (773) 269-7505",
  email: "Maevausa@outlook.com",
  location: "1941 West Huron Street, Chicago, Illinois 60622",
  instagram: "https://instagram.com",
  squareBookingUrl: "",
  squareMerchantId: "",
  squareSellerKey: "",
  notice: "Please read all policies prior to booking. A $20 deposit is required to book (strictly non-refundable). Deposits accepted via Cash App, Zelle, or Apple Pay on phone +1 (773) 269-7505 (Awa Diongue). Remaining balance in cash only.",
  policies: [
    {
      title: "Deposit & Payment Policy",
      items: [
        "Deposits are $20 and are non-refundable. A deposit is required to hold your slot.",
        "Accepted deposit methods: Cash App, Zelle, or Apple Pay using phone +1 (773) 269-7505 (Awa Diongue).",
        "Please send deposit within 30 minutes after booking or appointment will be cancelled!",
        "Remaining balance is to be paid in CASH ONLY. Other forms of payment will not be accepted for final payment!",
      ],
    },
    {
      title: "Studio Guidelines & Extra Guests",
      items: [
        "Kids of yours are allowed ❤️ Any other guest will have to be approved, please contact me!",
        "The address will be given when you get your confirmation text after your deposit.",
        "Give 1 full address and 1 full name. Please check your email for confirmation (Home-based studio in Chicago, IL).",
      ],
    },
    {
      title: "Cancellations, Rescheduling & Late Arrivals",
      items: [
        "If you need to cancel or reschedule, please notify 24-48 hours prior to your appointment date.",
        "No-shows will be charged from booking.",
        "There is a 15 min grace period. A $25 late fee will be added after 15 mins.",
        "After 20 mins your appointment will be cancelled if you have not communicated.",
      ],
    },
    {
      title: "Salon Hours & Booking Slots",
      items: [
        "Tuesday to Sunday: 7:00 AM – 4:00 PM",
        "Booking slots available: 7:00 AM to 4:00 PM",
        "Monday: CLOSED",
      ],
    },
  ],
  heroImages: [
    {
      id: "maeva-hero-1",
      title: "The Official Booking Site for Hair By Maeva",
      src: "/images/posters/hero-maeva-official-booking.jpg",
      alt: "The Official Booking Site for Hair By Maeva - Luxury Hairstylist Based in Chicago, Illinois",
      width: 1024,
      height: 1024,
    },
    {
      id: "maeva-hero-2",
      title: "Hair By Maeva Salon Policies & Guidelines",
      src: "/images/posters/hero-maeva-official-policies.png",
      alt: "Hair By Maeva Official Policies - Deposit, Remaining Balance, Hours, and Rules",
      width: 1496,
      height: 1051,
    },
    {
      id: "maeva-hero-3",
      title: "Hair By Maeva Signature Braiding Styles",
      src: "/images/posters/hero-maeva-styles-polaroid.png",
      alt: "Hair By Maeva Signature Braids Showcase",
      width: 1200,
      height: 450,
    },
    {
      id: "maeva-hero-4",
      title: "Appointment Preparation & Salon Safe Space",
      src: "/images/posters/hero-maeva-prep-banner.png",
      alt: "Appointment Preparation - My Chair is a Safe Space Filled with Love, Respect, and Confidence",
      width: 1200,
      height: 400,
    },
  ],
};
