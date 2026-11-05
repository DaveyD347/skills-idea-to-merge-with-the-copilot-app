export const BOOKMARKS_STORAGE_KEY = 'mona-bookmarks';
export const BOOKMARK_SEPARATOR = ' :: ';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SLUG_PATTERN = /^mona-[0-9A-Za-z]+$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError('A URL is required.');
  }

  const input = value.trim();
  const protocol = input.match(/^([a-z][a-z\d+.-]*):\/\//i)?.[1]?.toLowerCase();
  if (protocol && protocol !== 'http' && protocol !== 'https') {
    throw new TypeError('Only HTTP(S) URLs are supported.');
  }

  let url;
  try {
    url = new URL(protocol ? input : `https://${input}`);
  } catch {
    throw new TypeError('Enter a valid HTTP(S) URL.');
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
    throw new TypeError('Only HTTP(S) URLs are supported.');
  }

  return url.href;
}

export function parseStoredBookmarks(raw) {
  if (raw === null) return { bookmarks: [], hadInvalidData: false };

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return { bookmarks: [], hadInvalidData: true };
  }

  if (!Array.isArray(value)) {
    return { bookmarks: [], hadInvalidData: true };
  }

  const bookmarks = [];
  const slugs = new Set();
  let hadInvalidData = false;

  for (const record of value) {
    if (!record || typeof record !== 'object' || Array.isArray(record)
      || typeof record.url !== 'string'
      || typeof record.slug !== 'string'
      || !SLUG_PATTERN.test(record.slug)
      || slugs.has(record.slug)) {
      hadInvalidData = true;
      continue;
    }

    try {
      bookmarks.push({ url: normalizeUrl(record.url), slug: record.slug });
      slugs.add(record.slug);
    } catch {
      hadInvalidData = true;
    }
  }

  return { bookmarks, hadInvalidData };
}

function randomSlugCandidate() {
  const bytes = new Uint8Array(8);
  let suffix = '';

  while (suffix.length < 8) {
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
      for (const byte of bytes) {
        if (byte < 248) suffix += BASE62[byte % BASE62.length];
        if (suffix.length === 8) break;
      }
    } else {
      suffix += BASE62[Math.floor(Math.random() * BASE62.length)];
    }
  }

  return `mona-${suffix}`;
}

function encodeBase62(value) {
  let encoded = '';
  do {
    encoded = BASE62[value % BASE62.length] + encoded;
    value = Math.floor(value / BASE62.length);
  } while (value > 0);
  return encoded;
}

export function createUniqueSlug(existingSlugs, candidateFactory = randomSlugCandidate) {
  const used = new Set(existingSlugs);

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const candidate = candidateFactory();
    if (SLUG_PATTERN.test(candidate) && !used.has(candidate)) return candidate;
  }

  let counter = 0;
  while (used.has(`mona-${encodeBase62(counter)}`)) counter += 1;
  return `mona-${encodeBase62(counter)}`;
}

export function formatBookmark({ url, slug }) {
  return `${url}${BOOKMARK_SEPARATOR}${slug}`;
}
