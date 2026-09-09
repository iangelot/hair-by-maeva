# Bea’s Braids — Next.js & Tailwind Web Application

A custom, high-performance clone and modernization of **Bea’s Braids** (originally built on Square Online: `https://beas-braids.square.site/`).

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide React**.

---

## Features

- **Brand & Visual Fidelity**: Replicates the editorial minimalist design (`minimal-black`), clean typography, sharp borders (`rounded-none`), and `#212121` brand identity.
- **Visual Policy Posters Gallery**: Responsive showcase of the salon's core policies, hair preparation rules, and style length guides with high-res fullscreen preview / zoom modal.
- **Interactive Braiding Menu**: Categorized braid styles (Knotless, Boho/Goddess, Stitch & Cornrows, Twists, Men's) with length selection add-ons, price calculations, and deposit breakdowns.
- **Interactive Booking Flow**:
  - Modal with 4-step reservation flow (service, length, date & time picker, contact details, notes).
  - One-click link to the official **Square Appointments** booking page (`https://app.squareup.com/appointments/book/...`).
- **Shopping Bag / Cart Drawer**: Slide-over drawer with item count, quantity management, live total & deposit tally, and checkout simulation.
- **Salon Policies Breakdown**: Categorized sections for Booking & Deposits, Hair Prep Checklist, and Late Policy.
- **Footer**: Square `footer-7` replica with interactive "Stay in the Loop" newsletter subscription, social links, contact info, and accepted payment provider badges (Visa, Mastercard, Amex, Apple Pay, Google Pay, Cash App, Square Pay).

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Configuration

- **Site Information & Square Links**: Edit [`src/data/siteConfig.ts`](./src/data/siteConfig.ts) to update phone numbers, Instagram, policies, or your Square Appointments booking URL.
- **Service Catalog & Pricing**: Edit [`src/data/services.ts`](./src/data/services.ts) to add or edit braiding styles, pricing, duration, and length tiers.
- **Branding & Theme Colors**: Configured in [`tailwind.config.ts`](./tailwind.config.ts).
