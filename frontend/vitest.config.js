import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: [
      'src/components/CommunityHub.test.jsx',
      'src/components/ThreadDetail.media.test.jsx',
      'src/components/ThreadDetail.vote.test.jsx',
      'src/utils/forumPersistence.test.js',
      'src/utils/upload.test.js'
    ]
  }
});
