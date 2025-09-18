import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder
if (typeof global.TextEncoder === "undefined") {
   global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
}
if (typeof window.TextEncoder === "undefined") {
   window.TextEncoder = global.TextEncoder;
}

// Polyfill for TextDecoder
if (typeof global.TextDecoder === "undefined") {
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
   // @ts-expect-error
   global.TextDecoder = TextDecoder;
}
if (typeof window.TextDecoder === "undefined") {
   window.TextDecoder = global.TextDecoder;
}

Object.defineProperty(window, "matchMedia", {
   writable: true,
   value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
   })),
});
