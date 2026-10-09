import { ME } from './types';

/** Mock chat data for the prototype. Nothing here is sent anywhere. */
export interface ChatMessage {
  id: string;
  from: string; // person id, or ME
  text: string;
  time: string; // display label
}

export interface ChatThread {
  id: string;
  kind: 'event' | 'direct' | 'society';
  /** event id, person id or society id depending on kind */
  ref: string;
  title: string;
  members: string[];
  unread: number;
  pinned?: boolean;
  messages: ChatMessage[];
}

const m = (id: string, from: string, text: string, time: string): ChatMessage => ({ id, from, text, time });

export const chatThreads: ChatThread[] = [
  {
    id: 't-tennis', kind: 'event', ref: 'tennis-live', title: 'Friday Doubles Social', members: ['tomas', 'cian', 'niamh', 'jack'], unread: 3, pinned: true,
    messages: [
      m('a1', 'tomas', 'Courts 2 and 3 are ours until half five', '14:48'),
      m('a2', 'cian', 'On my way, saving you a racket', '14:55'),
      m('a3', ME, 'Leaving the library now, 5 mins', '15:02'),
      m('a4', 'niamh', 'Anyone want to swap partners after this set?', '15:40'),
      m('a5', 'tomas', 'Yes! Winners stay on', '15:41'),
      m('a6', 'cian', 'Door QR is by the clubhouse if you still need to check in', '15:52'),
    ],
  },
  {
    id: 't-wwb', kind: 'event', ref: 'wwb-oct', title: 'Women Who Build', members: ['priya', 'aoife', 'hannah'], unread: 1,
    messages: [
      m('b1', 'priya', 'Doors at 18:30, talks start at 7', '12:10'),
      m('b2', 'aoife', 'Walking over from Front Arch at 6:10 if anyone wants to join', '13:24'),
      m('b3', ME, 'I’ll come with you', '13:30'),
      m('b4', 'priya', 'Bring a laptop if you want feedback on a project', '15:15'),
    ],
  },
  {
    id: 't-fin', kind: 'event', ref: 'fin-speaker', title: 'Speaker Night', members: ['cian', 'aoife', 'hannah'], unread: 0,
    messages: [
      m('c1', 'hannah', 'Chat is open! Tuesday 19:00 in the Edmund Burke', 'Thu'),
      m('c2', 'cian', 'Are questions being collected beforehand?', 'Thu'),
      m('c3', 'hannah', 'Yes, drop them here and we’ll pass them on', 'Thu'),
      m('c4', ME, 'Would love to hear about the grad programme timeline', 'Thu'),
    ],
  },
  {
    id: 't-hike', kind: 'event', ref: 'sunrise-hike', title: 'Sunrise Hike', members: ['liam', 'niamh'], unread: 2,
    messages: [
      m('d1', 'liam', 'Bus leaves Front Arch 06:15 sharp on Sunday', 'Wed'),
      m('d2', 'niamh', 'Forecast is clear but cold, bring layers', '11:02'),
      m('d3', 'liam', 'And a headtorch for the first half hour', '11:05'),
    ],
  },
  {
    id: 't-build', kind: 'event', ref: 'build-weekend', title: 'Build Weekend', members: ['priya', 'daniel'], unread: 0,
    messages: [
      m('e1', 'daniel', 'Team of three so far, need a designer', 'Tue'),
      m('e2', 'priya', 'I can do design and front end', 'Tue'),
      m('e3', ME, 'Great, I’ll take hardware and the pitch', 'Tue'),
    ],
  },
  {
    id: 't-formula', kind: 'society', ref: 'formula', title: 'Formula Trinity', members: ['daniel', 'tomas'], unread: 0,
    messages: [
      m('f1', 'daniel', 'Recruitment evening is Monday 18:00 in Parsons', 'Mon'),
      m('f2', 'tomas', 'Suspension subteam meets right after', 'Mon'),
    ],
  },
  {
    id: 't-cian', kind: 'direct', ref: 'cian', title: 'Cian Murphy', members: ['cian'], unread: 1,
    messages: [
      m('g1', ME, 'Are you going to Speaker Night?', 'Yesterday'),
      m('g2', 'cian', 'Yep, got us seats near the front', 'Yesterday'),
      m('g3', 'cian', 'Doubles rematch next Friday?', '15:58'),
    ],
  },
  {
    id: 't-maya', kind: 'direct', ref: 'maya', title: 'Maya Fischer', members: ['maya'], unread: 0,
    messages: [
      m('h1', 'maya', 'Coffee crawl on Sunday, are you in?', 'Wed'),
      m('h2', ME, 'If I survive the hike first', 'Wed'),
      m('h3', 'maya', 'Ha, you’ll need the caffeine then', 'Wed'),
    ],
  },
  {
    id: 't-sofia', kind: 'direct', ref: 'sofia', title: 'Sofia Marchetti', members: ['sofia'], unread: 0,
    messages: [
      m('i1', 'sofia', 'Sent you the photos from Freshers’ Ball', 'Mon'),
      m('i2', ME, 'These are brilliant, thank you', 'Mon'),
    ],
  },
];

export const mockReplies = ['Sounds good!', 'See you there', 'Perfect, thanks', 'Count me in', 'Ha, same', 'On it'];
