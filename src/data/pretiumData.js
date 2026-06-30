// Pretium catalog — curated, recognizable items with typical US prices.
//
// Sourcing: prices are MSRPs or widely cited typical US retail prices as of
// late 2025. Curated by hand because no good free live price API exists
// (retailer APIs need affiliate keys; crowdsourced price data is too sparse).
// The game is only fun when players recognize the item, so iconic > obscure.
//
// To update or extend: keep items within a category spread across price
// ranges (the round builder needs gaps), and prefer items whose prices are
// stable and verifiable (MSRP, menu price, list price).

export const CATALOG = [
  {
    id: 'grocery',
    label: 'Grocery Staples',
    blurb: 'Typical US supermarket shelf prices',
    items: [
      { name: 'Bananas (per lb)',                          price: 0.62,  detail: 'US average supermarket price' },
      { name: 'Barilla Penne Pasta (16 oz)',               price: 1.79,  detail: 'Classic blue box, dry pasta aisle' },
      { name: 'Wonder Bread Classic White Loaf',           price: 2.99,  detail: '20 oz sliced sandwich loaf' },
      { name: 'Large Eggs (dozen, Grade A)',               price: 3.49,  detail: 'US average — famously volatile' },
      { name: 'Heinz Tomato Ketchup (20 oz)',              price: 3.79,  detail: 'Squeeze bottle' },
      { name: 'Whole Milk (1 gallon)',                     price: 3.99,  detail: 'US average supermarket price' },
      { name: 'Jif Creamy Peanut Butter (16 oz)',          price: 3.29,  detail: 'Pantry staple jar' },
      { name: 'Costco Rotisserie Chicken',                 price: 4.99,  detail: 'The famously never-raised price' },
      { name: 'Tropicana Orange Juice (52 oz)',            price: 4.99,  detail: 'Pure Premium, no pulp' },
      { name: 'Cheerios (18 oz family size)',              price: 5.49,  detail: 'General Mills cereal box' },
      { name: 'Oreo Family Size Pack',                     price: 5.49,  detail: '~19 oz of cookies' },
      { name: "Ben & Jerry's Pint",                        price: 5.99,  detail: 'Half Baked, Cherry Garcia, etc.' },
      { name: 'Coca-Cola 12-Pack (12 oz cans)',            price: 7.99,  detail: 'Soda aisle standard' },
      { name: 'Kerrygold Irish Butter (8 oz)',             price: 4.49,  detail: 'Grass-fed, gold foil' },
      { name: 'Extra Virgin Olive Oil (500 ml, mid-range)', price: 11.99, detail: 'e.g., California Olive Ranch' },
      { name: 'Starbucks K-Cups (24-count box)',           price: 18.99, detail: 'Pike Place medium roast pods' },
    ],
  },
  {
    id: 'fastfood',
    label: 'Fast Food & Takeout',
    blurb: 'Menu prices, US averages',
    items: [
      { name: 'Costco Hot Dog + Soda Combo',               price: 1.50,  detail: 'Unchanged since 1985' },
      { name: "McDonald's Vanilla Cone",                   price: 1.69,  detail: 'Soft serve classic' },
      { name: 'Dunkin Medium Iced Coffee',                 price: 3.99,  detail: 'Plain, before flavor shots' },
      { name: "McDonald's Large Fries",                    price: 4.19,  detail: 'US average price' },
      { name: 'Taco Bell Crunchwrap Supreme',              price: 5.49,  detail: 'A la carte' },
      { name: 'Chick-fil-A Chicken Sandwich',              price: 5.65,  detail: 'The original, a la carte' },
      { name: 'Big Mac',                                   price: 5.69,  detail: 'US average, burger only' },
      { name: 'In-N-Out Double-Double',                    price: 5.90,  detail: 'Burger only, West Coast icon' },
      { name: 'Whopper',                                   price: 6.79,  detail: 'Burger King flagship, sandwich only' },
      { name: "Domino's Medium 2-Topping Pizza",           price: 7.99,  detail: 'Carryout deal price' },
      { name: 'Subway Footlong (Turkey)',                  price: 8.49,  detail: 'No combo, standard build' },
      { name: 'Chipotle Chicken Burrito',                  price: 9.85,  detail: 'US average, no guac' },
      { name: 'Starbucks Grande Caffè Latte',              price: 5.45,  detail: 'US average price' },
      { name: 'Five Guys Cheeseburger',                    price: 12.99, detail: 'Burger only — famously pricey' },
      { name: 'KFC 8-Piece Bucket',                        price: 24.99, detail: 'Chicken only, no sides' },
      { name: 'Large Movie Theater Popcorn',               price: 9.50,  detail: 'US chain average' },
    ],
  },
  {
    id: 'tech',
    label: 'Tech & Gadgets',
    blurb: 'Current MSRPs',
    items: [
      { name: 'Roku Express HD',                           price: 29.99,  detail: 'Entry streaming stick' },
      { name: 'Amazon Echo Dot',                           price: 49.99,  detail: '5th gen smart speaker' },
      { name: 'Anker 20,000mAh Power Bank',                price: 49.99,  detail: 'Everyday portable charger' },
      { name: 'Raspberry Pi 5 (8GB)',                      price: 80.00,  detail: 'Single-board computer' },
      { name: 'Logitech MX Master 3S Mouse',               price: 99.99,  detail: 'Productivity flagship mouse' },
      { name: 'JBL Flip 6 Speaker',                        price: 129.95, detail: 'Portable Bluetooth speaker' },
      { name: 'Kindle Paperwhite',                         price: 159.99, detail: '16GB e-reader' },
      { name: 'AirPods Pro 2',                             price: 249.00, detail: 'Apple MSRP' },
      { name: 'iPad (11th gen)',                           price: 349.00, detail: 'Base model Apple tablet' },
      { name: 'Apple Watch Series 10',                     price: 399.00, detail: '42mm GPS, MSRP' },
      { name: 'Sony WH-1000XM5 Headphones',                price: 399.99, detail: 'Noise-cancelling flagship' },
      { name: 'GoPro Hero 13 Black',                       price: 399.99, detail: 'Action camera MSRP' },
      { name: '65" TCL 4K Smart TV',                       price: 449.99, detail: 'Budget big-screen standard' },
      { name: 'Dyson V15 Detect Vacuum',                   price: 749.99, detail: 'Cordless flagship vacuum' },
      { name: 'iPhone 16 (base)',                          price: 799.00, detail: 'Apple MSRP at launch' },
      { name: 'MacBook Air 13" (M4)',                      price: 1099.00, detail: 'Base configuration MSRP' },
      { name: 'Apple Vision Pro',                          price: 3499.00, detail: 'Apple spatial computer MSRP' },
    ],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    blurb: 'Console-aisle MSRPs',
    items: [
      { name: 'Minecraft (Java & Bedrock, PC)',            price: 29.99,  detail: 'Best-selling game ever' },
      { name: 'Mario Kart 8 Deluxe',                       price: 59.99,  detail: 'Switch evergreen, full price' },
      { name: 'Xbox Wireless Controller',                  price: 64.99,  detail: 'Standard gamepad MSRP' },
      { name: 'New AAA Game (standard edition)',           price: 69.99,  detail: 'Current-gen standard pricing' },
      { name: 'PS5 DualSense Controller',                  price: 74.99,  detail: 'Sony MSRP' },
      { name: 'Xbox Series S',                             price: 299.99, detail: 'Digital-only console' },
      { name: 'Nintendo Switch OLED',                      price: 349.99, detail: 'Previous-gen flagship' },
      { name: 'Nintendo Switch 2',                         price: 449.99, detail: 'Launch MSRP' },
      { name: 'PlayStation 5 (disc)',                      price: 499.99, detail: 'Standard slim console' },
      { name: 'Arcade1Up Cabinet',                         price: 499.99, detail: 'Home arcade machine, typical MSRP' },
      { name: 'Steam Deck OLED (512GB)',                   price: 549.00, detail: 'Valve handheld PC' },
      { name: 'Secretlab Titan Evo Chair',                 price: 549.00, detail: 'The gaming chair' },
      { name: 'PS5 Pro',                                   price: 699.99, detail: 'Premium console MSRP' },
      { name: 'NVIDIA RTX 5090',                           price: 1999.00, detail: 'Flagship GPU MSRP (good luck)' },
    ],
  },
  {
    id: 'clothing',
    label: 'Clothing & Shoes',
    blurb: 'Standard retail, not sale prices',
    items: [
      { name: 'Hanes White T-Shirt 3-Pack',                price: 12.99,  detail: 'The plain tee baseline' },
      { name: 'Uniqlo HEATTECH Crew Tee',                  price: 14.90,  detail: 'Thermal base layer' },
      { name: 'Carhartt Knit Beanie',                      price: 19.99,  detail: 'The ubiquitous watch hat' },
      { name: 'Crocs Classic Clog',                        price: 49.99,  detail: 'Love them or hate them' },
      { name: 'Champion Reverse Weave Hoodie',             price: 60.00,  detail: 'Classic heavyweight hoodie' },
      { name: 'Converse Chuck Taylor High Top',            price: 65.00,  detail: 'Unchanged design since 1922' },
      { name: "Levi's 501 Original Jeans",                 price: 69.50,  detail: 'The original blue jean' },
      { name: 'Lululemon Align Leggings',                  price: 98.00,  detail: '25" flagship leggings' },
      { name: 'Adidas Samba OG',                           price: 100.00, detail: 'The it-shoe revival' },
      { name: 'Birkenstock Arizona',                       price: 110.00, detail: 'Two-strap suede sandal' },
      { name: "Nike Air Force 1 '07",                      price: 115.00, detail: 'White-on-white classic' },
      { name: 'Patagonia Better Sweater',                  price: 159.00, detail: 'Fleece quarter-zip staple' },
      { name: 'Ray-Ban Wayfarer',                          price: 163.00, detail: 'Classic acetate sunglasses' },
      { name: 'Dr. Martens 1460 Boots',                    price: 170.00, detail: '8-eye smooth leather' },
      { name: 'Air Jordan 1 Retro High OG',                price: 180.00, detail: 'Retail price, not resale' },
      { name: 'The North Face Nuptse Jacket',              price: 320.00, detail: '1996 retro puffer' },
    ],
  },
  {
    id: 'luxury',
    label: 'Luxury',
    blurb: 'Boutique retail prices, not resale',
    items: [
      { name: 'Dom Pérignon Vintage Champagne',            price: 250.00,   detail: 'Standard 750ml bottle' },
      { name: 'The Macallan 18 Year Scotch',               price: 380.00,   detail: 'Sherry oak cask, 750ml' },
      { name: 'Gucci GG Marmont Belt',                     price: 550.00,   detail: 'The double-G leather belt' },
      { name: 'Gucci Ace Sneakers',                        price: 790.00,   detail: 'Embroidered leather low-top' },
      { name: 'Christian Louboutin So Kate Pumps',         price: 845.00,   detail: 'Red-soled 120mm heel' },
      { name: 'Montblanc Meisterstück 149 Pen',            price: 1135.00,  detail: 'The fountain pen' },
      { name: 'Goyard Saint Louis PM Tote',                price: 1980.00,  detail: 'The quiet-luxury tote' },
      { name: 'Louis Vuitton Neverfull MM',                price: 2130.00,  detail: 'Monogram canvas tote' },
      { name: 'Burberry Kensington Trench',                price: 2450.00,  detail: 'Mid-length heritage trench' },
      { name: 'Cartier Love Bracelet',                     price: 7450.00,  detail: 'Yellow gold, screws included' },
      { name: 'Omega Speedmaster Moonwatch',               price: 7600.00,  detail: 'Worn on the Moon, steel' },
      { name: 'Rolex Submariner Date',                     price: 10250.00, detail: 'Steel, retail (waitlist not included)' },
      { name: 'Chanel Classic Flap (Medium)',              price: 11300.00, detail: 'Quilted lambskin icon' },
      { name: 'Hermès Birkin 25',                          price: 12100.00, detail: 'Togo leather, boutique price' },
    ],
  },
  {
    id: 'beauty',
    label: 'Beauty & Personal Care',
    blurb: 'Drugstore to department store',
    items: [
      { name: 'Old Spice Deodorant',                       price: 5.99,   detail: 'Drugstore stick' },
      { name: 'The Ordinary Niacinamide Serum',            price: 6.50,   detail: '30ml — the viral cheap serum' },
      { name: 'Maybelline Sky High Mascara',               price: 12.99,  detail: 'Drugstore bestseller' },
      { name: 'Native Deodorant',                          price: 14.00,  detail: 'The premium natural stick' },
      { name: 'CeraVe Moisturizing Cream (16 oz)',         price: 18.99,  detail: 'Dermatologist-favorite tub' },
      { name: 'Olaplex No. 3 Hair Perfector',              price: 30.00,  detail: 'Bond-building treatment' },
      { name: 'Charlotte Tilbury Pillow Talk Lipstick',    price: 35.00,  detail: 'The famous nude-pink' },
      { name: 'Philips Sonicare 4100',                     price: 49.99,  detail: 'Entry electric toothbrush' },
      { name: 'Dior Sauvage EDT (100 ml)',                 price: 175.00, detail: "Best-selling men's fragrance" },
      { name: 'Chanel No. 5 EDP (100 ml)',                 price: 182.00, detail: 'The fragrance' },
      { name: 'SK-II Facial Treatment Essence (230 ml)',   price: 300.00, detail: 'Cult Japanese essence' },
      { name: 'La Mer Crème de la Mer (2 oz)',             price: 380.00, detail: 'The famously expensive moisturizer' },
      { name: 'Dyson Airwrap',                             price: 599.99, detail: 'Multi-styler MSRP' },
    ],
  },
  {
    id: 'home',
    label: 'Home & Kitchen',
    blurb: 'List prices for household icons',
    items: [
      { name: 'Lodge Cast Iron Skillet (10.25")',          price: 24.99,  detail: 'The $25 forever pan' },
      { name: 'Brita Water Pitcher',                       price: 29.99,  detail: '6-cup standard pitcher' },
      { name: 'Yeti Rambler 30 oz Tumbler',                price: 38.00,  detail: 'Stainless tumbler' },
      { name: 'Hydro Flask 32 oz',                         price: 44.95,  detail: 'Wide mouth bottle' },
      { name: 'Stanley Quencher 40 oz',                    price: 45.00,  detail: 'The TikTok cup' },
      { name: 'Keurig K-Mini',                             price: 79.99,  detail: 'Single-serve pod brewer' },
      { name: 'IKEA BILLY Bookcase',                       price: 89.99,  detail: "The world's bestselling bookcase" },
      { name: 'Instant Pot Duo (6 qt)',                    price: 99.95,  detail: '7-in-1 pressure cooker' },
      { name: 'Ninja Air Fryer',                           price: 129.99, detail: '4-quart standard model' },
      { name: 'Nespresso Vertuo Next',                     price: 159.00, detail: 'Pod espresso machine' },
      { name: 'Dyson V8 Vacuum',                           price: 369.99, detail: 'Entry cordless stick' },
      { name: 'Le Creuset Dutch Oven (5.5 qt)',            price: 419.95, detail: 'Enameled cast iron icon' },
      { name: 'KitchenAid Artisan Stand Mixer',            price: 449.99, detail: 'The wedding-registry classic' },
      { name: 'Casper Original Mattress (Queen)',          price: 1095.00, detail: 'Bed-in-a-box standard' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Outdoors',
    blurb: 'Gear at full retail',
    items: [
      { name: 'Spalding Street Basketball',                price: 24.99,  detail: 'Outdoor rubber ball' },
      { name: 'Coleman Sundome 2-Person Tent',             price: 54.99,  detail: 'Entry camping tent' },
      { name: 'Titleist Pro V1 (dozen)',                   price: 54.99,  detail: 'The premium golf ball' },
      { name: 'Garmin Forerunner 165',                     price: 249.99, detail: 'Entry GPS running watch' },
      { name: 'Wilson NBA Official Game Ball',             price: 249.99, detail: 'The actual game ball — not the replica' },
      { name: 'Yeti Tundra 45 Cooler',                     price: 325.00, detail: 'The overbuilt cooler' },
      { name: 'REI Half Dome 2 Tent',                      price: 329.00, detail: 'Backpacking favorite' },
      { name: 'Burton Custom Snowboard',                   price: 639.95, detail: 'The benchmark all-mountain board' },
      { name: 'Trek Marlin 5 Mountain Bike',               price: 649.99, detail: 'Entry hardtail MTB' },
      { name: 'Peloton Bike',                              price: 1445.00, detail: 'Original bike, before subscription' },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions & Services',
    blurb: 'Monthly unless noted',
    items: [
      { name: 'iCloud+ 50GB (monthly)',                    price: 0.99,   detail: "Apple's cheapest tier" },
      { name: 'Netflix Standard with Ads (monthly)',       price: 7.99,   detail: 'Cheapest Netflix tier' },
      { name: 'Spotify Premium (monthly)',                 price: 11.99,  detail: 'Individual plan' },
      { name: 'Disney+ Premium (monthly)',                 price: 13.99,  detail: 'No-ads tier' },
      { name: 'YouTube Premium (monthly)',                 price: 13.99,  detail: 'Ad-free + background play' },
      { name: 'Amazon Prime (monthly)',                    price: 14.99,  detail: 'Month-to-month plan' },
      { name: 'Planet Fitness Classic (monthly)',          price: 15.00,  detail: 'The $15 gym' },
      { name: 'Netflix Standard (monthly)',                price: 17.99,  detail: 'Ad-free HD tier' },
      { name: 'ChatGPT Plus (monthly)',                    price: 20.00,  detail: 'OpenAI subscription' },
      { name: 'Xbox Game Pass Ultimate (monthly)',         price: 29.99,  detail: 'After the 2025 price hike' },
      { name: 'Costco Gold Star (annual)',                 price: 65.00,  detail: 'Basic membership, per year' },
      { name: 'Amazon Prime (annual)',                     price: 139.00, detail: 'Yearly plan' },
    ],
  },
  {
    id: 'everyday',
    label: 'Everyday America',
    blurb: 'The prices everyone half-remembers',
    items: [
      { name: 'Forever Stamp',                             price: 0.78,   detail: 'USPS first-class postage' },
      { name: 'Vending Machine Soda',                      price: 2.00,   detail: '20 oz bottle, typical' },
      { name: 'Powerball Ticket',                          price: 2.00,   detail: 'One play' },
      { name: 'NYC Subway Ride',                           price: 2.90,   detail: 'Single swipe/tap fare' },
      { name: 'Gallon of Regular Gas',                     price: 3.15,   detail: 'US national average' },
      { name: 'Tall Starbucks Drip Coffee',                price: 3.25,   detail: 'Plain brewed, US average' },
      { name: 'US Movie Ticket (average)',                 price: 11.75,  detail: 'National average admission' },
      { name: 'Car Wash (basic automatic)',                price: 12.00,  detail: 'Drive-through exterior wash' },
      { name: 'Krispy Kreme Original Glazed (dozen)',      price: 14.99,  detail: 'A dozen hot-light donuts' },
      { name: "Haircut (men's, chain salon)",              price: 21.00,  detail: 'Supercuts-style average' },
      { name: 'Disneyland 1-Day Ticket (cheapest tier)',   price: 104.00, detail: 'Lowest-demand weekday' },
      { name: 'Average US Monthly Electric Bill',          price: 144.00, detail: 'EIA residential average' },
    ],
  },
  {
    id: 'bigticket',
    label: 'Big Ticket',
    blurb: 'When the decimal point moves',
    items: [
      { name: 'Year of In-State Public College',           price: 11260,   detail: 'Tuition & fees, College Board avg' },
      { name: 'Honda Civic (base MSRP)',                   price: 24250,   detail: 'LX trim, before fees' },
      { name: 'Toyota Camry (base MSRP)',                  price: 28700,   detail: 'LE trim, before fees' },
      { name: 'Average US Wedding',                        price: 33000,   detail: 'The Knot annual survey' },
      { name: 'Ford F-150 (base MSRP)',                    price: 38810,   detail: "America's best-selling truck" },
      { name: 'Tesla Model 3 (base MSRP)',                 price: 42490,   detail: 'Before incentives' },
      { name: 'Average New Car (all types)',               price: 48000,   detail: 'US average transaction price' },
      { name: 'Median US Home Down Payment',               price: 63000,   detail: '~15% of median sale price' },
      { name: 'Super Bowl Ad (30 seconds)',                price: 8000000, detail: 'Broadcast slot only' },
    ],
  },
];

// ── Round builder ─────────────────────────────────────────────────────────────

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Standard mode: price gaps tighten as rounds progress.
function minGapForRound(roundNum) {
  if (roundNum <= 3) return 1.6;   // easy — prices clearly apart
  if (roundNum <= 6) return 1.35;
  return 1.18;                      // hard — close calls
}

/**
 * Build a round: 4 items from one category whose sorted prices are each at
 * least the round's minimum ratio apart (so ordering is always fair), avoiding
 * items already used this session. Relaxes constraints rather than failing.
 */
export function buildRound(roundNum, usedNames = new Set()) {
  const minGap = minGapForRound(roundNum);

  const tryBuild = (respectUsed, gap) => {
    for (const cat of shuffle(CATALOG)) {
      const pool = respectUsed
        ? cat.items.filter(i => !usedNames.has(i.name))
        : cat.items;
      if (pool.length < 4) continue;

      for (let attempt = 0; attempt < 200; attempt++) {
        const four = shuffle(pool).slice(0, 4);
        const sorted = [...four].sort((a, b) => a.price - b.price);
        const ok = sorted.every((it, i) => i === 0 || it.price / sorted[i - 1].price >= gap);
        if (ok) {
          return { category: cat.label, blurb: cat.blurb, items: shuffle(four) };
        }
      }
    }
    return null;
  };

  return (
    tryBuild(true, minGap) ??
    tryBuild(true, 1.1) ??
    tryBuild(false, minGap) ??
    tryBuild(false, 1.05)
  );
}

export const STANDARD_ROUNDS = 10;
