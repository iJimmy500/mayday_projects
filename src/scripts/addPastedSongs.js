import ytSearch from 'yt-search';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../data/onehitwonders.json');

const rawText = `M2M – "Don't Say You Love Me" (2000)[1845][1846]
Eiffel 65 – "Blue (Da Ba Dee)" (2000)[1847][1848][1347]
Filter – "Take a Picture" (2000)[1849][40]
J-Shin ft. LaTocha Scott – "One Night Stand" (2000)[40][1850]
The Product G&B – "Maria Maria" (2000)[1851][1852]
Hoku – "Another Dumb Blonde" (2000)[1853][1846]
Bloodhound Gang – "The Bad Touch" (2000)[1347][1650]
Sonique – "It Feels So Good" (2000)[1854][1855]
504 Boyz – "Wobble Wobble" (2000)[1856][40]
Carl Thomas – "I Wish" (2000)[1857][40]
Mary Mary – "Shackles (Praise You)" (2000)[1858][40]
Macy Gray – "I Try" (2000)[87][22][6]
Alice Deejay – "Better Off Alone" (2000)[1552][1859]
Westlife – "Swear It Again" (2000)[1860][1846]
Chad Brock – "Yes!" (2000)[1861][1862]
Wheatus – "Teenage Dirtbag" (2000)[1863][1864]
Nine Days – "Absolutely (Story of a Girl)" (2000)[1865][1866]
SR-71 – "Right Now" (2000)[1867][1868][1869][1866]
BBMak – "Back Here" (2000)[1772][1870]
Lucy Pearl – "Dance Tonight" (2000)[1871][1872]
Son by Four – "Purest of Pain (A Puro Dolor)" (2000)[40][1846]
Zombie Nation – "Kernkraft 400" (2000)[1552][1873]
Ruff Endz – "No More" (2000)[1868][1874]
Billy Gilman – "One Voice" (2000)[1875][1876]
soulDecision – "Faded" (2000)[1877][1868][1878]
Aaron Carter – "Aaron's Party (Come Get It)" (2000)[1879][1846][40]
Kandi – "Don't Think I'm Not" (2000)[1868][1880]
Baha Men – "Who Let the Dogs Out?" (2000)[1840][1881][1882]
Profyle – "Liar" (2000)[1883][1846]
Samantha Mumba – "Gotta Tell You" (2000)[1884][1885][1886]
Dream – "He Loves U Not" (2000)[1886][1845]
Debelah Morgan – "Dance with Me" (2001)[1868][1887]
Mikaila – "So in Love with Two" (2001)[1868][1888]
DJ Casper AKA Mr C The Slide Man – "Cha Cha Slide" (2001)[1889][1890][1891]
Lee Ann Womack – "I Hope You Dance" (2001)[1892][1893]
Evan and Jaron – "Crazy for This Girl" (2001)[1868][1894][1772]
Crazy Town – "Butterfly" (2001)[542][1895][1896][1897]
Eden's Crush – "Get Over Yourself" (2001)[1865][1845]
ATC – "Around the World (La La La La La)" (2001)[1347][1898]
Modjo – "Lady (Hear Me Tonight)" (2001)[145][1899]
3LW – "No More (Baby I'ma Do Right)" (2001)[1900][1901]
Jessica Andrews – "Who I Am" (2001)[1902][1903]
The Corrs – "Breathless" (2001)[1868][1904][1905]
S Club 7 – "Never Had a Dream Come True" (2001)[1844][1906][1907]
Sunshine Anderson – "Heard It All Before" (2001)[1580][1908]
City High – "What Would You Do?" (2001)[1909][1910]
Moby – "South Side" (2001)[1911][1912]
Lil Romeo – "My Baby" (2001)[1913][1844]
Blu Cantrell – "Hit 'Em Up Style (Oops!)" (2001)[1914][1886][1915][1580]
Jimmy Cozier – "She's All I Got" (2001)[1916][1917]
American Hi-Fi – "Flavor of the Weak" (2001)[1918][1919][1920]
Incubus – "Drive" (2001)[1921][40]
Willa Ford – "I Wanna Be Bad" (2001)[1886][1922]
Darude – "Sandstorm" (2001)[1923][1924]
The Wiseguys – "Start the Commotion" (2001)[40][1888][1868]
Afroman – "Because I Got High" (2001)[5][1885]
Cyndi Thomson – "What I Really Meant to Say" (2001)[1925][1926]
Lee Greenwood – "God Bless the U.S.A." (2001)[1927][1928]
Alien Ant Farm – "Smooth Criminal" (2001)[1878][1929]
Toya – "I Do!!" (2001)[1868][40]
The Calling – "Wherever You Will Go" (2002)[1930][1866][202]
Mr. Cheeks – "Lights, Camera, Action!" (2002)[1931][40]
Glenn Lewis – "Don't You Forget It" (2002)[40][1932]
P.O.D. – "Youth of the Nation" (2002)[1933][40]
Phantom Planet – "California" (2002)[1934][1935]
Tweet – "Oops (Oh My)" (2002)[1772][1886]
Tommy Shane Steiner – "What If She's an Angel" (2002)[1926][1936]
Vanessa Carlton – "A Thousand Miles" (2002)[1937][1938]
Steve Azar – "I Don't Have to Be Me ('til Monday)" (2002)[1939][1940]
Truth Hurts – "Addictive" (2002)[1885][1915]
Default – "Wasting My Time" (2002)[1941][1868][1942]
Jimmy Eat World – "The Middle" (2002)[1943][1857]
Dirty Vegas – "Days Go By" (2002)[1944][1945]
Big Tymers – "Still Fly" (2002)[1946][1868]
Khia – "My Neck, My Back (Lick It)" (2002)[1249][1947]
DJ Sammy – "Heaven" (2002)[1897][1552][1948]
Angie Martinez ft. Sacario – "If I Could Go!" (2002)[1885][1949]
Las Ketchup – "The Ketchup Song (Aserejé)" (2002)[1347][1834][1187][1315]
Lasgo – "Something" (2003)[40][1950]
Aaron Lines – "You Can't Hide Beautiful" (2003)[1777][1951]
Smilez and Southstar – "Tell Me" (2003)[1249][1865][1580]
JC Chasez – "Blowin' Me Up (With Her Love)" (2003)[1347][1885]
t.A.T.u. – "All The Things She Said" (2003)[1845][1772]
Norah Jones – "Don't Know Why" (2003)[1952][1953]
Amanda Perez – "Angel" (2003)[1868][1954]
Wayne Wonder – "No Letting Go" (2003)[202][1955]
Bone Crusher – "Never Scared" (2003)[1249][1915]
Lumidee – "Never Leave You (Uh Oooh, Uh Oooh)" (2003)[1885][1956][1580]
Junior Senior – "Move Your Feet" (2003)[1347][1957]
The Ataris – "The Boys of Summer" (2003)[1958][1885]
YoungBloodZ – "Damn!" (2003)[1959][1913]
Trapt – "Headstrong" (2003)[1960][1961]
Fountains of Wayne – "Stacy's Mom" (2003)[1886][1962]
Pat Green – "Wave on Wave" (2003)[40][1963]
Fefe Dobson – "Take Me Away" (2003)[1886][1562]
Stacie Orrico – "(There's Gotta Be) More to Life" (2003)[1964][1965]
Liz Phair – "Why Can't I?" (2003)[1905][1966][1967]
Nick Cannon – "Gigolo" (2004)[1968][40]
Eamon – "Fuck It (I Don't Want You Back)" (2004)[1868][1969]
The Darkness – "I Believe in a Thing Called Love" (2004)[348][1970]
Cassidy – "Hotel" (2004)[1971][1972][1973]
J-Kwon – "Tipsy" (2004)[1249][1915][1580]
Mario Winans – "I Don't Wanna Know" (2004)[1868][1974]
Jet – "Are You Gonna Be My Girl" (2004)[1975][1976]
Hoobastank – "The Reason" (2004)[1977][1978][1979][202]
Yellowcard – "Ocean Avenue" (2004)[1905][1966]
Mis-Teeq – "Scandalous" (2004)[1868][1905][1936]
Diana DeGarmo – "Dreams" (2004)[1968][40]
Nina Sky – "Move Ya Body" (2004)[1980][1981][1868]
Kevin Lyttle – "Turn Me On" (2004)[1930][1886]
Houston – "I Like That" (2004)[1982][1983]
Terror Squad – "Lean Back" (2004)[1868][1984]
Los Lonely Boys – "Heaven" (2004)[1985][1986]
O-Zone – "Dragostea Din Tei" (2004)[1552][1987]
Modest Mouse – "Float On" (2004)[1988][1989]
Franz Ferdinand – "Take Me Out" (2004)[1990][1976]
Bowling for Soup – "1985" (2004)[1943][1857][1698]
Rupee – "Tempted to Touch" (2004)[1868][1991]
Seether ft. Amy Lee – "Broken" (2004)[1992][40]
Josh Gracin – "Nothin' To Lose" (2005)[1778][1993]
Trillville – "Some Cut" (2005)[40][1994]
Caesars – "Jerk It Out" (2005)[1995][1996]
Amerie – "1 Thing" (2005)[1885][1997]
Brooke Valentine – "Girlfight" (2005)[1998][1999]
System of a Down – "B.Y.O.B." (2005)[40][2000]
Howie Day – "Collide" (2005)[1956][2001]
Bo Bice – "Inside Your Heaven" (2005)[1980][2002]
Natalie – "Goin' Crazy" (2005)[2003][103]
Papa Roach – "Scars" (2005)[2004][40]
D.H.T. – "Listen to Your Heart" (2005)[202][2005]
The Click Five – "Just the Girl" (2005)[1956][1865]
Crazy Frog – "Axel F" (2005)[1552][1347]
Rent – "Seasons of Love" (2005)[40][2003]
D4L – "Laffy Taffy" (2006)[1881][2006]
James Blunt – "You're Beautiful" (2006)[2007][2008]
Daniel Powter – "Bad Day" (2006)[1840][1930][202]
Nick Lachey – "What's Left of Me" (2006)[2009][2010][1979][40]
Teddy Geiger – "For You I Will (Confidence)" (2006)[2011][40]
Saving Jane – "Girl Next Door" (2006)[1868][1857]
Chamillionaire – "Ridin'" (2006)[2012][2013]
Fort Minor ft. Holly Brook – "Where'd You Go" (2006)[40][2014]
AFI – "Miss Murder" (2006)[40][1966]
The Wreckers – "Leave the Pieces" (2006)[2015][1838]
Taylor Hicks – "Do I Make You Proud" (2006)[2016][40]
Paris Hilton – "Stars Are Blind" (2006)[2017][1636][326]
Gnarls Barkley – "Crazy" (2006)[1866][1868]
Cassie – "Me & U" (2006)[1868][2018]
Young Dro – "Shoulder Lean" (2006)[1868][2019]
Brooke Hogan – "About Us" (2006)[1868][2011]
Cherish ft. Sean P – "Do It to It" (2006)[1868][2020]
The Pack – "Vans" (2006)[1249][2019]
Corinne Bailey Rae – "Put Your Records On" (2006)[2021][2022]
Peter Bjorn and John – "Young Folks" (2006)[1857][1990][1976]
Hinder – "Lips of an Angel" (2006)[1868][1347]
Snow Patrol – "Chasing Cars" (2006)[1866][2023]
Jibbs – "Chain Hang Low" (2006)[1249][2019][1580]
DJ Webstar and Young B. – "Chicken Noodle Soup" (2006)[1249][2019][1580]
Heartland – "I Loved Her First" (2006)[1940][2024][2015]
Mario Vazquez – "Gallery" (2006)[40][2025]
Corbin Bleu – "Push It to the Limit" (2007)[2026][2027]
Hellogoodbye – "Here (In Your Arms)" (2007)[40][2028]
Augustana – "Boston" (2007)[1956][2029]
Mims – "This Is Why I'm Hot" (2007)[1249][1881][1580]
Rich Boy – "Throw Some D's" (2007)[1915][2006]
Baby Boy da Prince – "The Way I Live" (2007)[2030][2031]
The Red Jumpsuit Apparatus – "Face Down" (2007)[2032][40]
Huey – "Pop, Lock & Drop It" (2007)[1249][2033][1580]
Shop Boyz – "Party Like a Rockstar" (2007)[1249][202][1580]
Amy Winehouse – "Rehab" (2007)[2027][40][2034]
Down AKA Kilo – "Lean like a Cholo" (2007)[40][2027]
Plain White T's – "Hey There Delilah" (2007)[2035][2036][2037]
Hurricane Chris – "A Bay Bay" (2007)[1865][2038]
Aly & AJ – "Potential Breakup Song" (2007)[1900][1845]
Cupid – "Cupid Shuffle" (2007)[5][2039][1395]
Elliott Yamin – "Wait For You" (2007)[40][2040]
Kat DeLuna – "Whine Up" (2007)[1943][1737]
J. Holiday – "Bed" (2007)[2041][1580]
Feist – "1234" (2007)[1878][1990]
Playaz Circle – "Duffle Bag Boy" (2007)[2026][1249]
Niia – "Sweetest Girl (Dollar Bill)" (2008)[2042][40]
Yael Naim – "New Soul" (2008)[1886][2043][2044]
Buckcherry – "Sorry" (2008)[1663][40]
2 Pistols – "She Got It" (2008)[40][2045]
James Otto – "Just Got Started Lovin' You" (2008)[2046][2047]
Colby O'Donis – "What You Got" (2008)[1900][40]
Duffy – "Mercy" (2008)[2048][1966]
Metro Station – "Shake It" (2008)[1886][2049]
V.I.C. – "Get Silly" (2008)[2050][2045]
Flobots – "Handlebars" (2008)[1868][2051]
Shwayze – "Corona and Lime" (2008)[1868][1900]
Hit Masters – "All Summer Long" (2008)[40][205]
Estelle – "American Boy" (2008)[379][1865][1866]
The Rock Heroes – "All Summer Long" (2008)[40][205]
Saving Abel – "Addicted" (2008)[1868][40]
The Veronicas – "Untouched" (2009)[40][2052]
A. R. Rahman – "Jai Ho! (You Are My Destiny)" (2009)[2053][40]
GS Boyz – "Stanky Legg" (2009)[1249][1857]
Asher Roth – "I Love College" (2009)[1865][1868]
Kristinia DeBarge – "Goodbye" (2009)[2054][2055][2056]
The Ting Tings – "That's Not My Name" (2009)[1737][2055]
Dorrough – "Ice Cream Paint Job" (2009)[1868][40]
Muse – "Uprising" (2009)[40][2057]
Michael Franti & Spearhead – "Say Hey (I Love You)" (2009)[1868][2058]
Ester Dean – "Drop It Low" (2009)[40][1965]`;

async function getYoutubeId(query) {
  try {
    const r = await ytSearch(query);
    const video = r.videos[0];
    return video ? video.videoId : null;
  } catch (err) {
    console.error(`Error searching for ${query}:`, err.message);
    return null;
  }
}

async function run() {
  const lines = rawText.split('\n').filter(l => l.trim());
  const newSongs = [];

  for (const line of lines) {
    const match = line.match(/^(.+?) – "(.+?)" \((\d{4})\)/);
    if (match) {
      const artist = match[1].trim();
      const title = match[2].trim();
      const year = parseInt(match[3]);
      newSongs.push({ artist, title, year, album: '2000s One Hit Wonder' });
    }
  }

  console.log(`Parsed ${newSongs.length} songs. Fetching YouTube IDs...`);

  // Load existing songs
  const existingSongs = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  const finalSongs = [...existingSongs];

  for (let i = 0; i < newSongs.length; i++) {
    const song = newSongs[i];
    // Check if already exists
    if (finalSongs.find(s => s.title === song.title && s.artist === song.artist)) {
      console.log(`Skipping existing: ${song.title}`);
      continue;
    }

    console.log(`[${i+1}/${newSongs.length}] Searching for: ${song.title} by ${song.artist}`);
    const id = await getYoutubeId(`${song.title} ${song.artist} official audio`);
    if (id) {
      finalSongs.push({
        id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        album: song.album
      });
    }

    // Incremental write every 10 songs
    if (i % 10 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSongs, null, 2));
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSongs, null, 2));
  console.log(`Updated ${OUTPUT_FILE} with ${finalSongs.length} total songs.`);
}

run();

