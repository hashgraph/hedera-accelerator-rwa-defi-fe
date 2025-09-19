import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";
import type { Config } from "wagmi";

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

// Provide default mocks for wagmi to avoid requiring WagmiProvider in tests
jest.mock("wagmi", () => {
   // eslint-disable-next-line @typescript-eslint/no-var-requires
   const actual = jest.requireActual("wagmi");
   return {
      ...actual,
      useAccount: jest.fn(() => {
         const addr = (global as any).__TEST_WAGMI_ADDRESS__ as string | undefined;
         return { address: addr, isConnected: Boolean(addr) };
      }),
      WagmiProvider: actual.WagmiProvider,
   } as typeof actual;
});

jest.mock("wagmi/actions", () => {
   return {
      readContract: jest.fn(async () => undefined),
      writeContract: jest.fn(async (_config: Config, _params: any) => "0xdeadbeef"),
      waitForTransactionReceipt: jest.fn(
         async (_config: Config, { hash }: { hash: `0x${string}` }) => ({
            transactionHash: hash ?? ("0xdeadbeef" as const),
            status: "success",
            logs: [],
         }),
      ),
   };
});
