import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CommunityHub from './CommunityHub';

describe('CommunityHub', () => {
  it('switches tabs and lets users join a community', async () => {
    render(<CommunityHub />);

    expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Social Communities').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('tab', { name: /social communities/i }));

    expect(screen.getAllByText('Join').length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: /^join$/i })[0]);

    expect(screen.getAllByText('Joined').length).toBeGreaterThan(0);
  });

  it('notifies the parent immediately when a community is toggled', () => {
    const onCommunityAction = vi.fn();
    render(<CommunityHub onCommunityAction={onCommunityAction} />);

    fireEvent.click(screen.getByRole('tab', { name: /social communities/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /^join$/i })[0]);

    expect(onCommunityAction).toHaveBeenCalledWith('Frontend Builders', true);
    fireEvent.click(screen.getByRole('tab', { name: /notifications/i }));
    expect(screen.getByText('Community joined')).toBeInTheDocument();
  });

  it('adds only one notification when an action fires once', () => {
    const parentNotifier = (message) => {
      window.__communityHub?.feedNotification('Activity', message);
    };

    render(<CommunityHub onNotification={parentNotifier} />);

    window.__communityHub?.announceActivity('thread-created', { title: 'My test thread' });

    waitFor(() => {
      expect(screen.getAllByText('New thread created').length).toBe(1);
    });
  });
});
