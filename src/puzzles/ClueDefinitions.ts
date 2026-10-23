// ============================================================
// ClueDefinitions.ts — Story text and manuscript content
// ============================================================

import type { ManuscriptContent, RoomId } from '../game/GameTypes';

export const ENTRANCE_MANUSCRIPT: ManuscriptContent = {
  title: 'A Message Left Behind',
  body: [
    'If you\'re reading this, you made it in.',
    '',
    'I built this place — every corridor, every locked door.',
    'And then the glitch swallowed me whole.',
    '',
    'Six rooms. Six codes. Each one hidden among the wreckage.',
    'Three of those codes carry a single digit, marked in red.',
    'Find those three digits. They are your way out.',
    '',
    'The seventh door will only open when you know all three.',
    'You have four chances to get it right.',
    'After that… we both stay here forever.',
    '',
    '— The Developer',
  ],
};

export const ROOM_MANUSCRIPTS: Record<RoomId, ManuscriptContent> = {
  1: {
    title: 'Room 1 — The Waiting Room',
    body: [
      'People waited here once.',
      'Now only the numbers remain.',
      'Look carefully at the objects in this room.',
      'The code is close — closer than you think.',
    ],
  },
  2: {
    title: 'Room 2 — The Archive',
    body: [
      'Every document. Every record.',
      'Systematically corrupted.',
      'But the code survived the purge.',
      'It always does.',
    ],
  },
  3: {
    title: 'Room 3 — The Laboratory',
    body: [
      'Experiments ran here. Data was collected.',
      'The result you need is still written on the wall.',
      'Or maybe inside a drawer.',
      'You\'ll know it when you see it.',
    ],
  },
  4: {
    title: 'Room 4 — The Dormitory',
    body: [
      'Someone slept here. Someone studied here.',
      'The last thing they wrote before the glitch…',
      '...was the code.',
    ],
  },
  5: {
    title: 'Room 5 — The Server Room',
    body: [
      'The machines are still running.',
      'Somewhere in the noise, a signal.',
      'Three digits. They were never deleted.',
    ],
  },
  6: {
    title: 'Room 6 — The Director\'s Office',
    body: [
      'The person who ran this place left in a hurry.',
      'Left everything behind.',
      'Including the last combination they ever wrote down.',
    ],
  },
  7: {
    title: 'Room 7 — The Exit',
    body: [
      'You made it this far.',
      'Three digits. That\'s all that stands between you and freedom.',
      'Enter the combination.',
      'The way out is waiting.',
    ],
  },
};

export const CLUE_HINT_TEXT: Record<RoomId, string> = {
  1: 'A sticky note on the reception desk…',
  2: 'A faded label on a filing cabinet…',
  3: 'A readout on the experiment board…',
  4: 'Numbers scrawled on a notebook cover…',
  5: 'A blinking display on the server rack…',
  6: 'A code written on a desk calendar…',
  7: 'The final lock panel…',
};
