/**
 * RichTextEditor Component
 * Features:
 * - Format text (bold, italic)
 * - Insert code blocks
 * - Upload images
 * - Embed links (YouTube/PDF)
 * - Render formatted content
 */

class RichTextEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.content = '';
    this.formatting = {
      bold: [],
      italic: [],
      codeBlocks: []
    };
    this.embeds = [];
    
    this.initializeEditor();
  }

  initializeEditor() {
    this.container.innerHTML = `
      <div class="rich-text-editor">
        <div class="editor-toolbar">
          <button id="bold-btn" class="format-btn" title="Bold">
            <strong>B</strong>
          </button>
          <button id="italic-btn" class="format-btn" title="Italic">
            <em>I</em>
          </button>
          <button id="code-btn" class="format-btn" title="Code Block">
            &lt;/&gt;
          </button>
          <button id="image-btn" class="format-btn" title="Upload Image">
            🖼️
          </button>
          <button id="link-btn" class="format-btn" title="Embed Link">
            🔗
          </button>
          <input type="file" id="image-input" accept="image/*" style="display:none;">
        </div>
        <textarea id="editor-textarea" class="editor-textarea" placeholder="Enter your content here..."></textarea>
        <div id="preview-container" class="preview-container" style="display:none;"></div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const codeBtn = document.getElementById('code-btn');
    const imageBtn = document.getElementById('image-btn');
    const linkBtn = document.getElementById('link-btn');
    const textarea = document.getElementById('editor-textarea');
    const imageInput = document.getElementById('image-input');

    if (boldBtn) boldBtn.addEventListener('click', () => this.toggleFormat('bold'));
    if (italicBtn) italicBtn.addEventListener('click', () => this.toggleFormat('italic'));
    if (codeBtn) codeBtn.addEventListener('click', () => this.insertCodeBlock());
    if (imageBtn) imageBtn.addEventListener('click', () => imageInput.click());
    if (linkBtn) linkBtn.addEventListener('click', () => this.insertLink());
    if (textarea) textarea.addEventListener('input', (e) => this.updateContent(e.target.value));
    if (imageInput) imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
  }

  toggleFormat(format) {
    const textarea = document.getElementById('editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      this.formatting[format].push({ start, end });
      this.renderPreview();
    }
  }

  insertCodeBlock() {
    const language = prompt('Enter language (e.g., javascript, python, html):', 'javascript');
    if (language) {
      const textarea = document.getElementById('editor-textarea');
      const codeBlock = `\`\`\`${language}\n\`\`\``;
      textarea.value += '\n' + codeBlock + '\n';
      this.updateContent(textarea.value);
    }
  }

  insertLink() {
    const url = prompt('Enter URL (YouTube video or PDF):');
    const title = prompt('Enter title:');
    
    if (url && title) {
      let type = 'pdf';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'youtube';
      }

      this.embeds.push({
        type,
        url,
        title
      });

      const textarea = document.getElementById('editor-textarea');
      textarea.value += `\n[${title}](${url})\n`;
      this.updateContent(textarea.value);
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const textarea = document.getElementById('editor-textarea');
        textarea.value += `\n![image](${imageUrl})\n`;
        
        this.embeds.push({
          type: 'image',
          url: imageUrl,
          title: file.name
        });

        this.updateContent(textarea.value);
      };
      reader.readAsDataURL(file);
    }
  }

  updateContent(text) {
    this.content = text;
  }

  renderPreview() {
    const preview = document.getElementById('preview-container');
    if (preview) {
      preview.innerHTML = this.parseContent(this.content);
      preview.style.display = 'block';
    }
  }

  parseContent(text) {
    let html = text;

    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
    });

    // Replace images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="embed-image">');

    // Replace links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    return html;
  }

  getContent() {
    return {
      text: this.content,
      formatting: this.formatting,
      embeds: this.embeds
    };
  }

  setContent(content, formatting, embeds) {
    const textarea = document.getElementById('editor-textarea');
    if (textarea) {
      textarea.value = content;
      this.content = content;
    }
    this.formatting = formatting || this.formatting;
    this.embeds = embeds || [];
    this.renderPreview();
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}
