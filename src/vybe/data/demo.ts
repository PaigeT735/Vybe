/**
 * Deterministic demo catalogue for the Vybe prototype.
 *
 * This file holds *catalogue* data (people, societies, events, album photos,
 * perks, tiers, achievement definitions) plus a short list of seed *actions*
 * (registrations, check-ins, uploads). The user's coins, achievements,
 * credentials and history are NOT written here — they are derived by replaying
 * the seed actions through the same domain functions the UI uses
 * (see domain/seed.ts), so every number on screen comes from records.
 *
 * Photos are Unsplash images (Unsplash License), referenced by id.
 */
import type { AchievementDef, CampusEvent, Notification, Perk, Person, Profile, Society, Tier } from './types';

/** The prototype pretends "now" is this moment so LIVE / Tonight never drift. */
export const DEMO_NOW = '2026-10-09T16:00';
export const CAMPUS_LABEL = 'Trinity · Dublin';

export const people: Record<string, Person> = {
  aoife: { id: 'aoife', name: 'Aoife Byrne', course: 'Law & Business', photo: 'photo-1573496359142-b8d87734a5a2', interests: ['finance', 'debate', 'nightlife'], isFriend: true },
  cian: { id: 'cian', name: 'Cian Murphy', course: 'Economics', photo: 'photo-1544168190-79c17527004f', interests: ['finance', 'tennis', 'startups'], isFriend: true },
  priya: { id: 'priya', name: 'Priya Nair', course: 'Computer Science', photo: 'photo-1517256673644-36ad11246d21', interests: ['tech', 'startups', 'design'], isFriend: true },
  hannah: { id: 'hannah', name: 'Hannah Okafor', course: 'Business & Economics', photo: 'photo-1544717305-2782549b5136', interests: ['finance', 'coffee'], isFriend: true },
  daniel: { id: 'daniel', name: 'Daniel Kim', course: 'Engineering', photo: 'photo-1654110455429-cf322b40a906', interests: ['engineering', 'startups'], isFriend: true },
  liam: { id: 'liam', name: 'Liam Walsh', course: 'History', photo: 'photo-1576110598658-096ae24cdb97', interests: ['debate', 'outdoors'], isFriend: true },
  tomas: { id: 'tomas', name: 'Tomás Ruiz', course: 'Physics', photo: 'photo-1546525848-3ce03ca516f6', interests: ['tennis', 'outdoors'], isFriend: true },
  maya: { id: 'maya', name: 'Maya Fischer', course: 'Psychology', photo: 'photo-1438761681033-6461ffad8d80', interests: ['coffee', 'nightlife', 'art'], isFriend: true },
  niamh: { id: 'niamh', name: 'Niamh Kelly', course: 'Medicine', photo: 'photo-1618355776464-8666794d2520', interests: ['outdoors', 'photography'], isFriend: true },
  sofia: { id: 'sofia', name: 'Sofia Marchetti', course: 'Film Studies', photo: 'photo-1619431667975-e93b820cde63', interests: ['photography', 'art'], isFriend: true },
  jack: { id: 'jack', name: "Jack O'Brien", course: 'Management Science', photo: 'photo-1568880893176-fb2bdab44e41', interests: ['nightlife', 'finance'], isFriend: true },
  ethan: { id: 'ethan', name: 'Ethan Chen', course: 'Computer Science', photo: 'photo-1533469513-03bfed91f496', interests: ['tech', 'startups'], isFriend: true },
  ruairi: { id: 'ruairi', name: 'Ruairí Doyle', course: 'Philosophy', photo: 'photo-1548810020-ea2f1da35cff', interests: ['photography', 'coffee', 'debate'] },
  grace: { id: 'grace', name: 'Grace Adeyemi', course: 'Pharmacy', photo: 'photo-1623945194105-cd36c4433390', interests: ['tennis', 'coffee', 'startups'] },
};

export const societies: Society[] = [
  { id: 'finance', name: 'Trinity Finance Society', short: 'Finance', initials: 'FS', hue: 230, photo: 'photo-1561489396-888724a1543d', members: 1840, newPosts: 3,
    description: 'Speaker nights, trading competitions and the friendliest way into finance careers on campus.' },
  { id: 'wit', name: 'Women in Tech', short: 'Women in Tech', initials: 'WiT', hue: 268, photo: 'photo-1615454782617-e69bbd4f2969', members: 760, newPosts: 2,
    description: 'A community for women and non-binary students who code, design, build and break things.' },
  { id: 'tennis', name: 'Trinity Tennis Club', short: 'Tennis', initials: 'TC', hue: 152, photo: 'photo-1542144582-1ba00456b5e3', members: 420, newPosts: 12,
    description: 'All levels welcome. Weekly socials on Botany Bay, league teams, and very competitive club champs.' },
  { id: 'photo', name: 'PhotoSoc', short: 'Photography', initials: 'PS', hue: 40, photo: 'photo-1523698120758-030a38a90d16', members: 590,
    description: 'Photo walks, darkroom access and two exhibitions a year. Phones absolutely count as cameras.' },
  { id: 'entre', name: 'Entrepreneurship Society', short: 'Entrepreneurs', initials: 'ES', hue: 200, photo: 'photo-1637073849667-91120a924221', members: 980,
    description: 'Founder talks, Build Weekend and a network of student startups that actually ship.' },
  { id: 'hike', name: 'Hiking Society', short: 'Hiking', initials: 'HS', hue: 120, photo: 'photo-1619133958778-69d3150a1ae6', members: 650, newPosts: 1,
    description: 'Weekend hikes in Wicklow and beyond. Bus leaves Front Arch, snacks are mandatory.' },
  { id: 'debate', name: 'Debate Union', short: 'Debate', initials: 'DU', hue: 0, photo: 'photo-1551731409-43eb3e517a1a', members: 1120,
    description: 'Weekly motions in the GMB, novice workshops and the occasional very loud heckle.' },
  { id: 'formula', name: 'Formula Trinity', short: 'Formula', initials: 'FT', hue: 350, photo: 'photo-1629402618127-3b3c08c00c2d', members: 140,
    description: 'Designing, building and racing a single-seater for Formula Student at Silverstone.' },
  { id: 'wwb', name: 'Women Who Build', short: 'Women Who Build', initials: 'WB', hue: 280, photo: 'photo-1675716921224-e087a0cca69a', members: 2300,
    description: 'Monthly Dublin meetup for women working in and around startups. Students always welcome.' },
  { id: 'dcc', name: 'Dublin Coffee Collective', short: 'Coffee Collective', initials: 'DC', hue: 25, photo: 'photo-1517701986616-711a9d625afe', members: 310,
    description: 'Slow coffee, good conversation and a rotating list of the city’s best small roasters.' },
  { id: 'ents', name: 'Trinity Ents', short: 'Ents', initials: 'TE', hue: 300, photo: 'photo-1585346230722-6b9df46d0d54', members: 5200,
    description: 'The people behind the balls, gigs and the biggest nights of the college year.' },
];

export const initiallyFollowed = ['finance', 'wit', 'tennis', 'photo', 'entre', 'hike', 'debate', 'formula'];
export const committeeOf = ['entre'];
export const memberOf = ['finance', 'tennis', 'wit'];

type E = Omit<CampusEvent, 'inFeed' | 'mapPos'> & { inFeed?: boolean; mapPos?: CampusEvent['mapPos'] };
const ev = (e: E): CampusEvent => ({ mapPos: { x: 50, y: 50 }, ...e });

export const events: CampusEvent[] = [
  /* ------------------------------ live & upcoming ------------------------------ */
  ev({
    id: 'tennis-live', societyId: 'tennis', checkInCode: 'TNS-4821',
    title: 'Friday Doubles Social', tagline: 'Mixed doubles, rotating partners, hot chocolate after.',
    description: 'Rotating mixed doubles every 20 minutes so you play with everyone. Rackets available to borrow at the clubhouse. Drop in for one set or stay till the lights go off.',
    category: 'SPORT', vibe: 'social', start: '2026-10-09T15:00', end: '2026-10-09T17:30',
    venue: 'Botany Bay Courts', address: 'Botany Bay, Trinity College', area: 'Campus', distanceKm: 0.1,
    price: 0, likes: 57, going: 23, image: 'photo-1545151414-8a948e1ea54f',
    friendsGoing: ['tomas', 'cian'], interests: ['tennis', 'sport'], mapPos: { x: 52, y: 52 },
  }),
  ev({
    id: 'wwb-oct', societyId: 'wwb', cohostId: 'wit', checkInCode: 'WWB-1030',
    title: 'Women Who Build', tagline: 'Meet the next generation of women building technology.',
    description: 'Lightning talks from three founders, then an open floor to meet people building in Dublin. Women in Tech members get priority on the student list — bring a friend and a question.',
    category: 'NETWORKING', vibe: 'professional', start: '2026-10-09T18:30', end: '2026-10-09T21:00',
    venue: 'Dogpatch Labs', address: 'The CHQ Building, Custom House Quay', area: 'Docklands', distanceKm: 1.4,
    price: 0, likes: 128, going: 46, capacity: 60, image: 'photo-1515169067868-5387ec356754',
    friendsGoing: ['priya', 'aoife'], interests: ['tech', 'startups'], mapPos: { x: 74, y: 40 },
  }),
  ev({
    id: 'fin-speaker', societyId: 'finance', checkInCode: 'FIN-2210',
    title: 'Speaker Night: Trinity to the Trading Floor', tagline: 'Three alumni on breaking into markets — and what they’d do differently.',
    description: 'A panel with alumni now working in trading, asset management and fintech, followed by Q&A and an informal mixer in the Arts Building foyer. Free for members; the society card is checked at the door.',
    category: 'CAREERS', vibe: 'professional', start: '2026-10-13T19:00', end: '2026-10-13T21:00',
    venue: 'Edmund Burke Theatre', address: 'Arts Building, Trinity College', area: 'Campus', distanceKm: 0.2,
    price: 0, priceNote: 'Free for members', likes: 214, going: 131, capacity: 150, image: 'photo-1582192730841-2a682d7375f9',
    friendsGoing: ['cian', 'aoife', 'hannah'], interests: ['finance', 'careers'], mapPos: { x: 46, y: 48 },
  }),
  ev({
    id: 'build-weekend', societyId: 'entre', cohostId: 'wit', checkInCode: 'BLD-3617',
    title: 'Build Weekend', tagline: '36 hours, mixed teams, real founders as mentors.',
    description: 'Form a team on Friday night, demo on Sunday afternoon. No startup idea needed — half the teams form at the door. Meals and caffeine covered by the €5 ticket.',
    category: 'CAREERS', vibe: 'professional', start: '2026-10-17T18:00', end: '2026-10-19T16:00',
    venue: 'The Hub', address: 'Trinity College, College Green', area: 'Campus', distanceKm: 0.3,
    price: 5, likes: 301, going: 87, capacity: 120, image: 'photo-1563461660947-507ef49e9c47',
    friendsGoing: ['priya', 'ethan', 'daniel'], interests: ['startups', 'tech'], mapPos: { x: 44, y: 46 },
  }),
  ev({
    id: 'sunrise-hike', societyId: 'hike', checkInCode: 'HKE-0615',
    title: 'Sunrise on Djouce', tagline: 'Early bus, big views, breakfast roll at the top.',
    description: 'Moderate 9km loop with about 450m of climbing. Bus leaves Front Arch at 06:15 sharp and is back by 13:00. Bring layers, the wind up there is real.',
    category: 'SPORT', vibe: 'social', start: '2026-10-11T06:15', end: '2026-10-11T13:00',
    venue: 'Front Arch (bus pickup)', address: 'College Green → Djouce, Co. Wicklow', area: 'Wicklow', distanceKm: 0.2,
    price: 8, priceNote: '€8 bus', likes: 73, going: 30, capacity: 45, image: 'photo-1597430379423-3b91d1539dbf',
    friendsGoing: ['liam', 'niamh'], interests: ['outdoors'], mapPos: { x: 48, y: 44 },
  }),
  ev({
    id: 'coffee-crawl', societyId: 'dcc', checkInCode: 'DCC-1100',
    title: 'Slow Sunday Coffee Crawl', tagline: 'Four roasters, one walk, zero laptops.',
    description: 'A two-hour walk between four independent roasters with a tasting at each stop. Small group, so it fills up fast. The first cup is on the Collective.',
    category: 'SOCIAL', vibe: 'social', start: '2026-10-11T11:00', end: '2026-10-11T13:00',
    venue: 'Stephen’s Green (Grafton St gate)', address: 'St Stephen’s Green North', area: 'City Centre', distanceKm: 0.6,
    price: 0, likes: 64, going: 19, capacity: 25, image: 'photo-1495474472287-4d71bcdd2085',
    friendsGoing: ['maya'], interests: ['coffee'], mapPos: { x: 42, y: 66 },
  }),
  ev({
    id: 'photo-expo', societyId: 'photo', checkInCode: 'PHO-1800',
    title: 'Dublin After Dark', tagline: 'PhotoSoc’s night photography exhibition — opening drinks included.',
    description: 'Forty prints from members shot between midnight and 5am across the city. Opening night includes a short talk from the curators and the vote for the people’s prize.',
    category: 'CULTURE', vibe: 'social', start: '2026-10-15T18:00', end: '2026-10-15T21:00',
    venue: 'Douglas Hyde Gallery', address: 'Nassau Street entrance, Trinity College', area: 'Campus', distanceKm: 0.2,
    price: 0, likes: 146, going: 58, image: 'photo-1561490497-43bc900ac2d8',
    friendsGoing: ['sofia'], interests: ['photography', 'art'], mapPos: { x: 55, y: 56 },
  }),
  ev({
    id: 'debate-interns', societyId: 'debate', checkInCode: 'DEB-1930',
    title: 'This House Would Ban Unpaid Internships', tagline: 'Open floor after the main speeches. Heckle politely.',
    description: 'Four speakers, two sides, then the floor opens. Novices encouraged to speak from the floor — there’s a short workshop at 18:45 beforehand if you want to try.',
    category: 'CULTURE', vibe: 'social', start: '2026-10-14T19:30', end: '2026-10-14T21:30',
    venue: 'Graduates Memorial Building', address: 'Front Square, Trinity College', area: 'Campus', distanceKm: 0.2,
    price: 0, likes: 88, going: 74, image: 'photo-1561491429-11ae811cee95',
    friendsGoing: ['liam', 'aoife'], interests: ['debate', 'careers'], mapPos: { x: 49, y: 51 },
  }),
  ev({
    id: 'formula-recruit', societyId: 'formula', checkInCode: 'FOR-1800',
    title: 'Recruitment Night: Join the 2027 Car', tagline: 'Engineering, business and ops roles open now.',
    description: 'Meet the team leads, see the chassis up close and hear what each sub-team actually does. Business and operations roles are open to every course, not just engineers.',
    category: 'CAREERS', vibe: 'professional', start: '2026-10-12T18:00', end: '2026-10-12T20:00',
    venue: 'Parsons Building', address: 'Trinity College', area: 'Campus', distanceKm: 0.3,
    price: 0, likes: 95, going: 61, image: 'photo-1531058020387-3be344556be6',
    friendsGoing: ['daniel'], interests: ['engineering', 'careers'], mapPos: { x: 56, y: 44 },
  }),
  ev({
    id: 'wit-coffee', societyId: 'wit', checkInCode: 'WIT-1000',
    title: 'Coffee & Code Reviews', tagline: 'Bring a side project, leave with three new pairs of eyes.',
    description: 'Small tables of four. Everyone brings something they’ve built — code, a Figma file or a half-finished idea — and gets real feedback over coffee.',
    category: 'NETWORKING', vibe: 'professional', start: '2026-10-16T10:00', end: '2026-10-16T12:00',
    venue: 'Nassau Street Café', address: 'Nassau Street', area: 'City Centre', distanceKm: 0.4,
    price: 0, likes: 42, going: 17, capacity: 20, image: 'photo-1653762379343-05d65154e11f',
    friendsGoing: ['priya'], interests: ['tech', 'coffee'], mapPos: { x: 60, y: 55 },
  }),
  ev({
    id: 'winter-ball', societyId: 'ents', checkInCode: 'ENT-2000',
    title: 'Trinity Winter Ball', tagline: 'Black tie, string quartet, then the DJ takes over.',
    description: 'Dinner, a string quartet through the drinks reception and a late DJ set. Tickets released in two waves; this is the final wave.',
    category: 'SOCIAL', vibe: 'social', start: '2026-11-28T20:00', end: '2026-11-29T02:00',
    venue: 'The Mansion House', address: 'Dawson Street', area: 'City Centre', distanceKm: 0.5,
    price: 65, likes: 523, going: 410, capacity: 450, image: 'photo-1768396855390-0728fa9c21e1',
    friendsGoing: ['aoife', 'maya', 'jack', 'sofia'], interests: ['nightlife'], mapPos: { x: 58, y: 62 },
  }),

  /* ------------------------------ past (feed highlights) ------------------------------ */
  ev({ id: 'fin-dinner', societyId: 'finance', title: 'Members’ Welcome Dinner', tagline: 'Long tables, longer conversations.',
    description: 'The Finance Society’s first dinner of the year.', category: 'SOCIAL', vibe: 'social', start: '2026-10-02T19:30', end: '2026-10-02T23:00',
    venue: 'The Dining Hall', address: 'Trinity College', area: 'Campus', distanceKm: 0.1, price: 20, likes: 167, going: 95,
    image: 'photo-1699730148588-42aabafe9c72', friendsGoing: ['cian', 'hannah'], interests: ['finance'], mapPos: { x: 51, y: 47 } }),
  ev({ id: 'freshers-ball', societyId: 'ents', title: 'Freshers’ Ball 2026', tagline: 'The night the year actually started.',
    description: 'Three stages across Front Square and the Exam Hall.', category: 'SOCIAL', vibe: 'social', start: '2026-09-26T21:00', end: '2026-09-27T02:00',
    venue: 'Front Square', address: 'Trinity College', area: 'Campus', distanceKm: 0.1, price: 25, likes: 892, going: 639,
    image: 'photo-1517457373958-b7bdd4587205', friendsGoing: ['aoife', 'cian', 'maya', 'jack'], interests: ['nightlife'] }),
  ev({ id: 'tennis-champs', societyId: 'tennis', title: 'Club Championship Finals', tagline: 'A three-setter nobody will stop talking about.',
    description: 'Finals day on Botany Bay, with a barbecue courtside.', category: 'SPORT', vibe: 'social', start: '2026-09-20T13:00', end: '2026-09-20T18:00',
    venue: 'Botany Bay Courts', address: 'Botany Bay, Trinity College', area: 'Campus', distanceKm: 0.1, price: 0, likes: 112, going: 79,
    image: 'photo-1554068865-24cecd4e34b8', friendsGoing: ['tomas'], interests: ['tennis'] }),

  /* ------------------------------ past (history only) ------------------------------ */
  ...([
    ['photo-walk', 'photo', 'Photo Walk: Liffey at Blue Hour', 'CULTURE', '2026-09-17T19:00', 'Ha’penny Bridge', 'photo-1706849668074-98c6837b3462'],
    ['wwb-sep', 'wwb', 'Women Who Build · September', 'NETWORKING', '2026-09-11T18:30', 'Dogpatch Labs', 'photo-1675716921224-e087a0cca69a'],
    ['p-light-year', 'photo', 'Exhibition: Light Year', 'CULTURE', '2026-05-02T18:00', 'Douglas Hyde Gallery', 'photo-1507643179773-3e975d7ac515'],
    ['p-doubles-cup', 'tennis', 'Spring Doubles Cup', 'SPORT', '2026-04-25T12:00', 'Botany Bay Courts', 'photo-1499510318569-1a3d67dc3976'],
    ['p-trading-final', 'finance', 'Trading Competition Final', 'CAREERS', '2026-04-09T18:00', 'Edmund Burke Theatre', 'photo-1735679356705-7c06b780c7a4'],
    ['p-glendalough', 'hike', 'Spring Hike: Glendalough', 'SPORT', '2026-03-21T08:00', 'Glendalough, Co. Wicklow', 'photo-1599828586134-fbaff96c63d5'],
    ['hack-spring', 'entre', 'Campus Hackathon', 'CAREERS', '2026-03-14T10:00', 'The Hub', 'photo-1504384308090-c894fdcc538d'],
    ['p-novice-debate', 'debate', 'Novice Debate Night', 'CULTURE', '2026-02-26T19:30', 'Graduates Memorial Building', 'photo-1570616969692-54d6ba3d0397'],
    ['p-product-design', 'wit', 'Product Design Workshop', 'CAREERS', '2026-02-12T18:00', 'Parsons Building', 'photo-1731160807880-daf859b64420'],
    ['p-founder-fireside', 'entre', 'Founder Fireside', 'NETWORKING', '2026-01-29T18:30', 'The Hub', 'photo-1515187029135-18ee286d815b'],
    ['p-coffee-jan', 'dcc', 'New Year Coffee Crawl', 'SOCIAL', '2026-01-15T11:00', 'Stephen’s Green', 'photo-1516197370049-569c4eaba1d6'],
    ['p-xmas-ball', 'ents', 'Christmas Ball', 'SOCIAL', '2025-12-05T20:00', 'Exam Hall', 'photo-1597329204992-214518c367b3'],
    ['p-night-walk', 'photo', 'Night Walk: Temple Bar', 'CULTURE', '2025-11-20T20:00', 'Temple Bar', 'photo-1586511686592-2074f7723e16'],
    ['p-tennis-clinic', 'tennis', 'Beginners’ Clinic', 'SPORT', '2025-11-06T17:00', 'Botany Bay Courts', 'photo-1595435742656-5272d0b3fa82'],
    ['p-markets-intro', 'finance', 'Intro to Markets Night', 'CAREERS', '2025-10-16T19:00', 'Edmund Burke Theatre', 'photo-1561489396-888724a1543d'],
    ['p-societies-day', 'ents', 'Societies Day 2025', 'SOCIAL', '2025-10-02T12:00', 'Front Square', 'photo-1663162550974-aaf76bcdeedf'],
  ] as const).map(([id, societyId, title, category, start, venue, image]) =>
    ev({
      id, societyId, title, category, start, venue, image,
      tagline: '', description: '', vibe: category === 'CAREERS' || category === 'NETWORKING' ? 'professional' : 'social',
      address: 'Dublin', area: 'Campus', distanceKm: 0.3, price: 0, likes: 60, going: 48, interests: [], inFeed: false,
    }),
  ),
];

/** Shared album photos per event. Index lists mark which ones the current user uploaded; `v` marks videos. */
export const albums: Record<string, { photos: string[]; mine?: number[]; videos?: number[] }> = {
  'tennis-live': { photos: ['photo-1545151414-8a948e1ea54f', 'photo-1632755898125-36cd72575dde', 'photo-1558365849-6ebd8b0454b2'] },
  'fin-dinner': { photos: ['photo-1699730148588-42aabafe9c72', 'photo-1699730148132-1409a3728479', 'photo-1699730148440-22fc68a96752', 'photo-1621112904887-419379ce6824', 'photo-1661006117166-6227bfc9c8b0', 'photo-1659690402718-ea07d943fd42', 'photo-1674076442296-2e2f3fcb0897', 'photo-1624639644206-41be180f3bcb'], mine: [2, 5], videos: [6] },
  'freshers-ball': { photos: ['photo-1517457373958-b7bdd4587205', 'photo-1645730826845-cd2ddec9984f', 'photo-1655459765544-39065b741a9e', 'photo-1708094018395-76f466d43a68', 'photo-1678967630352-c40c4b2960b8', 'photo-1657271522006-3d071c34e7aa', 'photo-1724003450399-d8142e845b0a'], mine: [1, 3, 5], videos: [4] },
  'tennis-champs': { photos: ['photo-1554068865-24cecd4e34b8', 'photo-1547934045-2942d193cb49', 'photo-1542144582-1ba00456b5e3', 'photo-1620742820748-87c09249a72a'], mine: [1] },
  'photo-walk': { photos: ['photo-1706849668074-98c6837b3462', 'photo-1713916909642-cb989be455ec', 'photo-1684273529559-57148e63c6e6', 'photo-1616320427957-4b5f5ab1739f', 'photo-1706393461368-e93f0b9ef777'], mine: [0, 1] },
  'wwb-sep': { photos: ['photo-1675716921224-e087a0cca69a', 'photo-1724866976376-4b217d29a462', 'photo-1672826980330-93ae1ac07b41', 'photo-1768508665663-fa483a0cb208', 'photo-1560439514-4e9645039924'], mine: [2] },
  'p-light-year': { photos: ['photo-1507643179773-3e975d7ac515', 'photo-1518998053901-5348d3961a04', 'photo-1503293050619-6048ffad0dc5', 'photo-1584966393708-db43bab83773', 'photo-1630416920377-e43f0f9dd28d', 'photo-1565876427310-0695a4ff03b7'], mine: [2] },
  'p-doubles-cup': { photos: ['photo-1499510318569-1a3d67dc3976', 'photo-1622163642998-1ea32b0bbc67', 'photo-1699117686612-ece525e4f91a', 'photo-1541744573515-478c959628a0'], mine: [0] },
  'p-trading-final': { photos: ['photo-1735679356705-7c06b780c7a4', 'photo-1769798643522-b0cb0d606a83', 'photo-1525969012662-65c31b88e6bd'] },
  'p-glendalough': { photos: ['photo-1599828586134-fbaff96c63d5', 'photo-1593739742226-5e5e2fdb1f1c', 'photo-1612735579580-a0dcddd2cf15', 'photo-1726091983472-a7da2540c492', 'photo-1615693191077-3da59a043b9b', 'photo-1621314450340-1ff21fa983e4'], mine: [1, 4] },
  'hack-spring': { photos: ['photo-1504384308090-c894fdcc538d', 'photo-1632910121591-29e2484c0259', 'photo-1631350397792-8e0c2de5b637', 'photo-1638029202288-451a89e0d55f', 'photo-1614643738701-b3e3b4245dbc'], mine: [0, 3], videos: [2] },
  'p-novice-debate': { photos: ['photo-1570616969692-54d6ba3d0397', 'photo-1756273488840-d585a91cbb99', 'photo-1594291714464-252c9da8447a'] },
  'p-product-design': { photos: ['photo-1731160807880-daf859b64420', 'photo-1640163561346-7778a2edf353', 'photo-1615454782617-e69bbd4f2969', 'photo-1637073849667-91120a924221'], mine: [1] },
  'p-founder-fireside': { photos: ['photo-1515187029135-18ee286d815b', 'photo-1563461661026-49631dd5d68e', 'photo-1550177977-ad69e8f3cae0', 'photo-1561489413-985b06da5bee'] },
  'p-coffee-jan': { photos: ['photo-1516197370049-569c4eaba1d6', 'photo-1653762378248-db45a1285697', 'photo-1640037984424-ac1a02cb742a', 'photo-1541475074124-af32f4cb0dbb', 'photo-1508766917616-d22f3f1eea14'], mine: [0] },
  'p-xmas-ball': { photos: ['photo-1597329204992-214518c367b3', 'photo-1585346230722-6b9df46d0d54', 'photo-1768508948462-58962b3ab650'], mine: [1] },
  'p-night-walk': { photos: ['photo-1586511686592-2074f7723e16', 'photo-1619627632408-fa2c6214fd41', 'photo-1629402618129-920b070f37f3', 'photo-1670170112968-e45115dd8ce1', 'photo-1665326219185-bb56534e86fb'], mine: [0, 2] },
  'p-tennis-clinic': { photos: ['photo-1595435742656-5272d0b3fa82', 'photo-1545809074-59472b3f5ecc', 'photo-1541744573515-478c959628a0', 'photo-1632755898125-36cd72575dde'], mine: [1] },
  'p-markets-intro': { photos: ['photo-1561489396-888724a1543d', 'photo-1540575467063-178a50c2df87', 'photo-1561491431-71b89da6056a', 'photo-1523582407565-efee5cf4a353'] },
  'p-societies-day': { photos: ['photo-1663162550974-aaf76bcdeedf', 'photo-1722608274456-f307b0ef27b6', 'photo-1517456793572-1d8efd6dc135'], mine: [0] },
};

/** Seed actions, replayed in date order through the domain layer. */
export const seedAttended = [
  'p-societies-day', 'p-markets-intro', 'p-tennis-clinic', 'p-night-walk', 'p-xmas-ball', 'p-coffee-jan',
  'p-founder-fireside', 'p-product-design', 'hack-spring', 'p-glendalough', 'p-trading-final', 'p-doubles-cup',
  'p-light-year', 'wwb-sep', 'photo-walk', 'tennis-champs', 'freshers-ball', 'fin-dinner',
];
export const seedMissed = ['p-novice-debate'];
export const seedOrganised = ['hack-spring'];
export const seedRegisteredUpcoming = ['tennis-live', 'fin-speaker', 'build-weekend', 'sunrise-hike'];
export const seedRedemptions = [{ perkId: 'priority-waitlist', at: '2026-09-24T10:00' }];

export const initiallyLiked = ['fin-speaker', 'freshers-ball'];
export const initiallySaved = ['winter-ball'];

export const profile: Profile = {
  name: 'Alex Morgan',
  handle: 'alexmorgan',
  university: 'Trinity College Dublin',
  course: 'Business & Economics',
  year: 'Year 2',
  bio: 'Always up for a tennis match, a good coffee, or meeting people building something interesting.',
  location: 'Dublin',
  link: 'linkedin.com/in/alexmorgan',
  photo: 'photo-1621274790572-7c32596bc67f',
  cover: 'photo-1734886975627-fc51b1d205c7',
  interests: ['tennis', 'coffee', 'startups', 'finance', 'photography'],
};

export const interestOptions = ['tennis', 'coffee', 'startups', 'finance', 'photography', 'tech', 'outdoors', 'debate', 'art', 'nightlife', 'design', 'engineering'];

/* ------------------------------ rewards ------------------------------ */

export const COIN_RULES = {
  attend: 50,
  organise: 75,
  milestoneEvery: 10,
  milestone: 100,
  achievement: { common: 25, rare: 50, epic: 100 },
} as const;

export const tiers: Tier[] = [
  { id: 'explorer', name: 'Explorer', minLifetime: 0, benefits: ['Your passport and first stamps'] },
  { id: 'regular', name: 'Regular', minLifetime: 500, benefits: ['Early notice when popular events open'] },
  { id: 'insider', name: 'Insider', minLifetime: 1200, benefits: ['Priority waitlist on capped society events', 'Insider-only perks in the rewards shop'] },
  { id: 'vip', name: 'VIP', minLifetime: 2500, benefits: ['First access to ball and gig ticket waves', 'One free perk each semester'] },
];

export const perks: Perk[] = [
  { id: 'committee-coffee', name: 'Committee coffee', cost: 150,
    description: 'A 20-minute coffee with a society committee of your choice.',
    howToUse: 'Show the code to the committee and agree a time — great if you want to get involved.' },
  { id: 'priority-waitlist', name: 'Priority waitlist pass', cost: 250,
    description: 'Move to the front of one waitlist for a capped event.',
    howToUse: 'Apply it from the event page once you’re on a waitlist.',
    fine: 'Doesn’t guarantee a spot — capacity and the organiser’s rules still apply.' },
  { id: 'early-reg', name: 'Early registration window', cost: 300,
    description: 'Register 24 hours before public release on events where organisers opt in.',
    howToUse: 'Eligible events show an “Early access” label while the window is open.' },
  { id: 'plus-one', name: 'Members’ night +1', cost: 400, minTier: 'insider',
    description: 'Bring a guest to one members-only night where the society allows guests.',
    howToUse: 'Add your guest’s name when you register.' },
  { id: 'merch', name: 'Society merch voucher', cost: 600,
    description: 'Swap for a tote or tee at a participating society’s stall.',
    howToUse: 'Show the code at the stall where it’s offered.' },
];

/* ------------------------------ achievements ------------------------------ */

export const achievementDefs: AchievementDef[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Your first verified event.', requirement: 'Check in at any event.', icon: 'footprints', rarity: 'common', goal: 1 },
  { id: 'regular', name: 'Regular', description: 'Ten verified events.', requirement: 'Attend 10 verified events.', icon: 'repeat', rarity: 'rare', goal: 10 },
  { id: 'social-explorer', name: 'Social Explorer', description: 'Events across five different communities.', requirement: 'Attend events hosted by 5 different societies.', icon: 'compass', rarity: 'rare', goal: 5 },
  { id: 'culture-collector', name: 'Culture Collector', description: 'Tried four kinds of event.', requirement: 'Attend events in 4 different categories.', icon: 'palette', rarity: 'rare', goal: 4 },
  { id: 'networking-pro', name: 'Networking Pro', description: 'Five professional events.', requirement: 'Attend 5 networking or careers events.', icon: 'briefcase', rarity: 'rare', goal: 5 },
  { id: 'community-builder', name: 'Community Builder', description: 'Helped organise an event.', requirement: 'Be verified as an organiser or volunteer by a society.', icon: 'hammer', rarity: 'epic', goal: 1 },
  { id: 'memory-maker', name: 'Memory Maker', description: 'Shared photos from three events you attended.', requirement: 'Add photos to the albums of 3 events you checked in to.', icon: 'camera', rarity: 'common', goal: 3 },
  { id: 'all-in', name: 'All In', description: 'Showed up to at least 90% of what you registered for.', requirement: 'Keep 90%+ attendance across 10 or more registrations.', icon: 'check', rarity: 'rare', goal: 10 },
  { id: 'court-regular', name: 'Court Regular', description: 'Four Tennis Club events.', requirement: 'Attend 4 Trinity Tennis Club events.', icon: 'racket', rarity: 'common', goal: 4 },
  { id: 'marathon', name: 'Marathon', description: '25 verified events.', requirement: 'Attend 25 verified events.', icon: 'trophy', rarity: 'epic', goal: 25 },
  { id: 'cartographer', name: 'Campus Cartographer', description: 'Events from twelve different societies.', requirement: 'Attend events hosted by 12 different societies.', icon: 'map', rarity: 'epic', goal: 12 },
];

export const notifications: Notification[] = [
  { id: 'n1', text: 'You’re registered for Friday Doubles — it’s on now. Check in at the courts.', time: '1h', societyId: 'tennis', target: { kind: 'event', id: 'tennis-live' } },
  { id: 'n2', text: 'Women Who Build starts at 18:30 tonight — Priya and Aoife are going.', time: '2h', people: ['priya', 'aoife'], target: { kind: 'event', id: 'wwb-oct' } },
  { id: 'n3', text: 'Cian, Hannah and 129 others are going to Speaker Night.', time: '3h', people: ['cian', 'hannah'], target: { kind: 'event', id: 'fin-speaker' } },
  { id: 'n4', text: 'New photos in the Members’ Welcome Dinner album.', time: '6d', societyId: 'finance', target: { kind: 'album', id: 'fin-dinner' } },
  { id: 'n5', text: 'Formula Trinity is recruiting business and ops roles on Monday.', time: '1d', societyId: 'formula', target: { kind: 'society', id: 'formula' } },
];
