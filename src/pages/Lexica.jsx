import { useState, useEffect, useRef } from 'react';
import { Flower } from 'lucide-react';
import './Lexica.css';

// Curated 62-word database of interesting, commonly mispronounced, and aesthetic English words.
const WORD_DATABASE = [
  {
    word: 'Synecdoche',
    phonic: 'sin-EK-duh-kee',
    ipa: '/sɪˈnɛkdəki/',
    definition: 'A figure of speech in which a part is made to represent the whole or vice versa.',
    etymology: 'From Greek "synekdokhe", meaning "shared understanding". An example is saying "nice wheels" to refer to a car.',
    phonicDistractors: ['sin-ek-DOHSH', 'sin-EK-doh-chee', 'sy-NEK-dohsh']
  },
  {
    word: 'Epitome',
    phonic: 'ih-PIT-uh-mee',
    ipa: '/ɪˈpɪtəmi/',
    definition: 'A person or thing that is a perfect example of a particular quality or type.',
    etymology: 'From Greek "epitome", from "epitemnein" meaning "cut short". Commonly mispronounced as "epi-tome".',
    phonicDistractors: ['EP-ih-tohm', 'ih-PY-tohm', 'EP-ih-tuh-mee']
  },
  {
    word: 'Worcestershire',
    phonic: 'WOOS-ter-sheer',
    ipa: '/ˈwʊstəʃə/',
    definition: 'A pungent savory condiment sauce originating in England.',
    etymology: 'Named after the county of Worcestershire in England. The "rece" syllable is entirely silent!',
    phonicDistractors: ['war-CHEST-er-shyre', 'WOOS-ter-shyre', 'wor-CHEST-er-sheer']
  },
  {
    word: 'Colonel',
    phonic: 'KER-nel',
    ipa: '/ˈkɜːnəl/',
    definition: 'An army officer of high rank, in most armies above lieutenant colonel and below brigadier general.',
    etymology: 'Derived from French "coronel", which was later adapted to English phonics as "kernel" while retaining Italian spelling.',
    phonicDistractors: ['koh-loh-NEL', 'col-uh-NEL', 'KER-nul-ee']
  },
  {
    word: 'Anemone',
    phonic: 'uh-NEM-uh-nee',
    ipa: '/əˈnɛməni/',
    definition: 'A plant of the buttercup family with brightly colored flowers, or a sea creature with tentacles.',
    etymology: 'From Greek "anemone", meaning "wind flower". Often misspoken by swapping the "m" and "n" sounds.',
    phonicDistractors: ['AN-uh-mohn', 'uh-NE-mohn-ee', 'an-uh-MOHN-ee']
  },
  {
    word: 'Choir',
    phonic: 'KWY-er',
    ipa: '/ˈkwaɪə/',
    definition: 'An organized group of singers, typically one that takes part in church services or performs in public.',
    etymology: 'From Old French "cuer", from Latin "chorus". The spelling was classicalized, but the pronunciation remained "quire".',
    phonicDistractors: ['CHOY-er', 'ko-EER', 'KWY-re']
  },
  {
    word: 'Cache',
    phonic: 'KASH',
    ipa: '/kæʃ/',
    definition: 'A hidden storage space, or auxiliary memory from which high-speed retrieval is possible.',
    etymology: 'From French "cacher", meaning "to hide". Commonly mispronounced as "ca-shay" (which is cachet!).',
    phonicDistractors: ['ka-SHAY', 'KATCH', 'ka-SHEE']
  },
  {
    word: 'Subtle',
    phonic: 'SUT-el',
    ipa: '/ˈsʌtəl/',
    definition: 'So delicate or precise as to be difficult to analyze or describe.',
    etymology: 'From Latin "subtilis" (fine-woven). The letter "b" is completely silent in modern English.',
    phonicDistractors: ['SUB-tel', 'SUB-tul', 'SUT-lee']
  },
  {
    word: 'Oubliette',
    phonic: 'oo-blee-ET',
    ipa: '/ˌuːbliˈɛt/',
    definition: 'A secret dungeon with a trapdoor in its ceiling as the only means of entrance or exit.',
    etymology: 'From French "oublier", meaning "to forget" — literally a place where prisoners are thrown to be forgotten.',
    phonicDistractors: ['ow-blee-ET', 'oo-BLY-et', 'AW-blee-et']
  },
  {
    word: 'Lichen',
    phonic: 'LY-ken',
    ipa: '/ˈlaɪkən/',
    definition: 'A composite organism consisting of a fungus and an alga in a symbiotic relationship.',
    etymology: 'From Greek "leikhen", meaning "scab" or "eruption". Pronounced exactly like the word "liken".',
    phonicDistractors: ['LITCH-en', 'LIK-en', 'LY-chen']
  },
  {
    word: 'Mischievous',
    phonic: 'MIS-chih-vus',
    ipa: '/ˈmɪstʃɪvəs/',
    definition: 'Causing or showing a fondness for causing trouble in a playful way.',
    etymology: 'From Old French "meschief". Frequently mispronounced with an extra syllable as "mis-chee-vee-us".',
    phonicDistractors: ['mis-CHEE-vee-us', 'mis-CHEE-vus', 'MIS-chee-vee-us']
  },
  {
    word: 'Quinoa',
    phonic: 'KEEN-wah',
    ipa: '/ˈkiːnwɑː/',
    definition: 'A goosefoot plant cultivated for its edible tiny seeds, which are high in protein.',
    etymology: 'From Quechua "kinwa". Cultivated originally in the Andes, now a popular global superfood.',
    phonicDistractors: ['kwin-OH-ah', 'keen-OH-ah', 'KWIN-wah']
  },
  {
    word: 'Hyperbole',
    phonic: 'hy-PER-buh-lee',
    ipa: '/haɪˈpɜːbəli/',
    definition: 'Exaggerated statements or claims not meant to be taken literally.',
    etymology: 'From Greek "hyperbole", meaning "excess" or "throwing beyond".',
    phonicDistractors: ['HY-per-bohl', 'hy-PER-bohl', 'hy-per-BOH-lee']
  },
  {
    word: 'Scherzo',
    phonic: 'SKER-tsoh',
    ipa: '/ˈskɛətsəʊ/',
    definition: 'A vigorous, light, or playful musical composition, typically comprising a movement in a symphony.',
    etymology: 'Italian word meaning "joke" or "playful game". The "sch" is pronounced as a hard "sk".',
    phonicDistractors: ['SHER-zoh', 'SKER-zoh', 'SHER-tsoh']
  },
  {
    word: 'Gethsemane',
    phonic: 'geth-SEM-uh-nee',
    ipa: '/ɡɛθˈsɛməni/',
    definition: 'A scene of great mental or spiritual suffering, originally an olive grove garden near Jerusalem.',
    etymology: 'From Aramaic "gath shemani", meaning "oil press". Famous from biblical accounts.',
    phonicDistractors: ['geth-suh-MAHN-ee', 'geth-suh-MEEN', 'geth-suh-MAYN']
  },
  {
    word: 'Solder',
    phonic: 'SOD-er',
    ipa: '/ˈsəʊldə/',
    definition: 'A fusible metal alloy used to join together metal workpieces.',
    etymology: 'From Latin "solidare", meaning "to make solid". In North American English, the "l" is completely silent.',
    phonicDistractors: ['SOL-der', 'SOH-der', 'SOW-der']
  },
  {
    word: 'Banal',
    phonic: 'buh-NAHL',
    ipa: '/bəˈnɑːl/',
    definition: 'So lacking in originality as to be obvious and boring.',
    etymology: 'From Old French "banal" (belonging to a feudal lord, hence common to all). It rhymes with "canal".',
    phonicDistractors: ['BAY-nul', 'buh-NAL', 'ban-AL']
  },
  {
    word: 'Cavalry',
    phonic: 'KAV-ul-ree',
    ipa: '/ˈkævəlri/',
    definition: 'Soldiers who fought on horseback in past eras, or modern armored vehicle units.',
    etymology: 'From French "cavalerie". Commonly swapped in speech with "Calvary" (the biblical hill).',
    phonicDistractors: ['kuh-VAL-ree', 'kuh-VAHL-ree', 'kav-AL-ree']
  },
  {
    word: 'Segue',
    phonic: 'SEG-way',
    ipa: '/ˈsɛɡweɪ/',
    definition: 'Move without interruption from one song, melody, or scene to another.',
    etymology: 'Italian, literally meaning "it follows". Often mispronounced as "seeg" or confused with the Segway scooter.',
    phonicDistractors: ['SEG-yoo', 'SEEG', 'seg-WAY']
  },
  {
    word: 'Ignominious',
    phonic: 'ig-nuh-MIN-ee-us',
    ipa: '/ˌɪɡnəˈmɪnɪəs/',
    definition: 'Deserving or causing public disgrace, shame, or humiliation.',
    etymology: 'From Latin "ignominia", meaning "loss of name" or "disgrace".',
    phonicDistractors: ['ig-NOM-ih-nus', 'ig-nuh-MIN-us', 'ig-noh-MEEN-yus']
  },
  {
    word: 'Profligate',
    phonic: 'PROF-lih-gut',
    ipa: '/ˈprɒflɪɡət/',
    definition: 'Recklessly extravagant or wasteful in the use of resources.',
    etymology: 'From Latin "profligatus", meaning "ruined" or "cast down". The final syllable rhymes with "but".',
    phonicDistractors: ['proh-FLIG-ayt', 'proh-FLIH-gut', 'prof-lih-GAYT']
  },
  {
    word: 'Tergiversation',
    phonic: 'ter-jiv-er-SAY-shun',
    ipa: '/ˌtɜːdʒɪvɜːˈseɪʃən/',
    definition: 'Evasion of straightforward action or clear-cut statement; equivocation or desertion.',
    etymology: 'From Latin "tergiversari", meaning "to turn one\'s back". A fantastic high-end synonym for dodging a question.',
    phonicDistractors: ['ter-gih-ver-SAY-shun', 'ter-jiv-er-SAY-shun', 'ter-gih-vur-SAY-shun']
  },
  {
    word: 'Sesquipedalian',
    phonic: 'ses-kwi-pih-DAY-lee-un',
    ipa: '/ˌsɛskwɪpɪˈdeɪlɪən/',
    definition: 'Very long (of a word), or characterized by using very long, formal words.',
    etymology: 'From Latin "sesquipedalis", literally meaning "a foot and a half long".',
    phonicDistractors: ['ses-kwi-ped-AHL-yun', 'ses-kwi-pih-DAH-lee-un', 'ses-kwip-eh-DAY-lee-un']
  },
  {
    word: 'Acquiesce',
    phonic: 'ak-wee-ES',
    ipa: '/ˌækwiˈɛs/',
    definition: 'Accept something reluctantly but without protest.',
    etymology: 'From Latin "acquiescere", from "quiescere" meaning "to rest".',
    phonicDistractors: ['ak-wee-EKS', 'uh-KWEE-ess', 'ak-ee-ESS']
  },
  {
    word: 'Chicanery',
    phonic: 'shih-KAY-ner-ee',
    ipa: '/ʃɪˈkeɪnəri/',
    definition: 'The use of trickery or sophistry to achieve a political, financial, or legal purpose.',
    etymology: 'From French "chicaner", meaning "to quibble". The "ch" has a soft French "sh" sound.',
    phonicDistractors: ['tchik-AY-ner-ee', 'shih-KAN-er-ee', 'tchik-AN-er-ee']
  },
  {
    word: 'Dilettante',
    phonic: 'dih-luh-TAHNT',
    ipa: '/ˌdɪlɪˈtænti/',
    definition: 'A person who cultivates an area of interest, such as the arts, without real commitment or knowledge.',
    etymology: 'From Italian "dilettare", meaning "to delight". The final "te" is pronounced "tahnt" or softly as "tee".',
    phonicDistractors: ['dih-luh-TANT', 'dy-let-AHNT', 'dih-luh-TAN-tee']
  },
  {
    word: 'Sovereign',
    phonic: 'SOV-rin',
    ipa: '/ˈsɒvrɪn/',
    definition: 'A supreme ruler, especially a monarch, or possessing supreme or ultimate power.',
    etymology: 'From Old French "soverain". The spelling was influenced by "reign", but the "g" is entirely silent.',
    phonicDistractors: ['sov-er-AYN', 'suh-VER-in', 'soh-VRAYN']
  },
  {
    word: 'Imbroglio',
    phonic: 'im-BROHL-yoh',
    ipa: '/ɪmˈbrəʊlɪəʊ/',
    definition: 'An extremely confused, complicated, or embarrassing situation.',
    etymology: 'From Italian "imbrogliare", meaning "to entangle". The letter "g" is completely silent.',
    phonicDistractors: ['im-brog-LEE-oh', 'im-BROH-lee-oh', 'im-BROG-yoh']
  },
  {
    word: 'Bourgeois',
    phonic: 'boor-ZHWAH',
    ipa: '/ˈbʊəʒwɑː/',
    definition: 'Belonging to or characteristic of the middle class, typically with reference to its materialistic values.',
    etymology: 'From French "bourg", meaning "town". Often misspoken or spelled incorrectly in gaming contexts.',
    phonicDistractors: ['boor-GOYS', 'burg-OYS', 'boor-ZHWAH-zee']
  },
  {
    word: 'Dengue',
    phonic: 'DENG-gee',
    ipa: '/ˈdɛŋɡi/',
    definition: 'A debilitating tropical viral disease transmitted by mosquitoes, causing severe joint pain.',
    etymology: 'Probably from Swahili "dinga", meaning "seizure" or "cramp". Pronounced with a hard "g".',
    phonicDistractors: ['deng-GWAY', 'deng-YOO', 'DENG-yoo']
  },
  {
    word: 'Yacht',
    phonic: 'YOT',
    ipa: '/jɒt/',
    definition: 'A medium-sized sailboat or motorboat equipped for cruising or racing.',
    etymology: 'From Dutch "jacht", meaning "chase" or "hunt". The "ch" is completely silent in English.',
    phonicDistractors: ['YATCH', 'YAT', 'YOT-ee']
  },
  {
    word: 'Faux Pas',
    phonic: 'foh PAH',
    ipa: '/ˌfəʊ ˈpɑː/',
    definition: 'An embarrassing or tactless act or remark in a social situation; a social slip-up.',
    etymology: 'French phrase literally translating to "false step". The ending consonants "x" and "s" are silent.',
    phonicDistractors: ['fawks PAS', 'foh PAS', 'fawks PAH']
  },
  {
    word: 'Draconian',
    phonic: 'dray-KOH-nee-un',
    ipa: '/drəˈkəʊnɪən/',
    definition: 'Excessively harsh, severe, or cruel laws or rules.',
    etymology: 'Named after Draco, an ancient Athenian scribe who created laws carrying the death penalty for minor offenses.',
    phonicDistractors: ['drah-KOHN-yun', 'drak-OH-nee-un', 'dray-KOHN-yun']
  },
  {
    word: 'Halcyon',
    phonic: 'HAL-see-un',
    ipa: '/ˈhælsɪən/',
    definition: 'Denoting a period of time in the past that was idyllically happy, peaceful, and prosperous.',
    etymology: 'From Greek "alkuon", a mythical kingfisher bird that calmed the winter seas to hatch its eggs.',
    phonicDistractors: ['HAL-ky-un', 'hawl-SEE-un', 'HAL-see-ohn']
  },
  {
    word: 'Chameleon',
    phonic: 'kuh-MEEL-yun',
    ipa: '/kəˈmiːlɪən/',
    definition: 'A lizard capable of changing color, or a person who changes their behavior to suit the situation.',
    etymology: 'From Greek "khamaileon", meaning "ground lion". The "ch" has a hard "k" sound.',
    phonicDistractors: ['tcham-el-EON', 'kuh-MAYL-yun', 'tcham-EEL-yun']
  },
  {
    word: 'Heir',
    phonic: 'AIR',
    ipa: '/eə/',
    definition: 'A person legally entitled to the property or rank of another on that person\'s death.',
    etymology: 'From Latin "heres". Pronounced exactly like the word "air" or "hare". The "h" is completely silent.',
    phonicDistractors: ['HAIR', 'AY-ur', 'HEER']
  },
  {
    word: 'Hegemony',
    phonic: 'hih-JEM-uh-nee',
    ipa: '/hɪˈɡɛməni/',
    definition: 'Leadership or dominance, especially by one state or country over others.',
    etymology: 'From Greek "hegemonia", meaning "leader" or "authority".',
    phonicDistractors: ['hedg-eh-MOHN-ee', 'heg-uh-MOHN-ee', 'hih-GEE-moh-nee']
  },
  {
    word: 'Pharaoh',
    phonic: 'FAIR-oh',
    ipa: '/ˈfeərəʊ/',
    definition: 'A ruler in ancient Egypt.',
    etymology: 'From Hebrew "par\'oh", from Egyptian "pr-\'3", meaning "great house". Pronounced "fair-oh".',
    phonicDistractors: ['FAH-rah-oh', 'fay-RAH-oh', 'fair-AH-oh']
  },
  {
    word: 'Victual',
    phonic: 'VIT-el',
    ipa: '/ˈvɪtəl/',
    definition: 'Food or provisions, typically as prepared for consumption.',
    etymology: 'From Latin "victus" (living/food). Although spelled with a "c" and "t", it is pronounced exactly like "vittle".',
    phonicDistractors: ['VIK-choo-ul', 'vik-TWAHL', 'vit-TWAHL']
  },
  {
    word: 'Espresso',
    phonic: 'eh-SPRES-oh',
    ipa: '/ɛˈsprɛsəʊ/',
    definition: 'Strong black coffee made by forcing steam through finely-ground dark coffee beans.',
    etymology: 'From Italian "espresso", meaning "pressed out". Frequently mispronounced with an "x" sound.',
    phonicDistractors: ['ex-PRES-oh', 'es-PRES-oh', 'ehx-SPRES-oh']
  },
  {
    word: 'Gnocchi',
    phonic: 'NYOK-ee',
    ipa: '/ˈnjɒki/',
    definition: 'Small Italian dumplings made from potato, semolina, or wheat flour.',
    etymology: 'From Italian "gnocco", meaning "knuckle" or "knot". The "gn" carries a soft nasal "ny" sound.',
    phonicDistractors: ['nock-EE', 'gah-NOCK-ee', 'noh-CHEE']
  },
  {
    word: 'Isthmus',
    phonic: 'IS-mus',
    ipa: '/ˈɪsməs/',
    definition: 'A narrow strip of land with sea on either side, forming a link between two larger areas of land.',
    etymology: 'From Greek "isthmos". The "th" is completely silent in standard modern pronunciation.',
    phonicDistractors: ['IST-mus', 'is-THU-mus', 'is-TH-mus']
  },
  {
    word: 'Mauve',
    phonic: 'MOHV',
    ipa: '/məʊv/',
    definition: 'A pale purple, lilac, or violet color.',
    etymology: 'From French "mauve", referring to the mallow flower. In English, it rhymes with "grove".',
    phonicDistractors: ['MAWV', 'MOH-vee', 'MAH-ve']
  },
  {
    word: 'Niche',
    phonic: 'NEESH',
    ipa: '/niːʃ/',
    definition: 'A comfortable or suitable position in life or employment, or a shallow recess in a wall.',
    etymology: 'From French "nicher", meaning "to make a nest". Commonly mispronounced as "nitch" in North America.',
    phonicDistractors: ['NITCH', 'NEESH-ee', 'NEK']
  },
  {
    word: 'Sherbet',
    phonic: 'SHER-but',
    ipa: '/ˈʃɜːbət/',
    definition: 'A frozen fruit-flavored dessert, typically made with water, sugar, and a small amount of dairy.',
    etymology: 'From Turkish "şerbet". Frequently mispronounced and misspelled with an extra "r" as "sher-bert".',
    phonicDistractors: ['SHER-bert', 'sher-BAY', 'SHER-bit']
  },
  {
    word: 'Quay',
    phonic: 'KEE',
    ipa: '/kiː/',
    definition: 'A concrete, stone, or metal platform lying alongside water for loading and unloading ships.',
    etymology: 'From Old French "cai". Pronounced exactly like the word "key". Commonly mispronounced as "kway".',
    phonicDistractors: ['KWAY', 'KAY', 'KWEE']
  },
  {
    word: 'Aura',
    phonic: 'AW-ruh',
    ipa: '/ˈɔːrə/',
    definition: 'The distinctive atmosphere or quality that seems to surround and be generated by a person, thing, or place.',
    etymology: 'From Greek "aura", meaning "breeze" or "breath". Often misspoken with a broad "ow" sound.',
    phonicDistractors: ['OW-rah', 'AH-rah', 'AW-rah-lee']
  },
  {
    word: 'Flaccid',
    phonic: 'FLAK-sid',
    ipa: '/ˈflæksɪd/',
    definition: 'Soft and hanging loose or limp, typically so as to look or feel unpleasant or weak.',
    etymology: 'From Latin "flaccidus". Although "flass-id" is common, "flack-sid" remains the preferred traditional standard.',
    phonicDistractors: ['FLAS-id', 'flah-SEEN', 'FLAK-id']
  },
  {
    word: 'Giga',
    phonic: 'GIG-uh',
    ipa: '/ˈɡɪɡə/',
    definition: 'A unit prefix in the metric system denoting a factor of one billion.',
    etymology: 'From Greek "gigas", meaning "giant". While popular culture says "gig-uh", "jig-uh" was the original standard.',
    phonicDistractors: ['GEEG-ah', 'GIG-ay', 'JIG-ay']
  },
  {
    word: 'Heinous',
    phonic: 'HAY-nus',
    ipa: '/ˈheɪnəs/',
    definition: 'Utterly odious or wicked (especially of a crime).',
    etymology: 'From Old French "hainos", meaning "hateful". The first syllable rhymes with "day".',
    phonicDistractors: ['HEE-nus', 'HY-nus', 'HAY-nee-us']
  },
  {
    word: 'Demur',
    phonic: 'dih-MER',
    ipa: '/dɪˈmɜː/',
    definition: 'Raise doubts or objections, or show reluctance.',
    etymology: 'From Latin "demorari", meaning "to delay". Commonly confused with "demure" (meaning shy/modest).',
    phonicDistractors: ['dee-MUR', 'dih-MYOOR', 'dem-ER']
  },
  {
    word: 'Hypertrophy',
    phonic: 'hy-PER-truh-fee',
    ipa: '/haɪˈpɜːtrəfi/',
    definition: 'The enlargement of an organ or tissue from the increase in size of its cells.',
    etymology: 'From Greek "hyper" (over) + "trophe" (nourishment). Commonly mispronounced by bodybuilders.',
    phonicDistractors: ['hy-per-TROH-fee', 'hy-per-TROH-fy', 'hy-per-TRU-fy']
  },
  {
    word: 'Lamentable',
    phonic: 'LAM-en-tuh-bul',
    ipa: '/ˈlæməntəbəl/',
    definition: 'Deplorably bad or unsatisfactory; full of regret or grief.',
    etymology: 'From Latin "lamentabilis". The primary stress resides strictly on the very first syllable.',
    phonicDistractors: ['luh-MEN-tuh-bul', 'lah-men-TAH-bul', 'LAM-en-tay-bul']
  },
  {
    word: 'Macabre',
    phonic: 'muh-KAHB-ruh',
    ipa: '/məˈkɑːbrə/',
    definition: 'Disturbing and horrifying because of involvement with or depiction of death.',
    etymology: 'From French "danse macabre" (dance of death). The ending "re" is a very brief breath.',
    phonicDistractors: ['mak-uh-BRAY', 'muh-KAY-ber', 'may-KAH-bree']
  },
  {
    word: 'Plagiarize',
    phonic: 'PLAY-juh-ryz',
    ipa: '/ˈpleɪdʒəraɪz/',
    definition: 'Take the work or an idea of someone else and pass it off as one\'s own.',
    etymology: 'From Latin "plagiarius", meaning "kidnapper". Swaps letters in phonetic speech sometimes.',
    phonicDistractors: ['plah-gee-ah-RYZ', 'play-gee-ah-RYZ', 'plah-juh-RYZ']
  },
  {
    word: 'Piquant',
    phonic: 'PEE-kent',
    ipa: '/ˈpiːkənt/',
    definition: 'Having a pleasantly sharp taste or appetizing flavor, or excitingly provocative.',
    etymology: 'From French "piquer", meaning "to prick". The "qu" has a soft "k" sound.',
    phonicDistractors: ['py-KWANT', 'PIH-kwent', 'pee-KWANT']
  },
  {
    word: 'Plethora',
    phonic: 'PLETH-uh-ruh',
    ipa: '/ˈplɛθərə/',
    definition: 'A large or excessive amount of something; an overabundance.',
    etymology: 'From Greek "plethore", meaning "fullness". The stress is strictly on the first syllable.',
    phonicDistractors: ['pleh-THOR-uh', 'pleh-THOH-rah', 'PLEETH-oh-rah']
  },
  {
    word: 'Reverie',
    phonic: 'REV-uh-ree',
    ipa: '/ˈrɛvəri/',
    definition: 'A state of being pleasantly lost in one\'s thoughts; a daydream.',
    etymology: 'From Old French "reverie", meaning "revelry" or "wildness".',
    phonicDistractors: ['ree-VARE-ee', 'rev-uh-RAY', 'ree-VEER-ee']
  },
  {
    word: 'Status',
    phonic: 'STAY-tus',
    ipa: '/ˈsteɪtəs/',
    definition: 'The relative social, professional, or official standing of someone or something.',
    etymology: 'From Latin "status", meaning "state" or "position". Both "stay-tus" and "stat-us" are acceptable, but "stay-tus" is classical.',
    phonicDistractors: ['stah-TOOS', 'stah-TUS', 'SAY-tus']
  },
  {
    word: 'Tripartite',
    phonic: 'try-PAHR-tyt',
    ipa: '/traɪˈpɑːtaɪt/',
    definition: 'Shared by or involving three parties, or consisting of three parts.',
    etymology: 'From Latin "tripartitus". Both secondary syllables end in a long "i" sound.',
    phonicDistractors: ['trip-ahr-TEET', 'try-pahr-TEET', 'trip-AHR-tyt']
  },
  {
    word: 'Zealot',
    phonic: 'ZEL-ut',
    ipa: '/ˈzɛlət/',
    definition: 'A person who is fanatical and uncompromising in pursuit of their religious, political, or other ideals.',
    etymology: 'From Greek "zelotes". Pronounced with a short "e" sound (rhyming with "pellet").',
    phonicDistractors: ['ZEE-lut', 'ZAY-lut', 'ZEL-ot']
  },
  {
    word: 'Garrulous',
    phonic: 'GAIR-yuh-lus',
    ipa: '/ˈɡærələs/',
    definition: 'Excessively talkative, especially on trivial matters.',
    etymology: 'From Latin "garrulus", from "garrire" meaning "to chatter".',
    phonicDistractors: ['gah-ROO-lus', 'gahr-yoo-LOOS', 'GAIR-ul-us']
  }
];

// Curated Ranks based on total correct scores
const getRank = (score) => {
  if (score < 10) return { title: 'Lexicon Novice', color: '#777' };
  if (score < 30) return { title: 'Word Weaver', color: '#bbb' };
  if (score < 60) return { title: 'Etymology Scholar', color: '#ddd' };
  if (score < 100) return { title: 'Phonetic Master', color: '#f5f5f5' };
  return { title: 'Orthoepy Grandmaster', color: '#fff' };
};

export default function Lexica() {
  // Screen views: 'quiz' | 'library'
  const [currentView, setCurrentView] = useState('quiz');

  // Game Modes: 'phonics' (Pronunciation) | 'wordToDef' | 'defToWord'
  const [gameMode, setGameMode] = useState('phonics');

  // Quiz States
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  // Stats States
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('lx_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    const saved = localStorage.getItem('lx_best_streak');
    return saved ? parseInt(saved, 10) : 0;
  });



  // Sync Stats to LocalStorage
  useEffect(() => {
    localStorage.setItem('lx_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('lx_best_streak', bestStreak.toString());
  }, [bestStreak]);

  // Library States
  const [searchQuery, setSearchQuery] = useState('');

  // Notification trigger states
  const [streakMilestone, setStreakMilestone] = useState(null);

  // Load a new random question index
  const selectNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * WORD_DATABASE.length);
    setCurrentWordIndex(randomIndex);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };

  // Prepare and shuffle options whenever word or mode changes
  useEffect(() => {
    if (WORD_DATABASE.length === 0) return;
    
    const wordObj = WORD_DATABASE[currentWordIndex];
    let choices = [];

    if (gameMode === 'phonics') {
      // Shuffling phonics options
      choices = [
        { text: wordObj.phonic, isCorrect: true },
        ...wordObj.phonicDistractors.map(d => ({ text: d, isCorrect: false }))
      ];
    } else if (gameMode === 'wordToDef') {
      // Word to Definition: Correct definition + 3 random other definitions
      choices = [
        { text: wordObj.definition, isCorrect: true }
      ];
      
      const otherDefs = WORD_DATABASE
        .filter((_, idx) => idx !== currentWordIndex)
        .map(w => w.definition);
        
      const shuffledOthers = [...otherDefs].sort(() => 0.5 - Math.random()).slice(0, 3);
      choices.push(...shuffledOthers.map(d => ({ text: d, isCorrect: false })));
    } else if (gameMode === 'defToWord') {
      // Definition to Word: Correct word + 3 random other words
      choices = [
        { text: wordObj.word, isCorrect: true }
      ];
      
      const otherWords = WORD_DATABASE
        .filter((_, idx) => idx !== currentWordIndex)
        .map(w => w.word);
        
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
      choices.push(...shuffledOthers.map(w => ({ text: w, isCorrect: false })));
    }

    // Shuffle final choices array
    setShuffledOptions([...choices].sort(() => 0.5 - Math.random()));
  }, [currentWordIndex, gameMode]);

  // Load initial question
  useEffect(() => {
    selectNewQuestion();
  }, [gameMode]);

  // Handle choice selection
  const handleSelectAnswer = (option) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      // Update scoring
      setScore(s => s + 10);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }

      // Special Streak Achievements
      if (nextStreak > 0 && nextStreak % 5 === 0) {
        setStreakMilestone(`${nextStreak}x Streak!`);
        setTimeout(() => setStreakMilestone(null), 3000);
      } else if (nextStreak === 3) {
        setStreakMilestone('Hot Streak! 3x');
        setTimeout(() => setStreakMilestone(null), 3000);
      }

    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    selectNewQuestion();
  };

  // Filtered library words based on query
  const filteredWords = WORD_DATABASE.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phonic.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.word.localeCompare(b.word));

  const wordObj = WORD_DATABASE[currentWordIndex] || WORD_DATABASE[0];
  const userRank = getRank(score);

  return (
    <div className="lx-root">
      
      {/* Visual Header */}
      <header className="lx-header">
        <div className="lx-logo-group">
          <span className="lx-logo" onClick={() => setCurrentView('quiz')}>Lexica</span>
        </div>
        <div className="lx-header-actions">
          <button 
            className={`lx-tool-btn ${currentView === 'quiz' ? 'active' : ''}`}
            onClick={() => setCurrentView('quiz')}
            title="Play Quiz"
          >
            Play
          </button>
          <button 
            className={`lx-tool-btn ${currentView === 'library' ? 'active' : ''}`}
            onClick={() => setCurrentView('library')}
            title="Dictionary Library"
          >
            Dictionary
          </button>
        </div>
      </header>

      {/* Main Sandbox */}
      <main className="lx-container">
        
        {currentView === 'quiz' ? (
          <>
            {/* Top Stats Ribbon */}
            <section className="lx-stats-ribbon">
              <div className="lx-stat-card">
                <span className="lx-stat-label">Score</span>
                <span className="lx-stat-value accent-cyan">{score}</span>
              </div>
              <div className="lx-stat-card">
                <span className="lx-stat-label">Streak</span>
                <span className="lx-stat-value accent-purple">{streak}</span>
              </div>
              <div className="lx-stat-card">
                <span className="lx-stat-label">Rank</span>
                <span className="lx-stat-value" style={{ color: userRank.color, fontSize: '0.8rem', fontWeight: 'bold', height: '22px', display: 'flex', alignItems: 'center' }}>
                  {userRank.title}
                </span>
              </div>
            </section>

            {/* Mode Select Tabs */}
            <section className="lx-modes-bar">
              <button 
                className={`lx-mode-btn ${gameMode === 'phonics' ? 'active' : ''}`}
                onClick={() => setGameMode('phonics')}
              >
                Pronunciation
              </button>
              <button 
                className={`lx-mode-btn ${gameMode === 'wordToDef' ? 'active' : ''}`}
                onClick={() => setGameMode('wordToDef')}
              >
                Word to Def
              </button>
              <button 
                className={`lx-mode-btn ${gameMode === 'defToWord' ? 'active' : ''}`}
                onClick={() => setGameMode('defToWord')}
              >
                Def to Word
              </button>
            </section>

            {/* Core Quiz Arena */}
            <section className="lx-quiz-card">
              
              {/* Streak Milestone Badge */}
              {streakMilestone && (
                <div className="lx-streak-alert">
                  {streakMilestone}
                </div>
              )}

              {/* Prompt Area */}
              {gameMode === 'phonics' && (
                <>
                  <span className="lx-prompt-meta">How do you pronounce:</span>
                  <h1 className="lx-prompt-word">{wordObj.word}</h1>
                </>
              )}

              {gameMode === 'wordToDef' && (
                <>
                  <span className="lx-prompt-meta">What is the definition of:</span>
                  <h1 className="lx-prompt-word">{wordObj.word}</h1>
                </>
              )}

              {gameMode === 'defToWord' && (
                <>
                  <span className="lx-prompt-meta">Which word matches this definition?</span>
                  <p className="lx-prompt-def">"{wordObj.definition}"</p>
                </>
              )}

              {/* Choices List */}
              <div className="lx-options-grid">
                {shuffledOptions.map((opt, i) => {
                  let btnClass = '';
                  if (isAnswered) {
                    if (opt.isCorrect) {
                      btnClass = 'correct';
                    } else if (selectedAnswer === opt) {
                      btnClass = 'incorrect';
                    } else {
                      btnClass = 'dimmed';
                    }
                  }
                  
                  return (
                    <button
                      key={i}
                      className={`lx-option-btn ${btnClass}`}
                      onClick={() => handleSelectAnswer(opt)}
                      disabled={isAnswered}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Feedback Drawer */}
              {isAnswered && (
                <div className="lx-feedback-drawer">
                  <div className={`lx-feedback-title ${selectedAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                    {selectedAnswer.isCorrect ? (
                      <>
                        Correct +10pts
                      </>
                    ) : (
                      <>
                        Incorrect
                      </>
                    )}
                  </div>
                  
                  <div className="lx-explanation-box">
                    <div className="lx-phonics-guide">
                      {wordObj.word} <span>{wordObj.phonic} · {wordObj.ipa}</span>
                    </div>
                    <div className="lx-etymology">
                      <strong>Meaning:</strong> {wordObj.definition}
                    </div>
                    <div className="lx-etymology" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px', fontStyle: 'italic' }}>
                      <strong>Origins:</strong> {wordObj.etymology}
                    </div>
                  </div>

                  <button className="lx-next-btn" onClick={handleNextQuestion}>
                    Next Question
                  </button>
                </div>
              )}

            </section>
          </>
        ) : (
          /* Lexicon Library Explorer */
          <section className="lx-library">
            <div className="lx-lib-header">
              <span className="lx-lib-title">Lexicon Library</span>
              <span className="lx-prompt-meta" style={{ margin: 0 }}>{WORD_DATABASE.length} words loaded</span>
            </div>

            <input 
              type="text" 
              className="lx-search-input"
              placeholder="Search words, pronunciations, meanings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <div className="lx-lib-list">
              {filteredWords.map(w => (
                <div key={w.word} className="lx-lib-row">
                  <div className="lx-lib-row-top">
                    <span className="lx-lib-word">{w.word}</span>
                    <span className="lx-lib-phonetics">{w.phonic} <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#555' }}>{w.ipa}</span></span>
                  </div>
                  <p className="lx-lib-desc">
                    <strong>Definition:</strong> {w.definition}
                  </p>
                  <p className="lx-lib-desc" style={{ opacity: 0.6, fontSize: '0.72rem', fontStyle: 'italic' }}>
                    <strong>Insight:</strong> {w.etymology}
                  </p>
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="lx-lib-row" style={{ alignItems: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
                  No words found matching "{searchQuery}"
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <footer style={{ marginTop: 'auto', padding: '24px 0', textAlign: 'center', opacity: 0.5 }}>
        <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
