import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LocalStorageAdapter,
  InMemoryAdapter,
  createStorage,
} from './storage';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  it('saves and loads data with JSON serialization', () => {
    const data = { name: 'test', count: 42 };
    adapter.save('key', data);
    expect(adapter.load('key')).toEqual(data);
  });

  it('returns null for missing keys', () => {
    expect(adapter.load('nonexistent')).toBeNull();
  });

  it('handles corrupted data gracefully', () => {
    localStorage.setItem('bad', 'not valid json{{{');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = adapter.load('bad');
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('removes corrupted data from storage on load failure', () => {
    localStorage.setItem('bad', '{broken');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    adapter.load('bad');
    expect(localStorage.getItem('bad')).toBeNull();
    vi.restoreAllMocks();
  });

  it('clears all storage', () => {
    adapter.save('a', 1);
    adapter.save('b', 2);
    adapter.clear();
    expect(adapter.load('a')).toBeNull();
    expect(adapter.load('b')).toBeNull();
  });

  it('reports availability correctly', () => {
    expect(adapter.isAvailable()).toBe(true);
  });

  it('handles quota exceeded errors gracefully on save', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    adapter.save('key', 'data');
    expect(consoleSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('InMemoryAdapter', () => {
  let adapter: InMemoryAdapter;

  beforeEach(() => {
    adapter = new InMemoryAdapter();
  });

  it('saves and loads data', () => {
    const data = { items: [1, 2, 3] };
    adapter.save('key', data);
    expect(adapter.load('key')).toEqual(data);
  });

  it('returns null for missing keys', () => {
    expect(adapter.load('missing')).toBeNull();
  });

  it('clears all data', () => {
    adapter.save('x', 'hello');
    adapter.clear();
    expect(adapter.load('x')).toBeNull();
  });

  it('is always available', () => {
    expect(adapter.isAvailable()).toBe(true);
  });
});

describe('createStorage', () => {
  it('returns LocalStorageAdapter when localStorage is available', () => {
    const storage = createStorage();
    expect(storage).toBeInstanceOf(LocalStorageAdapter);
  });

  it('returns InMemoryAdapter when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const storage = createStorage();
    expect(storage).toBeInstanceOf(InMemoryAdapter);
    vi.restoreAllMocks();
  });
});
