/**
 * Storage abstraction layer for persisting progress data.
 * Provides a LocalStorage adapter with JSON serialization and
 * an in-memory fallback when LocalStorage is unavailable.
 */

/**
 * Interface for storage adapters that persist key-value data.
 */
export interface StorageAdapter {
  save(key: string, data: unknown): void;
  load<T>(key: string): T | null;
  clear(): void;
  isAvailable(): boolean;
}

/**
 * Storage adapter backed by the browser's Local Storage API.
 * Handles JSON serialization/deserialization with graceful error handling
 * for quota exceeded and corrupted data scenarios.
 */
export class LocalStorageAdapter implements StorageAdapter {
  save(key: string, data: unknown): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      // Handle QuotaExceededError or serialization errors gracefully
      console.error(`[Storage] Failed to save key "${key}":`, error);
    }
  }

  load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      // Corrupted data fails JSON parsing — discard and log
      console.error(
        `[Storage] Failed to load key "${key}", discarding corrupted data:`,
        error
      );
      localStorage.removeItem(key);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[Storage] Failed to clear storage:', error);
    }
  }

  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * In-memory storage adapter using a Map. Used as a fallback when
 * Local Storage is unavailable. Data is lost when the session ends.
 */
export class InMemoryAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  save(key: string, data: unknown): void {
    try {
      const serialized = JSON.stringify(data);
      this.store.set(key, serialized);
    } catch (error) {
      console.error(`[Storage] Failed to save key "${key}" in memory:`, error);
    }
  }

  load<T>(key: string): T | null {
    const raw = this.store.get(key);
    if (raw === undefined) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(
        `[Storage] Failed to parse key "${key}" from memory, discarding:`,
        error
      );
      this.store.delete(key);
      return null;
    }
  }

  clear(): void {
    this.store.clear();
  }

  isAvailable(): boolean {
    return true;
  }
}

/**
 * Factory function that returns a LocalStorageAdapter if Local Storage is
 * available, otherwise falls back to an InMemoryAdapter.
 */
export function createStorage(): StorageAdapter {
  const adapter = new LocalStorageAdapter();
  if (adapter.isAvailable()) {
    return adapter;
  }
  return new InMemoryAdapter();
}
