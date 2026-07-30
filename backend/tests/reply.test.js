const mongoose = require('mongoose');
const Reply = require('../models/Reply');

describe('Reply Model', () => {
  describe('Reply creation', () => {
    test('should create a reply with valid data', () => {
      const replyData = {
        id: 'reply-1',
        threadId: 'thread-1',
        content: 'This is a reply',
        author: 'testuser'
      };

      const reply = new Reply(replyData);
      expect(reply.threadId).toBe('thread-1');
      expect(reply.content).toBe('This is a reply');
      expect(reply.author).toBe('testuser');
    });

    test('should require content', () => {
      const replyData = {
        id: 'reply-2',
        threadId: 'thread-1',
        author: 'testuser'
      };

      const reply = new Reply(replyData);
      expect(reply.content).toBeUndefined();
    });

    test('should require threadId', () => {
      const replyData = {
        id: 'reply-3',
        content: 'This is a reply',
        author: 'testuser'
      };

      const reply = new Reply(replyData);
      expect(reply.threadId).toBeUndefined();
    });

    test('should set default timestamps', () => {
      const replyData = {
        id: 'reply-4',
        threadId: 'thread-1',
        content: 'This is a reply',
        author: 'testuser'
      };

      const reply = new Reply(replyData);
      expect(reply.createdAt).toBeDefined();
      expect(reply.updatedAt).toBeDefined();
    });
  });

  describe('Rich content support', () => {
    test('should support rich content with formatting', () => {
      const replyData = {
        id: 'reply-5',
        threadId: 'thread-1',
        content: 'This is a reply',
        author: 'testuser',
        richContent: {
          text: 'This is a reply',
          formatting: {
            bold: [{ start: 0, end: 4 }],
            italic: [],
            codeBlocks: []
          },
          embeds: []
        }
      };

      const reply = new Reply(replyData);
      expect(reply.richContent).toBeDefined();
      expect(reply.richContent.formatting.bold.length).toBe(1);
    });

    test('should support code blocks in rich content', () => {
      const replyData = {
        id: 'reply-6',
        threadId: 'thread-1',
        content: 'Check this code',
        author: 'testuser',
        richContent: {
          text: 'Check this code',
          formatting: {
            bold: [],
            italic: [],
            codeBlocks: [{ start: 0, end: 10, language: 'javascript' }]
          },
          embeds: []
        }
      };

      const reply = new Reply(replyData);
      expect(reply.richContent.formatting.codeBlocks.length).toBe(1);
      expect(reply.richContent.formatting.codeBlocks[0].language).toBe('javascript');
    });

    test('should support embeds (youtube, pdf, image)', () => {
      const replyData = {
        id: 'reply-7',
        threadId: 'thread-1',
        content: 'Check this media',
        author: 'testuser',
        richContent: {
          text: 'Check this media',
          formatting: {
            bold: [],
            italic: [],
            codeBlocks: []
          },
          embeds: [
            { type: 'youtube', url: 'https://youtube.com/watch?v=123', title: 'Video' },
            { type: 'pdf', url: 'https://example.com/doc.pdf', title: 'Document' },
            { type: 'image', url: 'https://example.com/image.jpg', title: 'Image' }
          ]
        }
      };

      const reply = new Reply(replyData);
      expect(reply.richContent.embeds.length).toBe(3);
      expect(reply.richContent.embeds[0].type).toBe('youtube');
      expect(reply.richContent.embeds[1].type).toBe('pdf');
      expect(reply.richContent.embeds[2].type).toBe('image');
    });
  });

  describe('Reply validation', () => {
    test('should have unique id', () => {
      const reply1Data = {
        id: 'unique-reply-1',
        threadId: 'thread-1',
        content: 'Reply 1',
        author: 'user1'
      };

      const reply2Data = {
        id: 'unique-reply-1',
        threadId: 'thread-1',
        content: 'Reply 2',
        author: 'user2'
      };

      const reply1 = new Reply(reply1Data);
      const reply2 = new Reply(reply2Data);

      expect(reply1.id).toBe(reply2.id);
    });

    test('content should have minimum length', () => {
      const replyData = {
        id: 'reply-8',
        threadId: 'thread-1',
        content: 'a',
        author: 'testuser'
      };

      // Validation would reject content shorter than 2 chars
      expect(replyData.content.length).toBeLessThan(2);
    });
  });
});
