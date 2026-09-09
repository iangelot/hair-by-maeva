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
  phone: "(773) 269-7505",
  email: "Maevausa@outlook.com",
  location: "1941 West Huron Street, Chicago, Illinois 60622",
  instagram: "https://instagram.com",
  squareBookingUrl: "",
  squareMerchantId: "",
  squareSellerKey: "",
  notice: "Please read all policies prior to booking. A $21 deposit is required to book ($20 goes towards your remaining balance, $1 transfer fee).",
  policies: [
    {
      title: "Deposit Policy",
      items: [
        "A $21 deposit is required to book.",
        "$20 will go towards your remaining balance ($1 is the transferring fee).",
        "All deposits are strictly NON-REFUNDABLE!",
      ],
    },
    {
      title: "Scheduling & Rescheduling",
      items: [
        "You may only reschedule ONCE with the same deposit up to 24 hours prior to your appointment.",
        "Rescheduling requests within 24 hours will require a new deposit.",
      ],
    },
    {
      title: "Cancellations & Late Arrivals",
      items: [
        "Cancellations must be made at least 48 hours before your appointment.",
        "Failure to adhere to the cancellation policy will result in a $20 cancellation fee.",
        "Late arrivals of more than 15 minutes may result in rescheduling or a reduced service time.",
      ],
    },
  ],
  heroImages: [
    {
      id: "maeva-hero-1",
      title: "Hair By Maeva - Official Booking & Policies",
      src: "/images/posters/hero-maeva-booking-v3.jpg",
      alt: "Hair By Maeva - Official Booking Site - Illinois, Chicago",
      width: 599,
      height: 1024,
    },
    {
      id: "maeva-hero-2",
      title: "Hair By Maeva - Chicago, IL Location & Policies",
      src: "/images/posters/hero-maeva-policy-v3.jpg",
      alt: "Hair By Maeva - 1941 West Huron Street, Chicago, IL 60622",
      width: 1024,
      height: 854,
    },
    {
      id: "maeva-hero-3",
      title: "Hair By Maeva - Luxury Braids Chicago",
      src: "/images/posters/hero-maeva-styles-v3.jpg",
      alt: "Hair By Maeva - Luxury Braids & Extensions Chicago",
      width: 897,
      height: 1024,
    },
  ],
};
