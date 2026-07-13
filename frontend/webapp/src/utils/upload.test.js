import { describe, it, expect } from 'vitest';
import { resolveUploadedUrl } from './upload';

describe('resolveUploadedUrl', () => {
  it('converts relative upload paths to a hosted URL based on the API origin', () => {
    expect(resolveUploadedUrl('/uploads/test.pdf', 'http://localhost:5000/api')).toBe('http://localhost:5000/uploads/test.pdf');
  });

  it('leaves absolute URLs unchanged', () => {
    const hostedUrl = 'https://cdn.example.com/files/test.png';
    expect(resolveUploadedUrl(hostedUrl, 'http://localhost:5000/api')).toBe(hostedUrl);
  });
});
