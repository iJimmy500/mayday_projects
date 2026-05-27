// All values are in the category's baseUnit.
// difficulty: 1 = everyone knows it, 2 = most have a rough idea, 3 = surprising/counterintuitive

export const CATEGORIES = {

  // --- AREA -- base: m2 -------------------------------------------------------
  area: {
    label: 'Area',
    baseUnit: 'm²',
    units: [
      { id: 'parking_spot',        label: 'parking spots',                    value: 14.9,                    difficulty: 1, hint: 'Standard US parking space (8.5 ft x 18 ft)' },
      { id: 'tennis_court',        label: 'tennis courts',                    value: 260.87,                  difficulty: 1, hint: 'Doubles court including sidelines' },
      { id: 'basketball_court',    label: 'NBA basketball courts',            value: 436,                     difficulty: 2, hint: '94 ft x 50 ft regulation court' },
      { id: 'hockey_rink',         label: 'NHL hockey rinks',                 value: 1_763,                   difficulty: 2, hint: '200 ft x 85 ft standard rink' },
      { id: 'football_field',      label: 'NFL football fields',              value: 5_351,                   difficulty: 1, hint: 'Including both end zones (360 ft x 160 ft)' },
      { id: 'soccer_pitch',        label: 'FIFA soccer pitches',              value: 7_140,                   difficulty: 1, hint: 'Regulation pitch (105m x 68m)' },
      { id: 'costco',              label: 'Costco warehouses',                value: 13_700,                  difficulty: 2, hint: 'Average US Costco floor area' },
      { id: 'walmart',             label: 'Walmart Supercenters',             value: 18_580,                  difficulty: 2, hint: 'Average US Supercenter floor area' },
      { id: 'ikea',                label: 'IKEA stores',                      value: 28_000,                  difficulty: 2, hint: 'Average global IKEA store' },
      { id: 'olympic_pool_surf',   label: 'Olympic pool surfaces',            value: 2_500,                   difficulty: 2, hint: '50m x 25m regulation pool' },
      { id: 'white_house',         label: 'White House floor areas',          value: 5_100,                   difficulty: 3, hint: 'Total floor area of the White House (all floors)' },
      { id: 'central_park',        label: 'Central Parks (NYC)',              value: 3_410_000,               difficulty: 1, hint: '843 acres in the heart of Manhattan' },
      { id: 'disneyland',          label: 'Disneyland parks',                 value: 850_000,                 difficulty: 2, hint: 'Anaheim park only (not the full resort)' },
      { id: 'vatican_city',        label: 'Vatican Cities',                   value: 440_000,                 difficulty: 2, hint: 'Smallest internationally recognized country' },
      { id: 'monaco',              label: 'Monacos',                          value: 2_020_000,               difficulty: 2, hint: 'Second smallest country in the world' },
      { id: 'manhattan',           label: 'Manhattans',                       value: 59_100_000,              difficulty: 2, hint: 'Island of Manhattan, NYC' },
      { id: 'rhode_island',        label: 'Rhode Islands',                    value: 4_001_000_000,           difficulty: 1, hint: 'Smallest US state' },
      { id: 'los_angeles',         label: 'City of Los Angeleses',            value: 1_302_000_000,           difficulty: 2, hint: 'LA city limits, not greater metro' },
      { id: 'texas',               label: 'Texases',                          value: 695_662_000_000,         difficulty: 1, hint: 'Second largest US state' },
      { id: 'amazon_rainforest',   label: 'Amazon Rainforests',               value: 5_500_000_000_000,       difficulty: 1, hint: 'Largest tropical rainforest on Earth' },
      { id: 'united_states',       label: 'United States',                    value: 9_833_517_000_000,       difficulty: 1, hint: 'Total US land + water area' },
      { id: 'russia',              label: 'Russias',                          value: 17_098_000_000_000,      difficulty: 2, hint: 'Largest country by area' },
      { id: 'africa',              label: 'Africas',                          value: 30_370_000_000_000,      difficulty: 2, hint: 'Second largest continent' },
      { id: 'earth_land',          label: 'Earth land surfaces',              value: 148_940_000_000_000,     difficulty: 2, hint: 'Total dry land on Earth' },
    ],
  },

  // --- VOLUME -- base: liters -------------------------------------------------
  volume: {
    label: 'Volume',
    baseUnit: 'L',
    units: [
      { id: 'teaspoon',            label: 'teaspoons',                        value: 0.00493,                 difficulty: 1, hint: 'Standard US measuring teaspoon' },
      { id: 'shot_glass',          label: 'shot glasses',                     value: 0.044,                   difficulty: 1, hint: 'Standard 1.5 oz shot' },
      { id: 'soda_can',            label: 'standard soda cans',               value: 0.355,                   difficulty: 1, hint: '12 fl oz can' },
      { id: 'wine_bottle',         label: 'standard wine bottles',            value: 0.75,                    difficulty: 1, hint: 'Standard 750 mL bottle' },
      { id: 'two_liter',           label: '2-liter bottles',                  value: 2,                       difficulty: 1, hint: 'Classic soda bottle' },
      { id: 'gallon',              label: 'US gallons',                       value: 3.785,                   difficulty: 1, hint: 'One US liquid gallon' },
      { id: 'beer_keg',            label: 'half-barrel beer kegs',            value: 58.67,                   difficulty: 2, hint: 'Standard party keg (15.5 gallons)' },
      { id: 'bathtub',             label: 'standard bathtubs',                value: 300,                     difficulty: 1, hint: 'Average bathtub fill (80 gallons)' },
      { id: 'hot_tub',             label: 'hot tubs',                         value: 1_500,                   difficulty: 2, hint: 'Average 4-6 person hot tub' },
      { id: 'school_bus',          label: 'school bus interiors',             value: 40_000,                  difficulty: 2, hint: 'Interior volume of a full-size school bus' },
      { id: '747_fuel',            label: 'Boeing 747 fuel tanks',            value: 216_847,                 difficulty: 3, hint: 'Full fuel capacity of a 747-400' },
      { id: 'olympic_pool',        label: 'Olympic swimming pools',           value: 2_500_000,               difficulty: 1, hint: '50m x 25m x 2m regulation pool' },
      { id: 'empire_state',        label: 'Empire State Buildings',           value: 1_045_000_000,           difficulty: 3, hint: 'Total enclosed volume of the building' },
      { id: 'great_salt_lake',     label: 'Great Salt Lakes',                 value: 18_000_000_000_000,      difficulty: 3, hint: 'Volume at historical average level' },
      { id: 'lake_superior',       label: 'Lake Superiors',                   value: 12_100_000_000_000_000,  difficulty: 2, hint: 'Largest Great Lake by surface area' },
      { id: 'pacific_ocean',       label: 'Pacific Oceans',                   value: 7.1e17,                  difficulty: 1, hint: 'Largest ocean, covers ~46% of Earth\'s water surface' },
      { id: 'earth_oceans',        label: "Earth's oceans (total)",           value: 1.335e18,                difficulty: 2, hint: 'All ocean water on Earth combined' },
    ],
  },

  // --- WEIGHT -- base: kg -----------------------------------------------------
  weight: {
    label: 'Weight',
    baseUnit: 'kg',
    units: [
      { id: 'grain_of_rice',       label: 'grains of rice',                   value: 0.000025,                difficulty: 2, hint: 'One medium-grain white rice kernel' },
      { id: 'dollar_bill',         label: 'dollar bills',                     value: 0.001,                   difficulty: 2, hint: 'All US denominations weigh exactly 1 gram' },
      { id: 'penny',               label: 'US pennies',                       value: 0.0025,                  difficulty: 2, hint: 'Modern zinc penny (post-1982)' },
      { id: 'golf_ball',           label: 'golf balls',                       value: 0.04593,                 difficulty: 2, hint: 'Max regulation weight (1.62 oz)' },
      { id: 'baseball',            label: 'baseballs',                        value: 0.1417,                  difficulty: 2, hint: 'Official MLB ball (5 to 5.25 oz)' },
      { id: 'basketball',          label: 'basketballs',                      value: 0.623,                   difficulty: 2, hint: 'Official NBA game ball' },
      { id: 'newborn_baby',        label: 'newborn babies',                   value: 3.4,                     difficulty: 1, hint: 'Average US newborn birth weight' },
      { id: 'human',               label: 'average adult humans',             value: 70,                      difficulty: 1, hint: 'Global average adult body weight' },
      { id: 'golden_retriever',    label: 'golden retrievers',                value: 32,                      difficulty: 1, hint: 'Average adult male golden retriever' },
      { id: 'giant_panda',         label: 'giant pandas',                     value: 100,                     difficulty: 2, hint: 'Average adult male' },
      { id: 'lion',                label: 'adult male lions',                 value: 190,                     difficulty: 2, hint: 'Average adult male African lion' },
      { id: 'polar_bear',          label: 'polar bears',                      value: 450,                     difficulty: 2, hint: 'Average adult male polar bear' },
      { id: 'grand_piano',         label: 'concert grand pianos',             value: 480,                     difficulty: 2, hint: 'Steinway Model D concert grand' },
      { id: 'horse',               label: 'average horses',                   value: 500,                     difficulty: 1, hint: 'Typical light riding horse' },
      { id: 'small_car',           label: 'Toyota Corollas',                  value: 1_390,                   difficulty: 1, hint: "One of the world's most popular cars" },
      { id: 'hippo',               label: 'hippos',                           value: 2_000,                   difficulty: 2, hint: 'Average adult male hippopotamus' },
      { id: 'orca',                label: 'orcas (killer whales)',            value: 5_500,                   difficulty: 2, hint: 'Average adult male orca' },
      { id: 'elephant',            label: 'African elephants',                value: 6_000,                   difficulty: 1, hint: 'Average adult male African bush elephant' },
      { id: 't_rex',               label: 'T. rex dinosaurs',                 value: 8_000,                   difficulty: 2, hint: 'Best current estimate for Tyrannosaurus rex' },
      { id: 'school_bus',          label: 'empty school buses',               value: 11_793,                  difficulty: 1, hint: 'Standard full-size Type C school bus, no passengers' },
      { id: 'blue_whale',          label: 'blue whales',                      value: 150_000,                 difficulty: 1, hint: 'Heaviest animal ever known to exist' },
      { id: '747',                 label: 'empty Boeing 747s',                value: 178_756,                 difficulty: 2, hint: 'Operating empty weight of a 747-400' },
      { id: 'iss',                 label: 'International Space Stations',     value: 419_725,                 difficulty: 2, hint: 'Total mass of the ISS in orbit' },
      { id: 'statue_of_liberty',   label: 'Statues of Liberty',               value: 204_000,                 difficulty: 2, hint: 'Total weight of the statue (copper + frame + pedestal)' },
      { id: 'eiffel_tower',        label: 'Eiffel Towers',                    value: 7_300_000,               difficulty: 2, hint: 'Iron structure only, not including foundation' },
      { id: 'titanic',             label: 'RMS Titanics',                     value: 52_310_000,              difficulty: 2, hint: 'Displacement weight (total ship weight when loaded)' },
      { id: 'empire_state_bldg',   label: 'Empire State Buildings',           value: 365_000_000,             difficulty: 3, hint: 'Total weight of the steel structure and building' },
      { id: 'great_pyramid',       label: 'Great Pyramids of Giza',           value: 5_900_000_000,           difficulty: 2, hint: 'Estimated weight of limestone blocks' },
      { id: 'all_humans',          label: 'all humans on Earth',              value: 5.6e11,                  difficulty: 3, hint: '~8 billion people x 70 kg average' },
      { id: 'moon',                label: 'Moons',                            value: 7.342e22,                difficulty: 3, hint: "Earth's only natural satellite" },
    ],
  },

  // --- LENGTH -- base: meters -------------------------------------------------
  length: {
    label: 'Length',
    baseUnit: 'm',
    units: [
      { id: 'human_hair',          label: 'human hair widths',                value: 0.00007,                 difficulty: 3, hint: 'Average human hair is 70 microns wide' },
      { id: 'credit_card',         label: 'credit card thicknesses',          value: 0.00076,                 difficulty: 3, hint: 'Standard ISO card thickness (0.76 mm)' },
      { id: 'quarter_coin',        label: 'quarter coin diameters',           value: 0.02426,                 difficulty: 2, hint: 'A US quarter is 24.26 mm wide' },
      { id: 'dollar_bill_length',  label: 'dollar bill lengths',              value: 0.1561,                  difficulty: 2, hint: 'All US bills are 6.14 inches long' },
      { id: 'ruler',               label: 'rulers (30 cm)',                   value: 0.3,                     difficulty: 1, hint: 'Standard school ruler' },
      { id: 'school_bus_len',      label: 'school buses',                     value: 11,                      difficulty: 1, hint: 'Standard full-size school bus length' },
      { id: 'basketball_court_l',  label: 'NBA basketball courts',            value: 28.65,                   difficulty: 2, hint: '94 feet end-to-end' },
      { id: 'football_field_l',    label: 'football fields (with end zones)', value: 109.7,                   difficulty: 1, hint: '100 yards + both 10-yard end zones' },
      { id: 'statue_liberty_h',    label: 'Statues of Liberty (height)',      value: 93.15,                   difficulty: 2, hint: 'From base to torch tip' },
      { id: 'eiffel_tower_h',      label: 'Eiffel Towers (height)',           value: 330,                     difficulty: 1, hint: 'Including broadcast antenna at top' },
      { id: 'empire_state_h',      label: 'Empire State Buildings',           value: 443,                     difficulty: 2, hint: 'Roof height (not including antenna)' },
      { id: 'burj_khalifa',        label: 'Burj Khalifas',                    value: 828,                     difficulty: 2, hint: "World's tallest building (to tip)" },
      { id: 'everest',             label: 'Mount Everests',                   value: 8_849,                   difficulty: 1, hint: 'Above sea level -- the highest point on Earth' },
      { id: 'golden_gate',         label: 'Golden Gate Bridges',              value: 2_737,                   difficulty: 2, hint: 'Total length including approaches' },
      { id: 'channel_tunnel',      label: 'Channel Tunnels',                  value: 50_450,                  difficulty: 3, hint: 'Undersea rail tunnel, England to France' },
      { id: 'grand_canyon_l',      label: 'Grand Canyons (length)',           value: 446_000,                 difficulty: 2, hint: 'Length of the Colorado River through the canyon' },
      { id: 'great_wall',          label: 'Great Walls of China',             value: 21_196_000,              difficulty: 2, hint: 'All walls including branches (Ming to Han dynasties)' },
      { id: 'earth_diameter',      label: 'Earth diameters',                  value: 12_742_000,              difficulty: 2, hint: 'Mean diameter of Earth' },
      { id: 'earth_circumference', label: 'Earth circumferences',             value: 40_075_000,              difficulty: 1, hint: 'At the equator' },
      { id: 'earth_to_moon',       label: 'Earth-to-Moon distances',          value: 384_400_000,             difficulty: 2, hint: "Average (Moon's orbit is slightly elliptical)" },
      { id: 'earth_to_sun',        label: 'Earth-to-Sun distances',           value: 149_600_000_000,         difficulty: 2, hint: '1 Astronomical Unit (AU)' },
    ],
  },

  // --- TIME -- base: seconds --------------------------------------------------
  time: {
    label: 'Time',
    baseUnit: 's',
    units: [
      { id: 'blink',               label: 'blinks of an eye',                 value: 0.15,                    difficulty: 2, hint: 'Average human blink duration' },
      { id: 'heartbeat',           label: 'heartbeats (resting)',             value: 0.857,                   difficulty: 2, hint: 'At average resting heart rate (70 BPM)' },
      { id: 'minute',              label: 'minutes',                          value: 60,                      difficulty: 1, hint: '' },
      { id: 'sitcom_episode',      label: 'sitcom episodes',                  value: 1_320,                   difficulty: 1, hint: '22-minute episode (commercials stripped)' },
      { id: 'feature_film',        label: 'feature films (average)',          value: 7_200,                   difficulty: 1, hint: '2-hour runtime' },
      { id: 'school_day',          label: 'school days',                      value: 25_200,                  difficulty: 1, hint: '7-hour school day' },
      { id: 'day',                 label: 'days',                             value: 86_400,                  difficulty: 1, hint: '24 hours' },
      { id: 'week',                label: 'weeks',                            value: 604_800,                 difficulty: 1, hint: '7 days' },
      { id: 'month',               label: 'months (average)',                 value: 2_629_800,               difficulty: 1, hint: 'Average calendar month (365.25 / 12 days)' },
      { id: 'year',                label: 'years',                            value: 31_557_600,              difficulty: 1, hint: 'Julian year (365.25 days)' },
      { id: 'dog_lifespan',        label: 'dog lifespans',                    value: 409_968_000,             difficulty: 2, hint: 'Average dog lifespan (~13 years)' },
      { id: 'human_lifetime',      label: 'human lifetimes',                  value: 2_524_608_000,           difficulty: 1, hint: 'Average US life expectancy of 80 years' },
      { id: 'since_moon_landing',  label: 'time since the Moon landing',      value: 1_784_246_400,           difficulty: 2, hint: 'Apollo 11, July 20, 1969 (as of 2026)' },
      { id: 'since_independence',  label: 'time since US Independence',       value: 7_887_686_400,           difficulty: 2, hint: 'July 4, 1776 to 2026 -- 250 years' },
      { id: 'since_colosseum',     label: 'time since the Colosseum was built', value: 61_347_657_600,        difficulty: 3, hint: 'Completed ~80 AD -- nearly 2,000 years ago' },
      { id: 'since_pyramids',      label: 'time since the pyramids were built', value: 141_187_200_000,       difficulty: 3, hint: 'Great Pyramid of Giza (~2560 BC), ~4,500 years ago' },
      { id: 'since_dinosaurs',     label: 'time since dinosaurs went extinct', value: 2.082e15,               difficulty: 2, hint: 'Non-avian dinos went extinct ~66 million years ago' },
      { id: 'age_of_earth',        label: 'age of Earth',                     value: 1.419e17,                difficulty: 2, hint: 'Earth formed ~4.5 billion years ago' },
      { id: 'age_of_universe',     label: 'age of the universe',              value: 4.343e17,                difficulty: 2, hint: 'Big Bang was ~13.77 billion years ago' },
    ],
  },

  // --- SPEED -- base: m/s -----------------------------------------------------
  speed: {
    label: 'Speed',
    baseUnit: 'm/s',
    units: [
      { id: 'snail',               label: 'snail speeds',                     value: 0.001,                   difficulty: 1, hint: 'Garden snail crawling pace' },
      { id: 'walking',             label: 'average walking paces',            value: 1.4,                     difficulty: 1, hint: 'Comfortable human walking speed' },
      { id: 'cycling',             label: 'casual cycling speeds',            value: 4.5,                     difficulty: 1, hint: 'Comfortable recreational cycling' },
      { id: 'usain_bolt',          label: "Usain Bolt's top speed",           value: 12.4,                    difficulty: 1, hint: 'Peak recorded speed (44.72 km/h, Berlin 2009)' },
      { id: 'greyhound',           label: 'racing greyhound speeds',          value: 19.4,                    difficulty: 2, hint: 'Peak racing speed of a greyhound' },
      { id: 'cheetah',             label: 'cheetah top speeds',               value: 33.3,                    difficulty: 1, hint: 'Fastest land animal (120 km/h)' },
      { id: 'peregrine',           label: 'peregrine falcon dives',           value: 88.9,                    difficulty: 2, hint: 'Fastest animal in a dive (320 km/h)' },
      { id: 'f1_car',              label: 'F1 car top speeds',                value: 97.2,                    difficulty: 2, hint: 'Approximate max speed in race conditions (350 km/h)' },
      { id: 'sound',               label: 'speed of sound (sea level)',       value: 343,                     difficulty: 1, hint: 'In dry air at 20 degrees C / 68 degrees F' },
      { id: 'bullet',              label: 'rifle bullet speeds',              value: 900,                     difficulty: 2, hint: 'Typical high-powered rifle muzzle velocity' },
      { id: 'sr71',                label: 'SR-71 Blackbird speeds',           value: 981,                     difficulty: 2, hint: 'Fastest air-breathing crewed aircraft ever (Mach 3.2)' },
      { id: 'iss_orbit',           label: 'ISS orbital speeds',               value: 7_660,                   difficulty: 2, hint: 'The ISS completes one orbit every ~90 minutes' },
      { id: 'earth_sun',           label: "Earth's speed around the Sun",     value: 29_783,                  difficulty: 3, hint: 'Earth hurtles through space at ~107,000 km/h' },
      { id: 'light',               label: 'speed of light',                   value: 299_792_458,             difficulty: 1, hint: "In a vacuum -- the universe's ultimate speed limit" },
    ],
  },

  // --- DATA -- base: bytes ----------------------------------------------------
  data: {
    label: 'Data',
    baseUnit: 'bytes',
    units: [
      { id: 'text_message',        label: 'text messages',                    value: 160,                     difficulty: 1, hint: 'Standard SMS message (160 chars)' },
      { id: 'tweet',               label: 'tweets',                           value: 280,                     difficulty: 1, hint: 'Max tweet length in bytes (280 chars)' },
      { id: 'floppy_disk',         label: 'floppy disks (3.5")',              value: 1_474_560,               difficulty: 2, hint: 'The classic 1.44 MB HD floppy' },
      { id: 'mp3_song',            label: 'average MP3 songs',                value: 4_000_000,               difficulty: 1, hint: '~4 MB for a 4-minute song at 128 kbps' },
      { id: 'smartphone_photo',    label: 'smartphone photos',                value: 4_000_000,               difficulty: 1, hint: 'JPEG photo from a modern smartphone' },
      { id: 'human_genome',        label: 'human genomes',                    value: 750_000_000,             difficulty: 3, hint: '~750 MB when compressed -- 3.2 billion base pairs' },
      { id: 'cd_rom',              label: 'CD-ROMs',                          value: 700_000_000,             difficulty: 2, hint: 'Standard 700 MB CD capacity' },
      { id: 'hd_movie',            label: 'HD movies',                        value: 8_000_000_000,           difficulty: 1, hint: 'Average 1080p Blu-ray rip (8 GB)' },
      { id: '4k_movie',            label: '4K movies',                        value: 100_000_000_000,         difficulty: 2, hint: 'Uncompressed 4K feature film (~100 GB)' },
      { id: 'wikipedia',           label: 'full Wikipedias (text)',           value: 22_000_000_000,          difficulty: 2, hint: 'All English Wikipedia articles, text only (~22 GB)' },
      { id: 'library_of_congress', label: 'Libraries of Congress',            value: 10_000_000_000_000,      difficulty: 2, hint: "The LC's digitized collection (~10 TB)" },
      { id: 'all_books',           label: 'all books ever written',           value: 130_000_000_000_000,     difficulty: 3, hint: 'Google estimated ~130 million unique books exist' },
      { id: 'daily_internet',      label: 'daily global internet traffic',    value: 5e17,                    difficulty: 3, hint: 'Estimated ~500 petabytes of data transferred daily (2024)' },
    ],
  },

  // --- MONEY -- base: USD -----------------------------------------------------
  money: {
    label: 'Money',
    baseUnit: 'USD',
    units: [
      { id: 'penny',               label: 'US pennies',                       value: 0.01,                    difficulty: 1, hint: '' },
      { id: 'quarter',             label: 'US quarters',                      value: 0.25,                    difficulty: 1, hint: '' },
      { id: 'dollar',              label: 'dollar bills',                     value: 1,                       difficulty: 1, hint: '' },
      { id: 'big_mac',             label: 'Big Macs',                         value: 5.58,                    difficulty: 1, hint: 'Average US price (2024)' },
      { id: 'starbucks_latte',     label: 'Starbucks lattes',                 value: 6.50,                    difficulty: 1, hint: 'Grande latte, average US price (2024)' },
      { id: 'movie_ticket',        label: 'US movie tickets',                 value: 13,                      difficulty: 1, hint: 'Average US movie ticket price (2024)' },
      { id: 'minimum_wage_hour',   label: 'federal minimum wage hours',       value: 7.25,                    difficulty: 2, hint: 'US federal minimum wage (2024)' },
      { id: 'median_wage_hour',    label: 'median US wage hours',             value: 23,                      difficulty: 2, hint: 'Median hourly earnings in the US (2024)' },
      { id: 'median_salary',       label: 'median US annual salaries',        value: 59_228,                  difficulty: 2, hint: 'US median household income (2024)' },
      { id: 'median_home',         label: 'median US home prices',            value: 412_000,                 difficulty: 2, hint: 'National median existing home price (2024)' },
      { id: 'ferrari',             label: 'Ferrari 488s',                     value: 250_000,                 difficulty: 2, hint: 'Base price of a Ferrari 488 GTB' },
      { id: 'super_bowl_ad',       label: 'Super Bowl 30s ads',               value: 7_000_000,               difficulty: 2, hint: 'Cost of a 30-second spot in Super Bowl LVIII (2024)' },
      { id: 'amazon_day_revenue',  label: "Amazon's daily revenue",           value: 1_290_000_000,           difficulty: 3, hint: 'Amazon earns ~$1.29B per day (2024 annual revenue / 365)' },
      { id: 'bezos_net_worth',     label: 'Jeff Bezos net worths',            value: 2e11,                    difficulty: 2, hint: '~$200 billion as of mid-2024' },
      { id: 'us_national_debt',    label: 'US national debts',                value: 3.6e13,                  difficulty: 2, hint: '~$36 trillion as of 2024' },
      { id: 'us_gdp',              label: 'US annual GDPs',                   value: 2.77e13,                 difficulty: 2, hint: 'Nominal GDP of the United States (2023)' },
      { id: 'global_gdp',          label: 'global annual GDPs',               value: 1.05e14,                 difficulty: 3, hint: 'Total global economic output (2023)' },
    ],
  },

  // --- ENERGY -- base: joules -------------------------------------------------
  energy: {
    label: 'Energy',
    baseUnit: 'J',
    units: [
      { id: 'match',               label: 'burning matches',                  value: 1_000,                   difficulty: 2, hint: 'Energy released by a single match head' },
      { id: 'aa_battery',          label: 'AA batteries',                     value: 15_840,                  difficulty: 2, hint: 'Typical alkaline AA (4.4 Wh)' },
      { id: 'food_calorie',        label: 'food calories (kcal)',             value: 4_184,                   difficulty: 2, hint: '1 dietary Calorie = 4,184 joules' },
      { id: 'daily_food',          label: 'daily human food intake',          value: 8_368_000,               difficulty: 2, hint: '2,000 kcal recommended daily intake' },
      { id: 'tnt_1kg',             label: 'kilograms of TNT',                 value: 4_184_000,               difficulty: 2, hint: 'Energy equivalent of 1 kg of TNT' },
      { id: 'lightning_bolt',      label: 'lightning bolts',                  value: 1_000_000_000,           difficulty: 2, hint: 'Approximate energy in a single lightning strike (~1 GJ)' },
      { id: 'house_day',           label: "average US home's daily energy use", value: 100_800_000,           difficulty: 3, hint: '~28 kWh/day for a typical US household' },
      { id: 'hiroshima_bomb',      label: 'Hiroshima atomic bombs',           value: 6.3e13,                  difficulty: 2, hint: 'Little Boy yield (~15 kilotons of TNT)' },
      { id: 'hurricane_day',       label: 'hurricanes (per day)',             value: 5.2e19,                  difficulty: 3, hint: 'Energy released by an average hurricane each day' },
      { id: 'sun_per_second',      label: "Sun's energy output (per second)", value: 3.828e26,                difficulty: 3, hint: 'The Sun emits 3.828 x 10^26 watts continuously' },
    ],
  },

  // --- POPULATION -- base: people ---------------------------------------------
  population: {
    label: 'Population',
    baseUnit: 'people',
    units: [
      { id: 'school_bus_pop',      label: 'school buses (of people)',         value: 48,                      difficulty: 1, hint: 'Standard school bus passenger capacity' },
      { id: '747_passengers',      label: 'Boeing 747 passenger loads',       value: 416,                     difficulty: 2, hint: 'Typical 3-class 747-400 configuration' },
      { id: 'small_town',          label: 'small US towns',                   value: 5_000,                   difficulty: 2, hint: 'A typical small American town' },
      { id: 'nfl_stadium',         label: 'avg NFL stadiums (sold out)',       value: 68_000,                  difficulty: 1, hint: 'Average capacity of an NFL stadium' },
      { id: 'wembley',             label: 'Wembley Stadiums (sold out)',       value: 90_000,                  difficulty: 2, hint: "UK's national football stadium" },
      { id: 'city_chicago',        label: 'City of Chicagos',                 value: 2_700_000,               difficulty: 2, hint: 'Population of Chicago proper' },
      { id: 'nyc',                 label: 'New York Cities',                  value: 8_335_000,               difficulty: 1, hint: 'Population of NYC (city proper)' },
      { id: 'california',          label: 'Californias',                      value: 39_000_000,              difficulty: 1, hint: 'Most populous US state' },
      { id: 'united_states_pop',   label: 'United States (population)',       value: 335_000_000,             difficulty: 1, hint: '~335 million people (2024)' },
      { id: 'europe_pop',          label: 'Europe (population)',              value: 748_000_000,             difficulty: 2, hint: 'Population of all of Europe' },
      { id: 'china',               label: 'Chinas',                           value: 1_400_000_000,           difficulty: 1, hint: 'Most populous country on Earth' },
      { id: 'india',               label: 'Indias',                           value: 1_429_000_000,           difficulty: 1, hint: 'Surpassed China as most populous in 2023' },
      { id: 'earth_pop',           label: 'Earths (all humans)',              value: 8_100_000_000,           difficulty: 1, hint: 'Total global population (2024)' },
    ],
  },
};

// --- PRESETS ------------------------------------------------------------------
// Famous real-world quantities -- seed the tool and drive game questions.
// value is in the category's baseUnit.

export const PRESETS = [
  // Area
  { id: 'us_area',           label: 'US land area',                     category: 'area',       value: 9_833_517_000_000,       description: 'Total area of the United States' },
  { id: 'amazon_area',       label: 'Amazon rainforest',                category: 'area',       value: 5_500_000_000_000,       description: 'Largest tropical rainforest on Earth' },
  { id: 'pacific_surface',   label: 'Pacific Ocean (surface)',          category: 'area',       value: 165_250_000_000_000,     description: 'Surface area of the Pacific Ocean' },
  { id: 'central_park_a',    label: 'Central Park, NYC',                category: 'area',       value: 3_410_000,               description: '843 acres in Midtown Manhattan' },
  { id: 'disney_world',      label: 'Disney World total resort',        category: 'area',       value: 110_000_000,             description: 'The entire Walt Disney World property' },

  // Volume
  { id: 'pacific_vol',       label: 'Pacific Ocean (volume)',           category: 'volume',     value: 7.1e17,                  description: 'Total volume of the Pacific Ocean' },
  { id: 'earth_oceans_vol',  label: "All of Earth's oceans",           category: 'volume',     value: 1.335e18,                description: 'Total volume of all ocean water on Earth' },
  { id: 'lake_superior_v',   label: 'Lake Superior',                    category: 'volume',     value: 12_100_000_000_000_000,  description: 'Volume of the largest Great Lake' },
  { id: 'human_blood',       label: 'blood in your body',              category: 'volume',     value: 5,                       description: 'Average adult has about 5 liters of blood' },
  { id: 'human_lungs',       label: 'human lung capacity',             category: 'volume',     value: 6,                       description: 'Total lung capacity of an average adult' },

  // Weight
  { id: 'all_humans_w',      label: 'all humans on Earth (combined)',   category: 'weight',     value: 5.6e11,                  description: '~8 billion people at ~70 kg each' },
  { id: 'great_pyramid_w',   label: 'Great Pyramid of Giza',           category: 'weight',     value: 5_900_000_000,           description: 'Estimated weight of all limestone blocks' },
  { id: 'all_ants',          label: 'all ants on Earth',               category: 'weight',     value: 2e13,                    description: 'Total biomass of all ant colonies (~20 trillion kg)' },
  { id: 'moon_w',            label: "Earth's Moon",                    category: 'weight',     value: 7.342e22,                description: 'Mass of the Moon' },
  { id: 'iss_w',             label: 'International Space Station',     category: 'weight',     value: 419_725,                 description: 'Total mass of the ISS in orbit' },

  // Length
  { id: 'earth_circum',      label: "Earth's circumference",           category: 'length',     value: 40_075_000,              description: 'Distance around Earth at the equator' },
  { id: 'moon_dist',         label: 'Distance to the Moon',            category: 'length',     value: 384_400_000,             description: 'Average Earth-Moon distance' },
  { id: 'all_us_roads',      label: 'All US roads laid end-to-end',    category: 'length',     value: 6_800_000_000,           description: 'Total length of all US public roads' },
  { id: 'dna_in_body',       label: 'DNA in all your cells (uncoiled)',category: 'length',     value: 7.4e16,                  description: '~2m per cell x 37 trillion cells = ~74 trillion km' },
  { id: 'great_wall_l',      label: 'Great Wall of China',             category: 'length',     value: 21_196_000,              description: 'Total length of all wall sections' },

  // Time
  { id: 'universe_age',      label: 'Age of the universe',             category: 'time',       value: 4.343e17,                description: '13.77 billion years since the Big Bang' },
  { id: 'earth_age',         label: 'Age of the Earth',                category: 'time',       value: 1.419e17,                description: 'Earth formed ~4.5 billion years ago' },
  { id: 'dino_extinct',      label: 'Time since dinosaurs went extinct',category: 'time',      value: 2.082e15,                description: '~66 million years ago, end-Cretaceous event' },
  { id: 'human_lifetime_t',  label: 'Average human lifetime',          category: 'time',       value: 2_524_608_000,           description: '80-year lifespan in seconds' },

  // Speed
  { id: 'earth_orbit_speed', label: "Earth's orbital speed",           category: 'speed',      value: 29_783,                  description: 'How fast Earth travels around the Sun' },
  { id: 'light_speed',       label: 'Speed of light',                  category: 'speed',      value: 299_792_458,             description: 'The universal speed limit (in vacuum)' },
  { id: 'iss_speed',         label: 'ISS orbital speed',               category: 'speed',      value: 7_660,                   description: 'The space station travels at ~7.7 km/s' },

  // Data
  { id: 'loc',               label: 'Library of Congress',             category: 'data',       value: 10_000_000_000_000,      description: "Estimated size of the LC's digitized collection" },
  { id: 'daily_web',         label: 'Daily global internet traffic',   category: 'data',       value: 5e17,                    description: '~500 petabytes transferred per day (2024)' },
  { id: 'human_brain_data',  label: "Human brain's estimated storage", category: 'data',       value: 2.5e15,                  description: 'Estimated ~2.5 petabytes of neural storage' },

  // Money
  { id: 'us_debt',           label: 'US national debt',                category: 'money',      value: 3.6e13,                  description: '~$36 trillion as of 2024' },
  { id: 'bezos',             label: 'Jeff Bezos net worth',            category: 'money',      value: 2e11,                    description: '~$200 billion as of mid-2024' },
  { id: 'us_gdp_p',          label: 'US annual GDP',                   category: 'money',      value: 2.77e13,                 description: 'US nominal GDP (2023)' },
  { id: 'global_gold',       label: 'All gold ever mined',             category: 'money',      value: 1.3e13,                  description: 'Value of all ~200,000 tonnes of gold ever extracted' },

  // Energy
  { id: 'hiroshima',         label: 'Hiroshima bomb',                  category: 'energy',     value: 6.3e13,                  description: 'Energy released by the Little Boy atomic bomb' },
  { id: 'sun_second',        label: "Sun's output in 1 second",        category: 'energy',     value: 3.828e26,                description: 'The Sun emits ~3.8 x 10^26 joules every second' },
  { id: 'lightning',         label: 'A lightning bolt',                category: 'energy',     value: 1e9,                     description: 'Approximate energy in one lightning strike' },

  // Population
  { id: 'earth_pop_p',       label: 'World population',                category: 'population', value: 8_100_000_000,           description: 'All humans alive on Earth today (~2024)' },
  { id: 'woodstock',         label: 'Woodstock 1969 attendance',       category: 'population', value: 400_000,                 description: '~400,000 people attended the iconic festival' },
  { id: 'roman_empire_pop',  label: 'Peak Roman Empire population',    category: 'population', value: 70_000_000,              description: 'Estimated population at its height (~2nd century AD)' },
];

// --- GAME CONFIG --------------------------------------------------------------

export const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Normal', 3: 'Hard' };

export const GAME_DIFFICULTY_POOL = {
  easy:   [1],
  normal: [1, 2],
  hard:   [1, 2, 3],
};

// Minimum ratio between two things for a valid "Higher or Lower" pairing.
// Keeps questions from being too ambiguous (ratio near 1).
export const MIN_PAIR_RATIO = 3;
