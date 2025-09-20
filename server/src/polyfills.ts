/**
 * Ensure a global `crypto` exists before any framework/module loads that expects it.
 * - If globalThis.crypto is undefined, expose Node's WebCrypto at globalThis.crypto via defineProperty.
 * - DO NOT overwrite if it already exists (it may be a read-only getter in newer Node versions).
 */
try {
  const g: any = globalThis as any;
  if (typeof g.crypto === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webcrypto } = require('crypto');
    if (webcrypto) {
      Object.defineProperty(g, 'crypto', {
        value: webcrypto,
        writable: false,
        enumerable: false,
        configurable: true,
      });
    }
  }
} catch {
  // best-effort
}

export {};