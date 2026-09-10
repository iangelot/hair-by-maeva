export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  deposit: number;
  image?: string;
  lengths?: { name: string; price: number }[];
  notice?: string;
}

export const servicesData: ServiceItem[] = [
  // BATCH 3 (KNOTLESS, BOX BRAIDS & TWISTS BY SIZE)
  {
    id: "xsmall-knotless-box-twist",
    name: "Xsmall knotless & box braids & twist",
    price: 220,
    deposit: 20,
    image: "/images/styles/xsmall-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 220 },
      { name: "Mid back", price: 250 },
      { name: "Waist length", price: 300 },
      { name: "Butt length", price: 350 },
    ],
  },
  {
    id: "small-knotless-box-twists",
    name: "Small Knotless & box braids & twists",
    price: 200,
    deposit: 20,
    image: "/images/styles/small-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 200 },
      { name: "Middle back", price: 220 },
      { name: "Waist length", price: 260 },
      { name: "Butt length", price: 300 },
    ],
  },
  {
    id: "medium-knotless-box-twist",
    name: "Medium knotless & box braids & twist",
    price: 180,
    deposit: 20,
    image: "/images/styles/medium-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 180 },
      { name: "Mid back", price: 200 },
      { name: "Waist length", price: 230 },
      { name: "Butt length", price: 260 },
    ],
  },
  {
    id: "jumbo-knotless-box-twist",
    name: "Jumbo knotless & box braids & twist",
    price: 120,
    deposit: 20,
    image: "/images/styles/jumbo-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 120 },
      { name: "Mid back", price: 150 },
      { name: "Waist length", price: 200 },
      { name: "Butt length", price: 220 },
    ],
  },

  // BATCH 2
  {
    id: "miracles-knotless",
    name: "Miracles Knotless braids",
    price: 180,
    deposit: 20,
    image: "/images/styles/miracles-knotless.jpg",
    lengths: [
      { name: "Medium", price: 180 },
      { name: "Small", price: 220 },
      { name: "Xsmall", price: 250 },
    ],
  },
  {
    id: "bora-bora-braids",
    name: "Bora bora braids",
    price: 250,
    deposit: 20,
    image: "/images/styles/bora-bora.jpg",
    lengths: [
      { name: "Medium", price: 250 },
      { name: "Small", price: 300 },
      { name: "Xsmall", price: 350 },
    ],
  },
  {
    id: "boho-knotless",
    name: "Boho knotless",
    price: 230,
    deposit: 20,
    image: "/images/styles/boho-knotless.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 230 },
      { name: "Middle back", price: 250 },
      { name: "Waist length", price: 270 },
      { name: "Butt length", price: 330 },
    ],
  },
  {
    id: "box-braids",
    name: "Box braids",
    price: 200,
    deposit: 20,
    image: "/images/styles/box-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 200 },
      { name: "Middle back", price: 230 },
      { name: "Waist length", price: 260 },
      { name: "Butt length", price: 300 },
    ],
  },
  {
    id: "senegalese-twist",
    name: "Senegalese twist",
    price: 200,
    deposit: 20,
    image: "/images/styles/senegalese-twist.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Bob length", price: 200 },
      { name: "Middle back", price: 230 },
      { name: "Waist length", price: 260 },
      { name: "Butt length", price: 300 },
    ],
  },

  // BATCH 1
  {
    id: "french-curly",
    name: "French curly",
    price: 200,
    deposit: 20,
    image: "/images/styles/french-curly.jpg",
    notice: "Hair is not included",
    lengths: [
      { name: "Medium", price: 200 },
      { name: "Small", price: 250 },
      { name: "Xsmall", price: 300 },
    ],
  },
  {
    id: "half-side-stitch",
    name: "Half side stitch braid",
    price: 220,
    deposit: 20,
    image: "/images/styles/half-side-stitch.jpg",
    lengths: [
      { name: "Mid back", price: 220 },
      { name: "Waist length", price: 260 },
    ],
  },
  {
    id: "fulani-braids",
    name: "Fulani braids",
    price: 200,
    deposit: 20,
    image: "/images/styles/fulani-braids.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Regular braids", price: 200 },
      { name: "Stitch braid", price: 220 },
      { name: "Waist length", price: 250 },
    ],
  },
  {
    id: "ponytail",
    name: "Ponytail",
    price: 180,
    deposit: 20,
    image: "/images/styles/ponytail.jpg",
    notice: "Boho hair is not included",
    lengths: [
      { name: "Regular braids", price: 180 },
      { name: "Stitch braid", price: 220 },
    ],
  },
  {
    id: "micro-twist",
    name: "Micro twist",
    price: 300,
    deposit: 20,
    image: "/images/styles/micro-twist.jpg",
    notice: "Hair is not included",
    lengths: [
      { name: "Mid back", price: 300 },
      { name: "Waist length", price: 350 },
    ],
  },
];
