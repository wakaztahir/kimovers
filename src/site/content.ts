export interface Service {
  slug: string;
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
}

export const images = {
  home: "/assets/photos/movers-wrapping-sofa.jpg",
  team: "/assets/photos/movers-packing.jpg",
  boxes: "/assets/photos/moving-van-load.jpg",
  truck: "/assets/photos/moving-van-load.jpg",
  office: "/assets/photos/dubai-office.jpg",
  interior: "/assets/photos/dubai-living-room.jpg",
  living: "/assets/photos/dubai-marina-towers.jpg",
  pack: "/assets/photos/movers-wrapping-sofa.jpg",
  apartment: "/assets/photos/dubai-marina-skyline.jpg"
} as const;

export const services: readonly Service[] = [
  {
    slug: "apartment-moving",
    title: "Apartment moving",
    description: "Considered moves for studios and city apartments, planned around your building and schedule."
  },
  {
    slug: "house-moving",
    title: "House moving",
    description: "A clear, careful plan for the rooms, furniture and details that make your house yours."
  },
  {
    slug: "villa-moving",
    title: "Villa moving",
    description: "Room-by-room coordination for larger homes, outdoor pieces and treasured belongings."
  },
  {
    slug: "office-relocation",
    title: "Office relocation",
    description: "A practical move plan that helps your people and workplace get back to business."
  },
  {
    slug: "furniture-moving",
    title: "Furniture moving",
    description: "Protection, dismantling and careful transport for the pieces you want to keep."
  },
  {
    slug: "local-moving",
    title: "Local moving",
    description: "Neighbourhood moves around Dubai, with access and timing considered up front."
  },
  {
    slug: "international-moving",
    title: "International moving",
    description: "Guidance for a move beyond the UAE, with each step clearly mapped out."
  },
  {
    slug: "packing-unpacking",
    title: "Packing & unpacking",
    description: "Thoughtful packing for fragile items and a more settled first day at home."
  },
  {
    slug: "storage",
    title: "Storage services",
    description: "Flexible storage for the in-between days while your next chapter takes shape."
  },
  {
    slug: "warehouse-moving",
    title: "Warehouse moving",
    description: "Planned relocation for stock, equipment and operational spaces."
  },
  {
    slug: "truck-rental",
    title: "Truck rental",
    description: "A suitable vehicle and transport plan for your next move."
  },
  {
    slug: "handyman-services",
    title: "Handyman services",
    description: "Useful finishing touches to help your new space feel ready."
  },
  {
    slug: "piano-moving",
    title: "Piano moving",
    description: "Special handling and a considered route for delicate, weighty instruments."
  },
  {
    slug: "commercial-relocation",
    title: "Commercial relocation",
    description: "Coordinated support for teams, workspaces and business transitions."
  }
];

export const areas: readonly string[] = [
  "Dubai Marina",
  "Downtown Dubai",
  "Business Bay",
  "Jumeirah Village Circle",
  "Jumeirah Lake Towers",
  "Al Barsha",
  "Arabian Ranches",
  "Dubai Hills",
  "Palm Jumeirah",
  "Deira",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah"
];

export const faqs: readonly Faq[] = [
  {
    question: "How much does a move in Dubai cost?",
    answer:
      "The cost depends on the size of your home, the distance, access, timing and services you need. Share a few details through the quote form and the team can prepare a considered estimate."
  },
  {
    question: "How do I book a moving date?",
    answer:
      "Send a quote request with your preferred date and move details. The team will follow up to discuss availability and the next steps."
  },
  {
    question: "Do you provide packing materials?",
    answer:
      "Packing and unpacking can be included in your request. Mention the items you would like help with so the right materials can be planned."
  },
  {
    question: "Is moving insurance available?",
    answer:
      "Cover options depend on the move and the terms available. Ask the team about applicable cover before confirming your booking."
  },
  {
    question: "Can I store my belongings between moves?",
    answer:
      "Storage can be discussed when your move dates do not line up. Share your approximate timing and storage needs in the quote form."
  },
  {
    question: "Can you help with an international relocation?",
    answer:
      "International moves need destination-specific planning. Send your origin, destination and preferred timing so the team can discuss the requirements."
  },
  {
    question: "How far ahead should I book?",
    answer:
      "Earlier is helpful, especially for busy dates and buildings that require move permits or lift reservations. Send your preferred date and the team will advise on availability."
  },
  {
    question: "Which areas do you cover?",
    answer:
      "The website is set up for Dubai and UAE enquiries. Use the areas list or share your locations in a quote request to confirm coverage."
  }
];

export const posts: readonly Post[] = [
  {
    slug: "a-calm-moving-day",
    title: "A calmer moving day starts with a simple plan",
    excerpt: "A practical guide to the small decisions that make the week of a move feel more manageable.",
    category: "Planning"
  },
  {
    slug: "packing-fragile-items",
    title: "How to prepare fragile items for a move",
    excerpt: "A room-by-room approach to protecting the objects you would rather not replace.",
    category: "Packing"
  },
  {
    slug: "dubai-building-move-checklist",
    title: "Your Dubai building move checklist",
    excerpt: "Lift bookings, access notes and timing: what to ask before moving day arrives.",
    category: "Dubai living"
  }
];
