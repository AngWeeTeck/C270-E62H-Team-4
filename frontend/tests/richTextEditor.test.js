// Mock DOM for Node.js environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="editor"></div></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const RichTextEditor = require('../components/RichTextEditor');

describe('RichTextEditor Component', () => {
  let editor;

  beforeEach(() => {
    document.body.innerHTML = '<div id="editor"></div>';
    editor = new RichTextEditor('editor');
  });

  describe('Initialization', () => {
    test('should initialize with toolbar and textarea', () => {
      const toolbar = document.querySelector('.editor-toolbar');
      const textarea = document.querySelector('.editor-textarea');

      expect(toolbar).toBeTruthy();
      expect(textarea).toBeTruthy();
    });

    test('should have format buttons', () => {
      const boldBtn = document.getElementById('bold-btn');
      const italicBtn = document.getElementById('italic-btn');
      const codeBtn = document.getElementById('code-btn');
      const imageBtn = document.getElementById('image-btn');
      const linkBtn = document.getElementById('link-btn');

      expect(boldBtn).toBeTruthy();
      expect(italicBtn).toBeTruthy();
      expect(codeBtn).toBeTruthy();
      expect(imageBtn).toBeTruthy();
      expect(linkBtn).toBeTruthy();
    });

    test('should have hidden file input for images', () => {
      const imageInput = document.getElementById('image-input');
      expect(imageInput).toBeTruthy();
      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*');
    });
  });

  describe('Content Management', () => {
    test('should update content when textarea changes', () => {
      const textarea = document.querySelector('.editor-textarea');
      const testContent = 'Test content';

      textarea.value = testContent;
      textarea.dispatchEvent(new Event('input'));

      expect(editor.content).toBe(testContent);
    });

    test('should get content with formatting', () => {
      const textarea = document.querySelector('.editor-textarea');
      textarea.value = 'Test content';
      textarea.dispatchEvent(new Event('input'));

      editor.formatting.bold.push({ start: 0, end: 4 });
      editor.embeds.push({ type: 'youtube', url: 'https://youtube.com/watch?v=123', title: 'Video' });

      const content = editor.getContent();
      expect(content.text).toBe('Test content');
      expect(content.formatting.bold.length).toBe(1);
      expect(content.embeds.length).toBe(1);
    });

    test('should set content from external source', () => {
      const content = 'New content';
      const formatting = { bold: [{ start: 0, end: 3 }], italic: [], codeBlocks: [] };
      const embeds = [{ type: 'image', url: 'https://example.com/img.jpg', title: 'Image' }];

      editor.setContent(content, formatting, embeds);

      const textarea = document.querySelector('.editor-textarea');
      expect(textarea.value).toBe('New content');
      expect(editor.formatting.bold.length).toBe(1);
      expect(editor.embeds.length).toBe(1);
    });
  });

  describe('Text Formatting', () => {
    test('should parse bold formatting', () => {
      const content = '**bold text**';
      const parsed = editor.parseContent(content);
      expect(parsed).toContain('<strong>bold text</strong>');
    });

    test('should parse italic formatting', () => {
      const content = '*italic text*';
      const parsed = editor.parseContent(content);
      expect(parsed).toContain('<em>italic text</em>');
    });

    test('should parse code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';
      const parsed = editor.parseContent(content);
      expect(parsed).toContain('<pre><code');
      expect(parsed).toContain('javascript');
      expect(parsed).toContain('const x = 1;');
    });

    test('should parse images', () => {
      const content = '![alt text](https://example.com/image.jpg)';
      const parsed = editor.parseContent(content);
      expect(parsed).toContain('<img');
      expect(parsed).toContain('src="https://example.com/image.jpg"');
    });

    test('should parse links', () => {
      const content = '[Click here](https://example.com)';
      const parsed = editor.parseContent(content);
      expect(parsed).toContain('<a href="https://example.com"');
      expect(parsed).toContain('Click here');
    });
  });

  describe('Code Block Insertion', () => {
    test('should insert code block with language', () => {
      // Mock prompt
      global.prompt = jest.fn().mockReturnValue('javascript');

      editor.insertCodeBlock();

      const textarea = document.querySelector('.editor-textarea');
      expect(textarea.value).toContain('```javascript');
    });

    test('should handle cancelled prompt', () => {
      global.prompt = jest.fn().mockReturnValue(null);

      const initialValue = document.querySelector('.editor-textarea').value;
      editor.insertCodeBlock();

      const textarea = document.querySelector('.editor-textarea');
      // Should not change when cancelled
      expect(textarea.value).toBe(initialValue);
    });
  });

  describe('Media Embedding', () => {
    test('should insert link with type detection', () => {
      global.prompt = jest.fn()
        .mockReturnValueOnce('https://youtube.com/watch?v=dQw4w9WgXcQ')
        .mockReturnValueOnce('Video Title');

      editor.insertLink();

      expect(editor.embeds.length).toBe(1);
      expect(editor.embeds[0].type).toBe('youtube');
      expect(editor.embeds[0].url).toContain('youtube.com');
    });

    test('should handle PDF links', () => {
      global.prompt = jest.fn()
        .mockReturnValueOnce('https://example.com/document.pdf')
        .mockReturnValueOnce('PDF Document');

      editor.insertLink();

      expect(editor.embeds.length).toBe(1);
      expect(editor.embeds[0].type).toBe('pdf');
    });

    test('should handle cancelled link insertion', () => {
      global.prompt = jest.fn().mockReturnValue(null);

      const initialEmbeds = editor.embeds.length;
      editor.insertLink();

      // Should not add embed when cancelled
      expect(editor.embeds.length).toBe(initialEmbeds);
    });
  });

  describe('Preview Rendering', () => {
    test('should render preview with all formatting', () => {
      const textarea = document.querySelector('.editor-textarea');
      textarea.value = '**Bold** and *italic* with [link](https://example.com)';
      textarea.dispatchEvent(new Event('input'));

      editor.renderPreview();

      const preview = document.getElementById('preview-container');
      expect(preview).toBeTruthy();
      expect(preview.style.display).toBe('block');
      expect(preview.innerHTML).toContain('<strong>');
      expect(preview.innerHTML).toContain('<em>');
      expect(preview.innerHTML).toContain('<a href=');
    });
  });
});
