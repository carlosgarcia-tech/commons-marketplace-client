import '@testing-library/jest-dom/vitest';

// jsdom no implementa matchMedia; los tests no necesitan el análisis real.
const mediaQueries: Record<string, MediaQueryList> = {};
beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => {
    mediaQueries[query] ??= {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
    return mediaQueries[query];
  });
});
