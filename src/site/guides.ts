import { business as biz } from "../config";
import { escapeHtml, svgArrow } from "./html";

// Practical guides that answer comparison and cost questions people search for
// before booking a mover. They are intentionally not in the main navigation:
// they live in the sitemap and cross-link to each other. No competitor is named
// and no price is quoted, so nothing here is a comparative claim.

export interface GuideSection {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface GuideTable {
  head: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface Guide {
  slug: string;
  title: string;
  /** Kept short so `${seoTitle} | KI Movers` stays under 62 characters. */
  seoTitle: string;
  description: string;
  intro: string;
  lede: string;
  sections: readonly GuideSection[];
  table?: GuideTable;
  faqs: readonly GuideFaq[];
  related: readonly string[];
}

export const guides: readonly Guide[] = [
  {
    slug: "apartment-moving-cost-dubai",
    seoTitle: "Apartment moving costs in Dubai",
    title: "Apartment moving costs in Dubai: what changes the price",
    description:
      "Understand what drives the cost of an apartment move in Dubai, from access and parking to packing, and how to compare two quotes fairly.",
    intro:
      "Two apartments of the same size can be quoted very differently. What usually explains the gap is not the size alone, but access, timing, packing and how the crew is scheduled.",
    lede:
      "This page explains the cost drivers behind an apartment move in Dubai so you can read a quote with confidence, ask better questions, and compare two offers on equal terms.",
    sections: [
      {
        heading: "The five factors that move the number",
        paragraphs: [
          "Most apartment quotes in Dubai are built from the same ingredients. When one quote looks much lower than another, one of these ingredients has usually been estimated differently rather than removed."
        ],
        bullets: [
          "Crew size and hours: a studio can be a two-person job, while a family apartment with furniture dismantling often needs three or four.",
          "Building access: lift booking, service-lift dimensions, loading-bay slots and how far the truck parks from the door all add time.",
          "Packing scope: materials and labour for kitchenware, wardrobes and fragile items are usually the largest optional line.",
          "Volume and fragile pieces: a piano, a large mirror or a marble table needs protection, extra hands and sometimes a specialist.",
          "Timing: month-end, weekends and evening slots are busier, so availability and pricing can differ from a mid-week morning."
        ]
      },
      {
        heading: "Why a low quote sometimes grows on the day",
        paragraphs: [
          "A quote that assumes one trip, no dismantling and a truck parked at the door can look attractive until the building requires a service-lift booking and a loading-bay window. Those extras are legitimate costs, but they should appear before the move, not after.",
          "Ask for the scope in writing: how many crew, how many hours, what is included in packing, and what happens if the move runs longer."
        ]
      },
      {
        heading: "How to compare two apartment quotes",
        paragraphs: [
          "Put both offers next to each other and check that they describe the same job. Quote A may include packing materials while Quote B expects you to supply boxes; Quote B may include dismantling and reassembly while Quote A charges per item."
        ],
        bullets: [
          "Same move date, same address details, same list of large items.",
          "Materials listed by type and quantity, not just 'packing included'.",
          "Clear statement of what happens on overtime or a second trip.",
          "A named contact and a written arrival window."
        ]
      }
    ],
    table: {
      head: ["What you are comparing", "Question to ask"],
      rows: [
        ["Crew size", "How many movers will arrive, and is the supervisor included?"],
        ["Hours", "Is the estimate hours-based? What is the hourly rate after that?"],
        ["Packing", "Are materials, labour and unpacking included, or materials only?"],
        ["Access", "Who books the lift and loading bay, and is that included?"],
        ["Payment", "When is payment due, and is there a written cancellation policy?"]
      ]
    },
    faqs: [
      {
        question: "Is the cheapest apartment quote usually the best value?",
        answer:
          "Not necessarily. A lower price often reflects a narrower scope, such as no packing materials, fewer crew or an assumption of easy access. Compare the written scope, not only the total."
      },
      {
        question: "Should I pay a deposit to book an apartment move?",
        answer:
          "Many movers ask for a booking deposit to hold a date. Ask for the cancellation and rescheduling terms in writing before paying, and keep the confirmation with your quote."
      }
    ],
    related: ["how-to-compare-moving-quotes-dubai", "cheap-movers-vs-professional-movers", "movers-vs-diy-move-dubai"]
  },
  {
    slug: "villa-moving-cost-dubai",
    seoTitle: "Villa moving costs in Dubai",
    title: "Villa moving costs in Dubai: a practical cost guide",
    description:
      "What shapes the cost of moving a villa in Dubai, including outdoor furniture, multiple floors, packing volume and how to plan the day.",
    intro:
      "Villa moves are less about distance and more about volume, access and the number of things that need special care — from garden furniture to built-in wardrobes.",
    lede:
      "A villa move is a full-day (sometimes multi-day) project. Here is how the work is usually broken down, so you can plan a realistic budget and schedule.",
    sections: [
      {
        heading: "Where the cost comes from",
        paragraphs: [
          "Villa quotes are usually driven by volume and labour hours. Two villas of the same size can differ a lot if one has a furnished garden, a gym, a study and a storage room."
        ],
        bullets: [
          "Volume: number of bedrooms plus living, dining, kitchen, outdoor and storage areas.",
          "Dismantling: beds, wardrobes, shelving, TV mounts and gym equipment.",
          "Fragile and heavy items: marble tops, glass tables, artwork, safes and pianos.",
          "Access: gate width, driveway length, stairs between floors and whether a larger truck can reach the door.",
          "Packing: full packing takes significantly more labour than packing selected rooms."
        ]
      },
      {
        heading: "Planning the day around the villa",
        paragraphs: [
          "A useful pattern is to pack the rooms you do not use daily first, load the largest furniture early, and keep one bathroom and the kitchen essentials until last. If the new villa needs cleaning or handover checks, build that gap into the schedule rather than hoping the crew finishes early.",
          "For larger homes, ask whether the crew splits between two properties. A split crew can save a day, but only if both address access windows are confirmed."
        ]
      },
      {
        heading: "What to confirm before booking",
        paragraphs: [
          "Because villa jobs are long, the details that matter most are staffing and contingency: how many people, how many hours are included, and how a second day would be priced."
        ],
        bullets: [
          "Number of crew and whether a supervisor stays on site.",
          "Whether a second truck is needed and how that is charged.",
          "Packing materials for artwork and outdoor items.",
          "A written plan for the loading and unloading order.",
          "Confirmation of any community or building permits needed."
        ]
      }
    ],
    faqs: [
      {
        question: "How long does a villa move usually take?",
        answer:
          "Most furnished villas take one to two days including packing and unloading. The exact time depends on volume, dismantling, access and whether packing happens on the same day."
      },
      {
        question: "Can we move a villa in stages?",
        answer:
          "Yes. Staged moves are common for renovations or phased handovers. Ask for a plan that prices each stage separately so the scope stays clear."
      }
    ],
    related: ["apartment-moving-cost-dubai", "furniture-only-vs-full-home-move", "movers-with-storage-dubai"]
  },
  {
    slug: "office-relocation-cost-dubai",
    seoTitle: "Office relocation costs in Dubai",
    title: "Office relocation costs in Dubai: what to budget for",
    description:
      "The main cost drivers in a Dubai office move: IT equipment, workstations, downtime, building permissions and after-hours access.",
    intro:
      "An office move is measured in downtime as much as in boxes. The cheapest-looking quote can cost more if the team cannot work the next morning.",
    lede:
      "This guide breaks an office relocation into the parts that carry real cost, so you can brief internal stakeholders and compare provider quotes like-for-like.",
    sections: [
      {
        heading: "The four budget lines",
        paragraphs: [
          "Office relocations usually split into planning, physical move, IT and reinstatement. Providers quote different combinations, which is why two totals can look unrelated."
        ],
        bullets: [
          "Planning: surveys, floor plans, labelling systems and a move schedule.",
          "Physical move: crates, packing, furniture dismantling, transport and reassembly.",
          "IT and equipment: server racks, cabling, monitors and secure transport of devices.",
          "Reinstatement and downtime: out-of-hours work, temporary desks or storage."
        ]
      },
      {
        heading: "Why after-hours work is usually worth it",
        paragraphs: [
          "Moving on a weekend or overnight avoids losing a working day, but it carries premium labour rates. Compare that premium with the cost of a day of lost productivity for your team before deciding.",
          "If the building requires a lift booking or a loading-bay slot, confirm the window early. A missed slot can push the whole move into the next evening."
        ]
      },
      {
        heading: "What a good office quote includes",
        paragraphs: [
          "Ask for a scope that names quantities: how many workstations, how many crates, how many monitors, and what happens to confidential documents."
        ],
        bullets: [
          "Crate rental and collection, with a clear return date.",
          "Labelling by desk, department and destination floor.",
          "Secure handling for laptops and confidential files.",
          "Reassembly and a walk-through sign-off at the new office.",
          "A single point of contact for building management."
        ]
      }
    ],
    faqs: [
      {
        question: "Can an office move happen without closing for a day?",
        answer:
          "Often yes, by moving non-essential items first and completing the switch overnight or over a weekend. It depends on how much IT equipment must move at once."
      },
      {
        question: "Do we need to move our own IT equipment?",
        answer:
          "Some companies move devices themselves for security reasons; others ask the mover to transport them in sealed crates. Agree the approach in writing either way."
      }
    ],
    related: ["how-to-compare-moving-quotes-dubai", "full-service-vs-partial-packing", "weekend-and-evening-moves-dubai"]
  },
  {
    slug: "movers-vs-diy-move-dubai",
    seoTitle: "Movers vs DIY moving in Dubai",
    title: "Hiring movers vs moving yourself in Dubai",
    description:
      "An honest comparison of DIY moving and hiring a professional crew in Dubai: time, risk, building rules and what each option really involves.",
    intro:
      "DIY can work for a studio and a short move. Past that, the variables multiply: lift bookings, loading bays, furniture dismantling and the risk of damage.",
    lede:
      "There is no universal right answer, but there is a right answer for your move. This comparison sets out what you take on with each option.",
    sections: [
      {
        heading: "What DIY actually requires",
        paragraphs: [
          "Doing it yourself means sourcing a suitable vehicle, protective materials, straps and tools, plus enough people to carry the heaviest item safely. In Dubai, many buildings also require a service-lift booking, a move-in permit or a named moving company at reception."
        ],
        bullets: [
          "Vehicle size and height clearance for the building's loading area.",
          "Protection for door frames, lifts and floors.",
          "Dismantling and reassembling beds and wardrobes.",
          "Time off work and a realistic number of trips.",
          "Liability for damage — your own, and to the building's common areas."
        ]
      },
      {
        heading: "Where a professional crew earns its cost",
        paragraphs: [
          "A good mover brings the labour, materials, access knowledge and insurance conversation in one package. That matters most when the building is strict, the furniture is heavy, or the schedule is tight."
        ],
        bullets: [
          "Experience with specific buildings and their access rules.",
          "Correct materials for fragile, glass and marble items.",
          "Enough crew to move the heavy pieces without risk of injury.",
          "A documented scope, so expectations are clear before the day."
        ]
      },
      {
        heading: "A middle path",
        paragraphs: [
          "Many people pack themselves and hire a crew only for loading, transport and unloading. It lowers the cost while keeping the physically risky part professional. Ask whether the quote supports that split, and confirm what happens if your packing is not ready on time."
        ]
      }
    ],
    table: {
      head: ["Consideration", "DIY", "Professional crew"],
      rows: [
        ["Time", "Several days including packing and trips", "One planned day for most homes"],
        ["Access rules", "You handle permits and lift bookings", "Usually coordinated by the mover"],
        ["Heavy furniture", "Depends on your own equipment and people", "Crew, straps and lifting gear provided"],
        ["Damage risk", "Borne by you", "Discussed in the quote and terms"],
        ["Cost", "Lower cash cost, higher time cost", "Higher cash cost, lower time and risk"]
      ]
    },
    faqs: [
      {
        question: "Can I rent a van and move a one-bedroom flat myself?",
        answer:
          "It is possible for a small flat with easy access, but check the building's move-in requirements first. Many towers require a booked service lift and a registered moving company."
      },
      {
        question: "Will movers move boxes I packed myself?",
        answer:
          "Most will, though responsibility for contents packed by the customer is usually limited. Ask how your own boxes are treated in the terms."
      }
    ],
    related: ["cheap-movers-vs-professional-movers", "apartment-moving-cost-dubai", "moving-company-checklist-dubai"]
  },
  {
    slug: "full-service-vs-partial-packing",
    seoTitle: "Full-service vs partial packing",
    title: "Full-service vs partial packing: which suits your move",
    description:
      "Compare full packing, partial packing and unpacking services for a Dubai move, including what each covers and how to choose.",
    intro:
      "Packing is usually the largest optional cost in a move, and the one most likely to be underestimated. The right level depends on your time, your belongings and your tolerance for boxes.",
    lede:
      "Full service, partial packing and packing it yourself all end with boxes in a truck. The difference is who spends the hours, and who carries the risk.",
    sections: [
      {
        heading: "The three common arrangements",
        paragraphs: [
          "Most movers offer a menu rather than a single product. Understanding the menu makes quotes comparable."
        ],
        bullets: [
          "Full packing: the crew packs everything, labels rooms and usually reassembles furniture at the destination.",
          "Partial packing: the crew handles fragile items, kitchenware and wardrobes while you pack clothes, books and personal items.",
          "Load and transport only: you pack, the crew loads, drives and unloads."
        ]
      },
      {
        heading: "Where full packing pays off",
        paragraphs: [
          "Full packing is worth considering when you are short on time, have a lot of glassware or artwork, or are moving with children or a busy job. It also reduces the chance that a box is packed too heavy or a fragile item is unwrapped.",
          "Ask whether unpacking is included. Many quotes cover packing only, leaving you with a wall of boxes at the new place."
        ]
      },
      {
        heading: "Where partial packing makes sense",
        paragraphs: [
          "If you are organised and want to control your personal items, partial packing is a reasonable middle ground. The crew takes the risky categories and you keep control of clothes, documents and everyday essentials."
        ],
        bullets: [
          "Keep a labelled 'first night' box with chargers, bedding and toiletries.",
          "Mark anything you do not want the crew to touch.",
          "Confirm whether your own boxes must be a minimum standard."
        ]
      }
    ],
    faqs: [
      {
        question: "Does full packing include materials?",
        answer:
          "Usually yes, but check the types and quantities: boxes, tape, bubble wrap, wardrobe cartons and mattress covers are often listed separately."
      },
      {
        question: "Can we unpack ourselves after a full pack?",
        answer:
          "Yes. Ask the mover to label by room so unpacking is straightforward, and keep the packing list with the quote."
      }
    ],
    related: ["apartment-moving-cost-dubai", "questions-to-ask-a-moving-company", "movers-vs-diy-move-dubai"]
  },
  {
    slug: "how-to-compare-moving-quotes-dubai",
    seoTitle: "How to compare moving quotes",
    title: "How to compare moving quotes in Dubai without being misled",
    description:
      "A step-by-step way to compare moving quotes in Dubai: scope, crew, materials, access fees and the small print that changes the total.",
    intro:
      "Quotes are easy to collect and hard to compare. The total price hides scope, and scope is where the real difference sits.",
    lede:
      "Use this checklist to put quotes side by side and spot the gaps before you commit, not on moving day.",
    sections: [
      {
        heading: "1. Make the brief identical",
        paragraphs: [
          "Every provider should see the same information: full address with floor and lift details, inventory of large items, packing expectations, preferred dates and any building requirements. If one provider had a video survey and another had a phone call, the quotes are not comparable."
        ]
      },
      {
        heading: "2. Compare scope line by line",
        paragraphs: [
          "Look for the items that are usually the difference between a pleasant move and a stressful one."
        ],
        bullets: [
          "Crew size and hours, plus the overtime rate.",
          "Packing materials: boxes, tape, wrap, wardrobe cartons, mattress covers.",
          "Dismantling and reassembly, including beds and wardrobes.",
          "Access charges: lift booking, parking permits, long carry.",
          "Insurance or liability cover, and what it actually covers.",
          "Payment terms and cancellation policy."
        ]
      },
      {
        heading: "3. Ask what would change the price",
        paragraphs: [
          "A provider who can explain the assumptions in their quote is usually a safer bet than one who simply says the price is fixed. Ask directly: what would make this cost more on the day?"
        ]
      },
      {
        heading: "4. Check the paperwork",
        paragraphs: [
          "The quote should be in writing, dated, and list what is included and excluded. Verbal promises are difficult to rely on later. Confirm who to contact if access changes, and how changes are approved."
        ]
      }
    ],
    table: {
      head: ["Red flag", "Why it matters"],
      rows: [
        ["Only a total price, no scope", "You cannot tell what is missing until moving day"],
        ["No written terms", "Disputes become word against word"],
        ["Unusually low hourly rate", "Often recovered through access or materials charges"],
        ["No named contact", "Changes and delays have nowhere to go"],
        ["Pressure to pay in full upfront", "Leaves you with little recourse if plans change"]
      ]
    },
    faqs: [
      {
        question: "How many quotes should I get?",
        answer:
          "Two or three comparable quotes is usually enough to understand the market for your move without delaying your booking."
      },
      {
        question: "Should I choose the quote with the most detail?",
        answer:
          "Detail is a good sign, but read it: the most detailed quote is only useful if its assumptions match your actual move."
      }
    ],
    related: ["questions-to-ask-a-moving-company", "cheap-movers-vs-professional-movers", "moving-company-checklist-dubai"]
  },
  {
    slug: "questions-to-ask-a-moving-company",
    seoTitle: "Questions to ask a moving company",
    title: "Questions to ask before booking a moving company",
    description:
      "The questions that separate an organised mover from a risky one: access, crew, materials, liability and what happens when plans change.",
    intro:
      "Most moving problems are predictable. The right questions surface them while you can still choose a different provider.",
    lede:
      "Ask these before you pay a deposit. Clear answers now are worth more than a low price that changes later.",
    sections: [
      {
        heading: "About the job",
        paragraphs: [
          "Start with the practical shape of the day, because that is where estimates usually go wrong."
        ],
        bullets: [
          "How many crew will arrive, and who supervises?",
          "How many hours are included, and what is the rate after that?",
          "What is the planned arrival window, and what happens if it slips?",
          "How many trips do you expect, and how is a second trip charged?"
        ]
      },
      {
        heading: "About the building",
        paragraphs: [
          "Access rules in Dubai towers and communities can change the whole schedule. A provider who has worked in your building will ask about lift dimensions and booking windows without prompting."
        ],
        bullets: [
          "Do you book the service lift and loading bay, or do I?",
          "What is the maximum truck height the building allows?",
          "Are there move-in permits or community fees?",
          "How far can the truck park from the entrance?"
        ]
      },
      {
        heading: "About protection and liability",
        paragraphs: [
          "Ask how fragile, glass and marble items are handled, and what happens if something is damaged. Get the answer in writing, including any exclusions for items you packed yourself."
        ]
      },
      {
        heading: "About changes",
        paragraphs: [
          "Plans move. Ask how rescheduling works, what notice is needed, and whether the deposit is transferable. A provider with a clear policy is easier to work with than one who improvises."
        ]
      }
    ],
    faqs: [
      {
        question: "What should be in a moving confirmation?",
        answer:
          "Date, arrival window, crew size, scope, packing materials, price and payment terms, plus a contact number for the day."
      },
      {
        question: "Is a verbal quote enough?",
        answer:
          "No. Ask for the scope and price in writing so both sides are clear about what is included."
      }
    ],
    related: ["how-to-compare-moving-quotes-dubai", "moving-company-checklist-dubai", "apartment-moving-cost-dubai"]
  },
  {
    slug: "cheap-movers-vs-professional-movers",
    seoTitle: "Cheap vs professional movers",
    title: "Cheap movers vs professional movers: what the price hides",
    description:
      "Why low-cost moving quotes can end up costing more, and the signs that separate a lean professional service from a risky one.",
    intro:
      "A low price is not automatically a bad sign, and a high price is not automatically safe. What matters is whether the scope, crew and terms match the number.",
    lede:
      "This is a practical look at what gets cut when a quote is unusually low, and how to tell the difference between lean and risky.",
    sections: [
      {
        heading: "What usually gets cut",
        paragraphs: [
          "When a quote is far below others for the same brief, something has been reduced. Often it is labour: fewer crew, less time, or an assumption that packing is not included."
        ],
        bullets: [
          "Crew size, which slows the job and risks injury on heavy items.",
          "Materials, leaving furniture wrapped in whatever is available.",
          "Time buffers, which turn a morning move into an evening one.",
          "Coordination, so lift bookings and permits become your problem.",
          "Paperwork, leaving you with nothing in writing."
        ]
      },
      {
        heading: "Signs of a lean but professional service",
        paragraphs: [
          "Some providers keep prices lower by focusing on a narrow scope, such as transport only, or by working in specific buildings. That can be excellent value if it matches what you need."
        ],
        bullets: [
          "Clear, written scope that names what is excluded.",
          "A named contact and a realistic arrival window.",
          "Straight answers about access, materials and overtime.",
          "Willingness to explain how the price was built."
        ]
      },
      {
        heading: "The real comparison",
        paragraphs: [
          "Compare total cost of ownership of the move: the quote, plus your time, plus the risk of damage or delay. A slightly higher quote that includes packing materials and access coordination is often cheaper overall."
        ]
      }
    ],
    faqs: [
      {
        question: "How can I tell if a mover is insured?",
        answer:
          "Ask for the liability terms in writing and what they cover. Insurance is often arranged per move, so verify the specifics rather than relying on a general claim."
      },
      {
        question: "Should I pay cash on the day?",
        answer:
          "Prefer a documented payment method with a receipt. Cash without paperwork makes it hard to resolve problems afterwards."
      }
    ],
    related: ["how-to-compare-moving-quotes-dubai", "movers-vs-diy-move-dubai", "questions-to-ask-a-moving-company"]
  },
  {
    slug: "same-day-movers-dubai",
    seoTitle: "Same-day movers in Dubai",
    title: "Same-day movers in Dubai: when it works and how to arrange it",
    description:
      "How same-day and short-notice moves work in Dubai, what to have ready, and when it is better to wait a day.",
    intro:
      "Same-day moves are possible, but they depend on crew availability, building access windows and how much needs packing.",
    lede:
      "If you need to move today, this is the practical sequence that gives you the best chance of a calm result.",
    sections: [
      {
        heading: "What can realistically happen today",
        paragraphs: [
          "A small, already-packed flat with easy access can often be moved the same day if a crew is free. A full villa or an office with IT equipment rarely can, because packing and access bookings take time."
        ],
        bullets: [
          "Already packed, studio or one-bedroom: realistic.",
          "Partly packed with large furniture: possible if the crew can pack on arrival.",
          "Full home or villa: usually next-day at the earliest.",
          "Office with servers or many devices: plan at least a day."
        ]
      },
      {
        heading: "What to prepare before calling",
        paragraphs: [
          "The faster you can give accurate information, the faster a provider can commit."
        ],
        bullets: [
          "Both addresses with floor, lift and parking details.",
          "Photos or a list of large and fragile items.",
          "Confirmation that the destination building allows moves today.",
          "Payment method and an ID for building security."
        ]
      },
      {
        heading: "When waiting a day is better",
        paragraphs: [
          "If the lift is booked, the packing is not finished, or the crew would arrive without the right materials, a next-day move is usually cheaper and safer than forcing it. Ask what the provider would recommend rather than what they can squeeze in."
        ]
      }
    ],
    faqs: [
      {
        question: "Do same-day moves cost more?",
        answer:
          "They can, because scheduling is tighter and crews may need to be rearranged. Ask for the price before confirming."
      },
      {
        question: "Can I move at night?",
        answer:
          "Some buildings restrict move hours. Check the building's rules first, then ask the mover about evening availability."
      }
    ],
    related: ["weekend-and-evening-moves-dubai", "apartment-moving-cost-dubai", "moving-company-checklist-dubai"]
  },
  {
    slug: "weekend-and-evening-moves-dubai",
    seoTitle: "Weekend and evening moves",
    title: "Weekend and evening moves in Dubai: planning around your week",
    description:
      "How weekend, evening and out-of-hours moves work in Dubai, including building restrictions, crew availability and cost considerations.",
    intro:
      "Moving outside working hours protects your week, but buildings and crews have their own schedules. A little planning keeps the two aligned.",
    lede:
      "A guide to scheduling a move around work, school runs and building rules without paying for avoidable delays.",
    sections: [
      {
        heading: "Check the building before the calendar",
        paragraphs: [
          "Many towers and communities restrict move-in and move-out hours, often to weekdays or specific slots. Confirm both buildings' rules before you book a Saturday or a 9pm start; the crew cannot override a building's schedule."
        ]
      },
      {
        heading: "How out-of-hours pricing usually works",
        paragraphs: [
          "Evening and weekend work often carries a premium because crews are scheduled outside normal shifts. Ask whether the premium is a flat rate or an hourly multiplier, and whether it applies to packing as well as transport."
        ]
      },
      {
        heading: "Making a short window work",
        paragraphs: [
          "If your slot is only three or four hours, pack everything in advance and keep the crew focused on furniture and fragile items. A written running order helps: what goes first, what stays until last, and where each item lands in the new place."
        ],
        bullets: [
          "Book the lift and loading bay for the exact window.",
          "Have keys, access cards and ID ready for security.",
          "Label rooms at the destination before the truck arrives.",
          "Keep essentials separate so you are not opening boxes at midnight."
        ]
      }
    ],
    faqs: [
      {
        question: "Are Friday moves allowed in Dubai?",
        answer:
          "It depends on the building and community. Some allow weekend moves with a booking; others restrict them. Confirm with both buildings first."
      },
      {
        question: "Is an evening move more expensive?",
        answer:
          "Often there is a premium for out-of-hours work. Ask for it to be stated in the quote rather than added later."
      }
    ],
    related: ["same-day-movers-dubai", "office-relocation-cost-dubai", "questions-to-ask-a-moving-company"]
  },
  {
    slug: "moving-company-checklist-dubai",
    seoTitle: "Moving company checklist",
    title: "Moving company checklist for Dubai: from shortlist to moving day",
    description:
      "A practical checklist for hiring movers in Dubai, covering what to verify before booking and what to prepare in the final week.",
    intro:
      "A good move is mostly preparation. This checklist keeps the decisions in order so nothing important is left to the morning of the move.",
    lede:
      "Work through it from the top: shortlist, verify, confirm, prepare. Each stage has a small number of things that actually matter.",
    sections: [
      {
        heading: "Before you shortlist",
        paragraphs: [
          "Write down the brief once and reuse it. A clear brief produces comparable quotes and fewer surprises."
        ],
        bullets: [
          "Addresses, floors, lift and parking details for both properties.",
          "Inventory of large, fragile and high-value items.",
          "What you want packed, and what you will pack yourself.",
          "Preferred dates and any building restrictions."
        ]
      },
      {
        heading: "When you compare providers",
        paragraphs: [
          "Check the things that are hard to fix later: written scope, crew size, access coordination and what happens if the day runs long."
        ],
        bullets: [
          "Written quote with inclusions and exclusions.",
          "Named contact and a clear arrival window.",
          "Materials list, not just 'packing included'.",
          "Liability terms and payment schedule.",
          "Cancellation and rescheduling policy."
        ]
      },
      {
        heading: "The week before",
        paragraphs: [
          "Confirm the booking, the lift slot and the crew arrival time. Start packing the rooms you use least, and set aside documents, valuables and medication to travel with you."
        ],
        bullets: [
          "Book the service lift and loading bay.",
          "Confirm parking or permits for the truck.",
          "Defrost the fridge and disconnect appliances if needed.",
          "Pack a first-night box per person.",
          "Share the plan with everyone in the household."
        ]
      },
      {
        heading: "On the day",
        paragraphs: [
          "Walk the crew through the property, point out fragile items, and keep one person available for questions. Do a final walk-through before the truck leaves, and check the destination rooms as they fill."
        ]
      }
    ],
    faqs: [
      {
        question: "How far in advance should I book movers in Dubai?",
        answer:
          "One to two weeks is comfortable for most homes; longer around month-end and peak weekends. Same-week bookings are possible but availability is tighter."
      },
      {
        question: "What should I keep with me on moving day?",
        answer:
          "Documents, valuables, medication, chargers and a change of clothes. Treat these as personal luggage rather than shipment."
      }
    ],
    related: ["questions-to-ask-a-moving-company", "how-to-compare-moving-quotes-dubai", "same-day-movers-dubai"]
  },
  {
    slug: "furniture-only-vs-full-home-move",
    seoTitle: "Furniture-only vs full move",
    title: "Furniture-only move vs full home move: choosing the right scope",
    description:
      "Compare a furniture-only move with a full home move in Dubai: cost, packing, timing and when each option makes sense.",
    intro:
      "Not every move needs everything packed. Sometimes one sofa, a bed and a dining table are the whole job.",
    lede:
      "The scope you choose changes the price, the crew and the day. Here is how to decide between a furniture-only move and a full move.",
    sections: [
      {
        heading: "What a furniture-only move covers",
        paragraphs: [
          "A furniture-only move usually covers dismantling, protecting, loading, transporting and reassembling the listed pieces. Boxes and personal effects are either excluded or charged separately."
        ],
        bullets: [
          "Item list with dimensions, especially for lifts and doorways.",
          "Protection for wood, glass and upholstery.",
          "Dismantling and reassembly where needed.",
          "Placement in the destination rooms."
        ]
      },
      {
        heading: "When a full home move is better",
        paragraphs: [
          "If you have more than a handful of boxes, kitchenware, wardrobes of clothes and fragile decor, a full move is usually more efficient than several small jobs. It also keeps one crew responsible for the whole house."
        ]
      },
      {
        heading: "The awkward middle",
        paragraphs: [
          "Many moves are a mix: the crew moves furniture while you move clothes and personal items in your own car over a few days. Ask how the quote treats that split, and confirm the timing so the crew is not waiting on an empty room."
        ]
      }
    ],
    table: {
      head: ["Scope", "Best for", "Watch out for"],
      rows: [
        ["Furniture only", "Single items, staging, top-ups", "Boxes and packing excluded"],
        ["Full home", "Whole households, families", "Higher cost, needs a full day"],
        ["Hybrid", "Cost-conscious moves", "Coordination between you and the crew"]
      ]
    },
    faqs: [
      {
        question: "Can a mover take just one item?",
        answer:
          "Yes, many do single-item or small-load moves. Ask about minimum charges, since a small job still needs a crew and a vehicle."
      },
      {
        question: "Should furniture be dismantled for a move?",
        answer:
          "Large beds and wardrobes usually travel better dismantled. Confirm whether the mover includes dismantling and reassembly in the quote."
      }
    ],
    related: ["villa-moving-cost-dubai", "movers-with-storage-dubai", "apartment-moving-cost-dubai"]
  },
  {
    slug: "local-vs-international-movers-dubai",
    seoTitle: "Local vs international movers",
    title: "Local vs international movers in Dubai: what changes",
    description:
      "How local moves and international relocations differ in planning, documentation, transit time and what to confirm before booking.",
    intro:
      "A move across Dubai and a move to another country share a name, but almost nothing else in the way they are planned.",
    lede:
      "If you are comparing providers for a move out of the UAE, these are the differences that should shape your questions.",
    sections: [
      {
        heading: "Local moves: time and access",
        paragraphs: [
          "Local moves are decided by crew hours and building access. The paperwork is minimal, the goods stay in the country, and the main risks are damage and delay on the day."
        ]
      },
      {
        heading: "International moves: documents and transit",
        paragraphs: [
          "Cross-border moves add customs documentation, packing standards for sea or air freight, transit time and destination-side handling. The quote often covers origin services only, with destination charges billed separately."
        ],
        bullets: [
          "Packing standard: sea freight needs sturdier packing than a local move.",
          "Documentation: inventory lists, passports and customs forms.",
          "Transit time: weeks by sea, days by air.",
          "Destination charges: unloading, customs clearance and delivery.",
          "Insurance: marine cover is usually separate from local liability."
        ]
      },
      {
        heading: "What to ask either way",
        paragraphs: [
          "Ask who is responsible at each stage, what is excluded, and how a delay is handled. For international moves, also ask for the destination agent's details and a written breakdown of charges at both ends."
        ]
      }
    ],
    faqs: [
      {
        question: "Does a local mover handle international moves?",
        answer:
          "Some do, often through partner agents. If they do, ask which company handles the destination side and who your contact will be."
      },
      {
        question: "Is sea or air freight better?",
        answer:
          "Sea is usually cheaper for larger volumes but slower; air suits urgent or small shipments. The right choice depends on timing and volume."
      }
    ],
    related: ["movers-with-storage-dubai", "moving-company-checklist-dubai", "how-to-compare-moving-quotes-dubai"]
  },
  {
    slug: "movers-with-storage-dubai",
    seoTitle: "Movers with storage in Dubai",
    title: "Movers with storage in Dubai: when you need it and how to compare",
    description:
      "How storage works alongside a move in Dubai: short-term holds, access, insurance and the questions that keep your belongings safe.",
    intro:
      "A gap between leaving one home and moving into the next is common. Storage bridges it, but the details matter more than the price per square metre.",
    lede:
      "What to check when a move includes storage, from access and climate control to insurance and inventory.",
    sections: [
      {
        heading: "Short-term vs long-term storage",
        paragraphs: [
          "Short-term storage usually means days or weeks while a handover completes. Long-term storage is a different product, often priced per volume or per unit, with access rules that affect how useful it really is."
        ],
        bullets: [
          "Short-term: often combined with the move, priced by volume and duration.",
          "Long-term: unit or container based, with scheduled access.",
          "Climate control: important for wood, artwork, electronics and leather.",
          "Access: can you retrieve items mid-storage, and at what notice?"
        ]
      },
      {
        heading: "What to confirm before storing",
        paragraphs: [
          "Ask for a written inventory, the storage location, and what insurance applies while goods are in store. Confirm how items are packed for storage, since stacking and humidity cause more damage than transport."
        ]
      },
      {
        heading: "Storage as part of a staged move",
        paragraphs: [
          "If your new home is not ready, storing part of the shipment lets the rest of the move finish on schedule. Ask the mover to label stored items by room so the second delivery is quick."
        ]
      }
    ],
    faqs: [
      {
        question: "Can I access my items while they are in storage?",
        answer:
          "Often yes with notice, but rules vary. Confirm access frequency, notice period and any handling fees before booking."
      },
      {
        question: "Is storage insured?",
        answer:
          "Ask specifically what cover applies in storage, as it can differ from transit cover. Get the answer in writing."
      }
    ],
    related: ["villa-moving-cost-dubai", "local-vs-international-movers-dubai", "furniture-only-vs-full-home-move"]
  }
];

export function guidePath(guide: Guide): string {
  return `/guides/${guide.slug}`;
}

export function findGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

function relatedLinks(guide: Guide): string {
  const links = guide.related
    .map((slug) => guides.find((candidate) => candidate.slug === slug))
    .filter((item): item is Guide => Boolean(item))
    .map(
      (item) =>
        `<a href="${guidePath(item)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(
          item.description
        )}</span></a>`
    )
    .join("");
  return `<div class="guide-related">${links}</div>`;
}

export function guidePage(slug: string): string | null {
  const guide = findGuide(slug);
  if (!guide) return null;

  const sections = guide.sections
    .map(
      (section) => `<h2>${escapeHtml(section.heading)}</h2>${section.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("")}${
        section.bullets
          ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
          : ""
      }`
    )
    .join("");

  const table = guide.table
    ? `<div class="guide-table-wrap"><table class="guide-table"><thead><tr>${guide.table.head
        .map((cell) => `<th>${escapeHtml(cell)}</th>`)
        .join("")}</tr></thead><tbody>${guide.table.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`
    : "";

  const faqs = guide.faqs
    .map(
      (faq) =>
        `<div class="guide-faq"><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></div>`
    )
    .join("");

  return `${`<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="/">Home</a> / <a href="/guides">Practical guides</a> / ${escapeHtml(
    guide.title
  )}</div><div class="page-intro"><div class="eyebrow">Practical guide</div><h1>${escapeHtml(
    guide.title
  )}</h1><p>${escapeHtml(guide.intro)}</p></div></div></section>`}<main class="section"><div class="container service-detail-grid guide-layout"><article class="content-prose"><p class="guide-lede">${escapeHtml(
    guide.lede
  )}</p>${sections}${table}<div class="guide-cta"><div><h2>Want a plan for your move?</h2><p>Tell us about your property and timing. We will come back with a clear, written scope.</p></div><a class="btn dark" href="/quote">Request a moving quote ${svgArrow}</a></div></article><aside class="detail-aside guide-aside"><h3>Related guides</h3>${relatedLinks(
    guide
  )}<a class="btn dark" href="/contact">Ask us a question ${svgArrow}</a></aside></div></main><section class="section guides-faq-section"><div class="container faq-grid"><div class="faq-intro"><div class="eyebrow">Quick answers</div><h2>Questions about this topic.</h2><p>If your situation is different, we are happy to talk it through.</p><a class="text-link" href="/contact">Contact ${biz.name} ${svgArrow}</a></div><div class="guide-faq-list">${faqs}</div></div></section>`;
}

export function guidesPage(): string {
  const cards = guides
    .map(
      (guide) => `<a class="guide-card" href="${guidePath(guide)}">
        <span class="guide-card-eyebrow">Guide</span>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.description)}</p>
        <span class="guide-card-more">Read the guide ${svgArrow}</span>
      </a>`
    )
    .join("");

  return `<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="/">Home</a> / Practical guides</div><div class="page-intro"><div class="eyebrow">Practical guides</div><h1>Moving comparisons, costs and checklists.</h1><p>Straight answers to the questions people ask before booking a mover in Dubai: what changes the cost, how to compare quotes, and what to check before moving day.</p></div></div></section><main class="section"><div class="container"><div class="guide-grid">${cards}</div></div></main>`;
}
