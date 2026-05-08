const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'data', 'manifest.json');

// A massive dictionary of cinematic RDR2-style titles to enrich the manifest
const THEMATIC_TITLES = [
  "Golden Hour in Lemoyne", "Mist Over Owanjila", "Scarlett Meadows Glow", "Grizzlies East Peak",
  "Dusk in Bayou Nwa", "Heartlands Morning Mist", "The Silence of Ambarino", "Big Valley Vista",
  "Saint Denis Nightfall", "Roanoke Ridge Shadows", "Blue Water Marsh Haze", "Tall Trees Silence",
  "Great Plains Horizon", "New Austin Desert Bloom", "Cumberland Forest Pines", "Dakota River Bend",
  "Flat Iron Lake Calm", "Elysian Pool Reflection", "Spider Gorge Frost", "Mount Hagen Crest",
  "Bacchus Bridge Heights", "Caliban's Seat Outlook", "Horseshoe Overlook Peace", "Clemens Point Sunset",
  "Shady Belle Remnants", "Beaver Hollow Gloom", "Annesburg Industrial Glow", "Valentine Muddy Streets",
  "Rhodes Red Soil", "Strawberry Timber Charm", "Blackwater Modernity", "Emerald Ranch Serenity",
  "Colter's Frozen Legacy", "Adler Ranch Ruins", "Grizzlies West Chill", "Lagras Swamp Lights",
  "Braithwaite Manor Alleys", "Caliga Hall Fields", "Van Horn Trading Post", "Butcher Creek Mystery",
  "Manito Glade Isolation", "O'Creagh's Run Blue", "Moonstone Pond Stillness", "Fairvale Shanty View",
  "Loft Observation", "Brandywine Drop Cascade", "Willard's Rest Peace", "Kamassa River Flow",
  "Copperhead Landing Mist", "Lakay Haunted Quiet", "MacFarlane's Ranch Dust", "Armadillo's Heat",
  "Tumbleweed Ghost Town", "Pike's Basin Depths", "Gaptooth Ridge Aridity", "Rio Bravo Cliffs",
  "Cholla Springs Cacti", "Hennigan's Stead Grasslands", "Quakers Cove Tide", "Aurora Basin Ice",
  "Cochinay Mountain Air", "Nekoti Rock Peak", "Montana River Crossing", "Upper Montana Flow",
  "Painted Sky Crossing", "Dewberry Creek Dryness", "Southfield Flats Sun", "Bolger Glade History",
  "Old Harry Fen Shadows", "Catfish Jacksons Shore", "Radley's Pasture View", "Gray's Tobacco Fields",
  "Mattock Pond Calm", "Ringneck Creek Stones", "Face in the Cliff", "Window Rock Spirit",
  "Whinyard Strait Rapids", "Donner Falls Roar", "Calumet Ravine Colors", "Wapiti Respite",
  "Owanjila Dam Engineering", "Montos Rest Vista", "Diablo Ridge Heights", "Riggs Station Rails",
  "Wallace Station Rest", "Bard's Crossing Span", "Flatneck Station Dust", "Lone Mule Stead",
  "Beecher's Hope Future", "Tall Trees Whispers", "Manzanita Post Pines", "Tanner's Reach View",
  "Bear Claw Camp Ruins", "Stillwater Creek Bayou", "Thieves Landing Fog", "Manteca Falls Spray",
  "Scratching Post Outpost", "Benedict Point Rails", "Solomon's Folly Dust", "Fort Mercer Walls",
  "Mercer Station Heat", "Plainview Oil Rigs", "Rio del Lobo Reflections", "Two Rocks Formation",
  "Jorge's Gap Mystery", "Rathskeller Fork Dust", "Gaptooth Breach Depths"
];

function applyPatch() {
  console.log('--- APPLYING ANTIGRAVITY DATA PATCH ---');
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('ERROR: manifest.json not found!');
    return;
  }

  let manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`Patching ${manifest.length} images...`);

  manifest.forEach((entry, idx) => {
    // Only patch if title is generic
    if (entry.title.includes('Landscape from') || entry.title === 'Landscape') {
      // Pick a title from the dictionary, using a consistent but shuffled-looking index
      const titleIndex = (idx * 7) % THEMATIC_TITLES.length;
      entry.title = THEMATIC_TITLES[titleIndex];
    }
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('✅ SUCCESS! Your manifest is now enriched with cinematic titles.');
  console.log('No API keys, no limits. Enjoy the scenery!');
}

applyPatch();
