import test from 'node:test';
import assert from 'node:assert/strict';
import { inferEmbedType, getYoutubeEmbedUrl, getEmbedsFromRichContent } from './mediaEmbeds.js';

test('detects image URLs', () => {
  assert.equal(inferEmbedType('https://example.com/photo.jpg'), 'image');
  assert.equal(inferEmbedType('https://encrypted-tbn0.gstatic.com/images?q=tbn:...'), 'image');
});

test('detects YouTube URLs', () => {
  assert.equal(getYoutubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  assert.equal(getYoutubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('detects PDF URLs', () => {
  assert.equal(inferEmbedType('https://example.com/report.pdf'), 'pdf');
});

test('collects embeds from rich content payloads', () => {
  const embeds = getEmbedsFromRichContent({
    rich_content: {
      html: '<p>hello</p>',
      embeds: [{ type: 'image', url: 'https://example.com/pic.png' }]
    }
  });

  assert.equal(embeds.length, 1);
  assert.equal(embeds[0].type, 'image');
});
