import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadDetail from './ThreadDetail';

describe('ThreadDetail media rendering', () => {
  it('renders an image element for image embeds', () => {
    const thread = {
      id: 1,
      title: 'Sample thread',
      author: 'student1',
      content: 'Example',
      reply_count: 0,
      rich_content: {
        html: '<p>Example</p>',
        embeds: [
          {
            type: 'image',
            url: 'https://cdn-images.dzcdn.net/images/artist/593c383076ef9f93e35122d66a55652a/1900x1900-000000-80-0-0.jpg',
            title: 'Artist image'
          }
        ]
      }
    };

    render(<ThreadDetail thread={thread} onClose={() => {}} />);

    const image = screen.getByAltText('Artist image');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe(thread.rich_content.embeds[0].url);
  });
});
