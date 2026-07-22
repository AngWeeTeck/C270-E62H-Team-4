import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ThreadDetail from './ThreadDetail';

describe('ThreadDetail voting', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not remove an existing upvote when the same button is pressed again', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ replies: [] })
    });

    render(
      <ThreadDetail
        thread={{
          id: 42,
          title: 'Sample thread',
          author: 'student1',
          content: 'Example',
          reply_count: 0,
          score: 1,
          userVote: 1,
          rich_content: { html: '<p>Example</p>' }
        }}
        onClose={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '▲' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/votes/thread/42/vote'),
      expect.objectContaining({
        body: JSON.stringify({ voteValue: 0 })
      })
    );
  });
});
