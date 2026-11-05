import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOKMARK_SEPARATOR,
  createUniqueSlug,
  formatBookmark,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks.js';

test('normalizes bare domains and preserves HTTP(S) URLs', () => {
  assert.equal(normalizeUrl(' example.com/path '), 'https://example.com/path');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
  assert.equal(normalizeUrl('https://Example.com'), 'https://example.com/');
});

test('rejects empty, malformed, and non-HTTP(S) URLs', () => {
  for (const value of ['', '   ', 'javascript://alert(1)', 'http://', 'https://exa mple.com']) {
    assert.throws(() => normalizeUrl(value));
  }
});

test('restores empty storage and reports malformed, legacy, non-array, and invalid records', () => {
  assert.deepEqual(parseStoredBookmarks(null), { bookmarks: [], hadInvalidData: false });
  assert.deepEqual(parseStoredBookmarks('[]'), { bookmarks: [], hadInvalidData: false });
  assert.deepEqual(parseStoredBookmarks('not-json'), { bookmarks: [], hadInvalidData: true });
  assert.deepEqual(parseStoredBookmarks('{"url":"https://legacy.example"}'), {
    bookmarks: [],
    hadInvalidData: true,
  });
  assert.deepEqual(parseStoredBookmarks('"legacy-value"'), {
    bookmarks: [],
    hadInvalidData: true,
  });
  assert.deepEqual(parseStoredBookmarks(JSON.stringify([
    { url: 'https://good.example', slug: 'mona-valid1' },
    { url: 'javascript:alert(1)', slug: 'mona-bad' },
    { url: 'https://duplicate.example', slug: 'mona-valid1' },
    { url: 'https://bad-slug.example', slug: 'bad' },
  ])), {
    bookmarks: [{ url: 'https://good.example/', slug: 'mona-valid1' }],
    hadInvalidData: true,
  });
});

test('generates unique base62 slugs and retries collisions', () => {
  const candidates = ['mona-existing', 'mona-Az09'];
  assert.equal(
    createUniqueSlug(['mona-existing'], () => candidates.shift()),
    'mona-Az09',
  );
  assert.match(createUniqueSlug([], () => 'mona-7fk2'), /^mona-[0-9A-Za-z]+$/);
});

test('formats bookmarks with the exact visible separator', () => {
  assert.equal(BOOKMARK_SEPARATOR, ' :: ');
  assert.equal(
    formatBookmark({ url: 'https://example.com/', slug: 'mona-Ab12' }),
    'https://example.com/ :: mona-Ab12',
  );
});
