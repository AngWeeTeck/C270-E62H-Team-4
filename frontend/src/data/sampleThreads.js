export const sampleRepliesByThreadId = {
  101: [
    {
      id: 1001,
      author: 'Mina, RP 2A',
      content: 'I can help with a simple structure for the pitch slides.',
      created_at: '2026-07-12T09:00:00.000Z',
      rich_content: { html: '<p>I can help with a simple structure for the pitch slides.</p>' }
    },
    {
      id: 1002,
      author: 'Jared, RP 2B',
      content: 'We should keep the opening to one clear problem statement.',
      created_at: '2026-07-12T10:15:00.000Z',
      rich_content: { html: '<p>We should keep the opening to one clear problem statement.</p>' }
    }
  ],
  102: [
    {
      id: 1003,
      author: 'Ravi, RP 3B',
      content: 'A short story-based example usually lands well with classmates.',
      created_at: '2026-07-12T08:30:00.000Z',
      rich_content: { html: '<p>A short story-based example usually lands well with classmates.</p>' }
    }
  ],
  103: [
    {
      id: 1004,
      author: 'Nora, RP 1C',
      content: 'I shared a sketch with the group; it might help with the review.',
      created_at: '2026-07-12T07:45:00.000Z',
      rich_content: { html: '<p>I shared a sketch with the group; it might help with the review.</p>' }
    }
  ]
};

export const sampleThreads = [
  {
    id: 101,
    title: 'RP students: how should we prep for the capstone pitch?',
    author: 'Alicia, RP 2A',
    reply_count: sampleRepliesByThreadId[101].length,
    content: 'We are sharing slides and talking through the pitch flow before Friday.',
    rich_content: {
      html: '<p>We are sharing slides and talking through the pitch flow before Friday.</p>'
    }
  },
  {
    id: 102,
    title: 'Course 3B discussion: best ways to explain AI ethics in class',
    author: 'Ben, RP 3B',
    reply_count: sampleRepliesByThreadId[102].length,
    content: 'The group wants clearer examples for a 10-minute presentation this week.',
    rich_content: {
      html: '<p>The group wants clearer examples for a 10-minute presentation this week.</p>'
    }
  },
  {
    id: 103,
    title: 'Anyone else struggling with the new UI assignment brief?',
    author: 'Chloe, RP 1C',
    reply_count: sampleRepliesByThreadId[103].length,
    content: 'A few of us are comparing notes and mock screens before the review session.',
    rich_content: {
      html: '<p>A few of us are comparing notes and mock screens before the review session.</p>'
    }
  }
];
