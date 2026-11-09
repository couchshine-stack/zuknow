import type { CatalogItem } from "@/data/catalog";

export type DetailSpec = { label: string; value: string };
export type DetailFaq = { q: string; a: string };

const AISLE_COPY: Record<string, { highlights: string[]; about: string; extras: DetailSpec[]; faqs: DetailFaq[] }> = {
  "fruits-veg": {
    highlights: [
      "Sorted at the Amravati dark store, not sitting in a truck overnight",
      "Packed so it survives a scooter ride",
      "Swap or refund if the pack is bruised on arrival",
    ],
    about:
      "This is produce from the cold room, not a warehouse in another city. We pick, weigh and bag it when your order lands, then a rider leaves on the 15-minute clock. Keep it in a cool, dry place or the fridge depending on the fruit.",
    extras: [
      { label: "Storage", value: "Cool and dry, or refrigerate after opening" },
      { label: "Best for", value: "Same-day cooking and snacking" },
    ],
    faqs: [
      { q: "Will it be ripe?", a: "We pack eating-ripe pieces for the 15-minute run. If a piece is unusable on arrival, we replace or refund that line." },
    ],
  },
  dairy: {
    highlights: [
      "Pulled from the chilled rack at the dark store",
      "Kept cold until the rider hands it over",
      "Check the pack seal before you put it in the fridge",
    ],
    about:
      "Dairy and bread move from our fridge to yours on the same scooter as groceries. We do not leave milk sitting in the sun. Open the pouch or carton, smell it, and refrigerate immediately.",
    extras: [
      { label: "Storage", value: "Keep refrigerated at 4°C or below" },
      { label: "Handling", value: "Do not freeze the pouch unless the pack says so" },
    ],
    faqs: [
      { q: "What if the pouch is puffed or leaking?", a: "Refuse the pack to the rider or raise a replace request. We do not ask you to keep a blown dairy pack." },
    ],
  },
  electronics: {
    highlights: [
      "Sealed pack from the gadget dark store",
      "Checked for a complete box before it leaves Jaistambh / Camp",
      "Dead-on-arrival swap within 7 days if unused and with bill",
    ],
    about:
      "Gadgets on zuknow are the same 15-minute promise as milk. The pack is stored indoors, not on a pavement stall. Charge it once when it arrives, keep the bill in the app, and use a genuine cable where the item needs one.",
    extras: [
      { label: "Warranty", value: "7-day DOA replacement via zuknow · brand warranty if packed in box" },
      { label: "In the box", value: "Item as photographed · cables only if shown or named" },
    ],
    faqs: [
      { q: "Can I return a used power bank?", a: "Used gadgets are not returnable unless they fail on first charge. Keep the pack and bill for a DOA swap." },
      { q: "Is this original?", a: "We sell sealed electronics from the dark store. If the seal is broken on arrival, do not use it — we replace the unit." },
    ],
  },
  build: {
    highlights: [
      "Hardware aisle, same 15-minute scooter as groceries",
      "Tools are packed so edges do not tear the bag",
      "Not a replacement for a licensed contractor on structural work",
    ],
    about:
      "Home-build SKUs are for the job you started this evening: a hammer, a tap, a length of wire. We pick from the Camp hardware dark store. Wear eye protection on striking tools, and call a pro from the same app if the wall needs more than a nail.",
    extras: [
      { label: "Use", value: "Household repairs and light DIY" },
      { label: "Safety", value: "Follow printed warnings on the tool or pack" },
    ],
    faqs: [
      { q: "Can I return a hammer?", a: "Unopened tools can be returned the same day. Opened striking tools are not taken back unless faulty." },
    ],
  },
  electrical: {
    highlights: ["Rated for home use", "Rider will not install it unless you booked a pro", "Switch off MCB before you fit anything live"],
    about: "Bulbs, wire and boards from the electrical bay. Installation is a separate electrician visit on the same 15-minute clock.",
    extras: [{ label: "Install", value: "Book Electrician from On demand if you need fitting" }],
    faqs: [{ q: "Will the rider fit the bulb?", a: "No. Add an electrician visit if you want it fitted." }],
  },
  groceries: {
    highlights: ["Packed at the Rajapeth dark store", "Sealed staples", "Not a substitute for a kirana credit khata"],
    about: "Atta, rice and oil for the house, on the 15-minute clock. Check the pack weight on the label against the unit on this page.",
    extras: [{ label: "Storage", value: "Airtight tin or jar after opening" }],
    faqs: [],
  },
};

const SERVICE_COPY = {
  highlights: [
    "A person at your door on the same 15-minute clock as the grocery bag",
    "Visit fee is what you pay now · parts and extra time billed after inspection",
    "Share a landmark so the pro does not hunt the lane",
  ],
  about:
    "This is a visit, not a parcel. The pro arrives with basic tools. Anything they need to buy — a switch, a washer, extra paint — is shown to you before it is added. You pay the visit on Razorpay now; extras after the job if you agree.",
  extras: [
    { label: "What’s included", value: "Inspection + labour for the listed visit window" },
    { label: "What’s extra", value: "Parts, consumables, and time beyond the visit" },
  ],
  faqs: [
    { q: "What if they need more than 45 minutes?", a: "They will tell you before extra time starts. You can stop the job or agree a top-up." },
    { q: "Do I need to be home?", a: "Yes. Someone 18+ should be present to show the issue and approve extras." },
  ],
};

const TRUCK_COPY = {
  highlights: [
    "From Zuknow Gitte Wale, Camp — tipper truck, not the grocery scooter",
    "Price is per cubic foot (cft) or a full truck at a better rate",
    "Dumped at your plot · someone should be there to show the gate",
  ],
  about:
    "This is construction material from the Camp gitte yard. Per-cft is the published rate. A 100 cft half-body or 200 cft full-body truck works out cheaper and is how most plots in Amravati take metal and sand. Time on this page is yard loading plus the tipper ride, not a 15-minute scooter.",
  extras: [
    { label: "Fulfilment", value: "Tipper / tractor trolley to plot" },
    { label: "Unload", value: "Dumped at the gate you pin · carry-inside labour extra" },
  ],
  faqs: [
    { q: "Is this 15-minute scooter delivery?", a: "No. Gitti, sand, murum and bricks leave on a tipper from Camp. Clock is usually 60–90 minutes depending on the load and your pin." },
    { q: "What is 1 cft?", a: "One cubic foot. A half-body truck is about 100 cft; a full body about 200 cft. Per-cft is the rate card if you need a smaller tempo load." },
    { q: "Can I return a dumped truck?", a: "Once the tipper has dumped, the load cannot come back. Wrong grade (20mm vs 40mm) called out before unload can be turned around." },
  ],
};

type SkuCopy = {
  highlights?: string[];
  about?: string;
  extras?: DetailSpec[];
  faqs?: DetailFaq[];
};

const SKU_COPY: Record<string, SkuCopy> = {
  "power-bank": {
    highlights: [
      "10,000 mAh pack with a charge-% display on the face",
      "Built-in cables tucked into the side — no hunting for a lead",
      "Sealed from the Jaistambh gadget dark store",
      "Dead-on-arrival swap within 7 days if unused, with bill",
    ],
    about:
      "A second battery for the bag, not a shelf ornament. This 10,000 mAh pack is stored indoors at Zuknow Gadget Lane, Jaistambh. Charge it once when it arrives, keep the bill in Orders, and do not use it if the seal is broken. The display on the pack is the charge you have left; built-in leads are for phones that match the connectors shown in the photo.",
    extras: [
      { label: "Capacity", value: "10,000 mAh" },
      { label: "Display", value: "On-pack charge percentage" },
      { label: "Cables", value: "Built-in leads as photographed" },
      { label: "Chemistry", value: "Lithium-ion / Li-polymer class pack" },
      { label: "Use", value: "Phones and small USB gadgets" },
      { label: "Warranty", value: "7-day DOA replacement via zuknow" },
    ],
    faqs: [
      { q: "Will it charge a laptop?", a: "This class of pack is for phones and small USB devices. Laptops that need high-watt USB-C PD may not charge." },
      { q: "Can I return a used power bank?", a: "Used gadgets are not returnable unless they fail on first charge. Keep the pack and bill for a DOA swap." },
      { q: "Is this original?", a: "We sell sealed electronics from the dark store. If the seal is broken on arrival, do not use it — we replace the unit." },
    ],
  },
  "farm-bananas": {
    highlights: [
      "Eating-ripe dozen, packed at Rajapeth for a scooter ride",
      "Not sitting in a long-haul truck overnight",
      "Swap or refund if a piece is unusable on arrival",
    ],
    about:
      "A dozen bananas from the Amravati dark store, bagged when your order lands. We pick eating-ripe fruit for the 15-minute run — yellow with a little green at the stem is normal. Keep them on the counter; refrigerate only if they are already spotted and you want them to last another day.",
    extras: [
      { label: "Count", value: "12 pieces (1 dozen)" },
      { label: "Ripeness", value: "Eating-ripe for same-day" },
      { label: "Storage", value: "Room temperature · fridge only if very ripe" },
    ],
    faqs: [
      { q: "Will they all be identical?", a: "Fruit varies. We pack a usable dozen. If two or more are black or crushed, we replace or refund those pieces." },
    ],
  },
  "toned-milk-1l": {
    highlights: [
      "1 litre pouch from the chilled rack",
      "Kept cold until the rider hands it over",
      "Refuse a puffed or leaking pouch on the spot",
    ],
    about:
      "Toned milk, 1 litre pouch, pulled from the Rajapeth fridge and sent on the same scooter as groceries. We do not leave milk in the sun. Open it, smell it, and refrigerate immediately. Use it as you would any sealed pouch milk from a kirana.",
    extras: [
      { label: "Volume", value: "1 litre" },
      { label: "Pack", value: "Pouch" },
      { label: "Storage", value: "Keep refrigerated at 4°C or below after opening" },
    ],
    faqs: [
      { q: "What if the pouch is puffed or leaking?", a: "Refuse the pack to the rider or raise a replace request. We do not ask you to keep a blown dairy pack." },
    ],
  },
  "hammer-claw": {
    highlights: [
      "Claw hammer from the Camp hardware dark store",
      "Packed so the head does not tear the bag",
      "For hanging pictures and household nails — not structural work",
    ],
    about:
      "A claw hammer for the job you started this evening: a nail, a crate, a picture hook. Picked from Hardware Hub, Camp, on the same 15-minute clock as groceries. Wear eye protection on striking tools. Unopened tools can come back the same day; opened striking tools only if faulty.",
    extras: [
      { label: "Type", value: "Claw hammer" },
      { label: "Use", value: "Household repairs and light DIY" },
      { label: "Safety", value: "Eye protection on striking blows" },
    ],
    faqs: [
      { q: "Can I return a hammer?", a: "Unopened tools can be returned the same day. Opened striking tools are not taken back unless faulty." },
    ],
  },
  "electrician-visit": {
    highlights: [
      "A licensed-style home electrician at the door on the 15-minute clock",
      "45-minute visit window · parts billed after you approve them",
      "Fans, MCBs, dead sockets — not a full rewire of the house",
    ],
    about:
      "This is a visit, not a parcel. The electrician arrives with basic tools for fans, MCBs, and sockets. Anything they need to buy — a switch, a holder, extra wire — is shown to you before it is added. You pay the visit on Razorpay now; extras after the job if you agree. Someone 18+ should be home.",
    extras: [
      { label: "Visit length", value: "45 minutes included" },
      { label: "What’s included", value: "Inspection + labour for listed electrical jobs" },
      { label: "What’s extra", value: "Parts, consumables, and time beyond 45 min" },
    ],
    faqs: [
      { q: "Will they rewire the house?", a: "No. Book this for a fan, MCB, or socket. A full rewire is a separate quote." },
      { q: "What if they need more than 45 minutes?", a: "They will tell you before extra time starts. You can stop the job or agree a top-up." },
    ],
  },
  "cement-ppc": {
    highlights: [
      "50 kg PPC bag from the Camp hardware dark store",
      "Scooter delivery on the 15-minute clock — not the gitte tipper",
      "Keep dry; do not stack on damp ground",
    ],
    about:
      "A 50 kg bag of PPC cement for the mason. This bag rides the grocery scooter from Hardware Hub, Camp. For gitti and sand, open the Gitte Wale trucks in the same aisle.",
    extras: [
      { label: "Pack", value: "50 kg bag" },
      { label: "Grade", value: "PPC" },
      { label: "Storage", value: "Dry, off the floor" },
    ],
    faqs: [{ q: "Will you send a truck of cement?", a: "This listing is one 50 kg bag. Add quantity in the cart for more bags. Bulk truck cement is a call-ahead order." }],
  },
  "gitti-20mm-cft": {
    extras: [
      { label: "Grade", value: "20 mm crushed stone (metal)" },
      { label: "Rate", value: "₹52 per cubic foot" },
      { label: "Best for", value: "RCC, PCC, plaster mix as the mason specifies" },
    ],
  },
  "gitti-20mm-truck-100": {
    extras: [
      { label: "Grade", value: "20 mm crushed stone" },
      { label: "Load", value: "100 cft · half-body tipper" },
      { label: "Rate vs cft", value: "₹49 / cft on the truck (₹52 if you buy per cft)" },
    ],
  },
  "gitti-20mm-truck-200": {
    extras: [
      { label: "Grade", value: "20 mm crushed stone" },
      { label: "Load", value: "200 cft · full-body tipper" },
      { label: "Rate vs cft", value: "₹47 / cft on the truck" },
    ],
  },
  "gitti-40mm-truck-100": {
    extras: [
      { label: "Grade", value: "40 mm coarse metal" },
      { label: "Load", value: "100 cft · half-body tipper" },
      { label: "Best for", value: "PCC, soak pits, soling" },
    ],
  },
  "sand-river-cft": {
    extras: [
      { label: "Material", value: "Washed river sand" },
      { label: "Rate", value: "₹58 per cubic foot" },
    ],
  },
  "sand-river-truck-100": {
    extras: [
      { label: "Material", value: "Washed river sand" },
      { label: "Load", value: "100 cft · half-body tipper" },
      { label: "Rate vs cft", value: "₹55 / cft on the truck" },
    ],
  },
  "murum-truck-100": {
    extras: [
      { label: "Material", value: "Murum (filling earth)" },
      { label: "Load", value: "100 cft · half-body tipper" },
      { label: "Best for", value: "Plinth filling and plot levelling" },
    ],
  },
  "bricks-red-1000": {
    extras: [
      { label: "Count", value: "1,000 first-class red bricks" },
      { label: "Load", value: "Stacked on the truck" },
      { label: "Rate", value: "₹8.50 per brick on this truck" },
    ],
  },
};

function nameSpecs(item: CatalogItem): DetailSpec[] {
  const specs: DetailSpec[] = [];
  const mah = item.name.match(/([\d,]+)\s*mAh/i);
  if (mah) specs.push({ label: "Capacity", value: `${mah[1].replace(/,/g, "")} mAh` });
  const watts = item.name.match(/(\d+)\s*W\b/i);
  if (watts) specs.push({ label: "Output", value: `${watts[1]} W` });
  const litre = item.unit.match(/([\d.]+)\s*L/i);
  if (litre) specs.push({ label: "Volume", value: `${litre[1]} litre` });
  const kg = item.unit.match(/([\d.]+)\s*kg/i);
  if (kg) specs.push({ label: "Net weight", value: `${kg[1]} kg` });
  const dozen = /dozen/i.test(item.unit) || /dozen/i.test(item.name);
  if (dozen) specs.push({ label: "Count", value: "12 pieces (1 dozen)" });
  const cft = item.unit.match(/([\d.]+)\s*cft/i) || item.name.match(/([\d.]+)\s*cft/i);
  if (cft) specs.push({ label: "Volume", value: `${cft[1]} cubic feet (cft)` });
  if (/20\s*mm/i.test(item.name)) specs.push({ label: "Size", value: "20 mm" });
  if (/40\s*mm/i.test(item.name)) specs.push({ label: "Size", value: "40 mm" });
  if (/half body/i.test(item.unit)) specs.push({ label: "Truck", value: "Half body" });
  if (/full body/i.test(item.unit)) specs.push({ label: "Truck", value: "Full body" });
  return specs;
}

function dedupeSpecs(rows: DetailSpec[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeFaqs(rows: DetailFaq[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function productDetail(item: CatalogItem) {
  const yard = item.tags.includes("gitti-wale") || item.tags.includes("truck");
  const aisle = item.kind === "service"
    ? SERVICE_COPY
    : yard
      ? TRUCK_COPY
      : AISLE_COPY[item.category] || {
          highlights: [
            "Packed at an Amravati dark store",
            "Same 15-minute clock as the rest of the cart",
            "Pay on Razorpay · WhatsApp login optional",
          ],
          about: `We pick this from the nearest live dark store and send it on a scooter. If the pack is wrong or damaged, we replace or refund that line.`,
          extras: [],
          faqs: [],
        };
  const sku = SKU_COPY[item.slug] || {};

  const stock = item.stock ?? 0;
  const stockLabel =
    stock <= 0 ? "Currently out of stock" : stock <= 8 ? `Only ${stock} left at this store` : `In stock · ${stock} at this dark store`;

  const specs = dedupeSpecs([
    { label: "Item", value: item.name },
    { label: "Unit / pack", value: item.unit },
    { label: "Aisle", value: item.categoryName || item.category },
    ...nameSpecs(item),
    ...(sku.extras || []),
    ...aisle.extras,
    { label: "Sold by", value: item.sellerName || "zuknow.in" },
    { label: "Packed at", value: item.sellerAddress || "Amravati dark store" },
    { label: "Delivery clock", value: `About ${item.etaMinutes} min packing + ride` },
    { label: "Availability", value: stockLabel },
  ]);

  const faqs = dedupeFaqs([
    ...(sku.faqs || []),
    ...aisle.faqs,
    {
      q: "How fast is delivery?",
      a: yard
        ? "Yard loading plus the tipper ride from Camp Gitte Wale. Share GPS for a live Google Maps number. This is not the 15-minute grocery scooter."
        : "The badge on this page is packing time plus scooter time from this shop to your pin. Share GPS in the header for a live Google Maps number.",
    },
    {
      q: "How do I pay?",
      a: "Razorpay at checkout — UPI, cards, netbanking. Guest checkout is available unless admin turns it off.",
    },
    {
      q: "What if I get the wrong item?",
      a: "Keep the pack. Use Orders in your account (or the same phone you paid with) and we replace or refund that line.",
    },
  ]);

  const about = (sku.about || `${item.blurb} ${aisle.about}`).replace(/\s+/g, " ").trim();

  return {
    highlights: sku.highlights || aisle.highlights,
    about,
    specs,
    faqs,
    stockLabel,
    stock,
    lowStock: stock > 0 && stock <= 8,
    outOfStock: stock <= 0,
    policies:
      item.kind === "service"
        ? [
            { title: "Visit fee now", body: "Razorpay for the listed visit. Parts and extra time only after you agree." },
            { title: "Someone 18+ home", body: "A person must be present to show the job and approve extras." },
            { title: "Not a parcel", body: "The pro follows the same map as grocery riders. Share a landmark in checkout." },
          ]
        : yard
          ? [
              { title: "Rate card", body: "Per cft is the published rate. Trucks are cheaper per foot." },
              { title: "No return after dump", body: "Stop the unload if the grade is wrong. Dumped loads stay." },
              { title: "Someone at the plot", body: "Show the gate. Carry-inside labour is extra." },
            ]
          : [
              { title: "Same-day returns", body: "Unopened grocery and hardware packs can come back the same day if unused." },
              { title: "Replacement", body: "Wrong, damaged, or DOA lines are replaced or refunded. Keep the pack and bill." },
              { title: "Pay on Razorpay", body: "UPI, cards, netbanking. Guest checkout is on unless admin turns it off." },
            ],
  };
}
