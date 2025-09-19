import { render, screen } from "@testing-library/react";
import { AllWalletsProvider } from "../AllWalletsProvider";

// Mock the context providers
jest.mock("@/context/MetamaskContext", () => ({
   MetamaskContextProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="metamask-context-provider">{children}</div>
   ),
}));

jest.mock("@/context/WalletConnectContext", () => ({
   WalletConnectContextProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="walletconnect-context-provider">{children}</div>
   ),
}));

// Mock the wallet clients
jest.mock("@/services/wallets/metamask/MetaMaskClient", () => ({
   MetaMaskClient: () => <div data-testid="metamask-client">MetaMask Client</div>,
}));

jest.mock("@/services/wallets/walletconnect/WalletConnectClient", () => ({
   WalletConnectClient: () => <div data-testid="walletconnect-client">WalletConnect Client</div>,
}));

describe("AllWalletsProvider", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe("Rendering and Structure", () => {
      it("should render children correctly", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="test-child">Test Child Component</div>
            </AllWalletsProvider>
         );

         expect(screen.getByTestId("test-child")).toBeInTheDocument();
         expect(screen.getByText("Test Child Component")).toBeInTheDocument();
      });

      it("should render without children", () => {
         const { container } = render(<AllWalletsProvider children={undefined} />);

         expect(container.firstChild).toBeInTheDocument();
      });

      it("should render multiple children", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="child-1">Child 1</div>
               <div data-testid="child-2">Child 2</div>
               <span data-testid="child-3">Child 3</span>
            </AllWalletsProvider>
         );

         expect(screen.getByTestId("child-1")).toBeInTheDocument();
         expect(screen.getByTestId("child-2")).toBeInTheDocument();
         expect(screen.getByTestId("child-3")).toBeInTheDocument();
      });
   });

   describe("Context Provider Hierarchy", () => {
      it("should wrap children in MetamaskContextProvider", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="test-child">Test Content</div>
            </AllWalletsProvider>
         );

         const metamaskProvider = screen.getByTestId("metamask-context-provider");
         expect(metamaskProvider).toBeInTheDocument();
         
         // Child should be inside the MetamaskContextProvider
         const child = screen.getByTestId("test-child");
         expect(metamaskProvider).toContainElement(child);
      });

      it("should wrap children in WalletConnectContextProvider", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="test-child">Test Content</div>
            </AllWalletsProvider>
         );

         const walletConnectProvider = screen.getByTestId("walletconnect-context-provider");
         expect(walletConnectProvider).toBeInTheDocument();
         
         // Child should be inside the WalletConnectContextProvider
         const child = screen.getByTestId("test-child");
         expect(walletConnectProvider).toContainElement(child);
      });

      it("should have correct provider nesting order", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="test-child">Test Content</div>
            </AllWalletsProvider>
         );

         const metamaskProvider = screen.getByTestId("metamask-context-provider");
         const walletConnectProvider = screen.getByTestId("walletconnect-context-provider");
         
         // WalletConnectContextProvider should be inside MetamaskContextProvider
         expect(metamaskProvider).toContainElement(walletConnectProvider);
      });
   });

   describe("Wallet Clients", () => {
      it("should render MetaMaskClient", () => {
         render(
            <AllWalletsProvider>
               <div>Test</div>
            </AllWalletsProvider>
         );

         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByText("MetaMask Client")).toBeInTheDocument();
      });

      it("should render WalletConnectClient", () => {
         render(
            <AllWalletsProvider>
               <div>Test</div>
            </AllWalletsProvider>
         );

         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();
         expect(screen.getByText("WalletConnect Client")).toBeInTheDocument();
      });

      it("should render both wallet clients alongside children", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="app-content">App Content</div>
            </AllWalletsProvider>
         );

         // All should be present
         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();
         expect(screen.getByTestId("app-content")).toBeInTheDocument();
      });
   });

   describe("Component Integration", () => {
      it("should maintain component hierarchy with complex children", () => {
         render(
            <AllWalletsProvider>
               <div data-testid="app">
                  <header data-testid="header">Header</header>
                  <main data-testid="main">
                     <div data-testid="content">Main Content</div>
                  </main>
                  <footer data-testid="footer">Footer</footer>
               </div>
            </AllWalletsProvider>
         );

         // Verify all components are rendered
         expect(screen.getByTestId("app")).toBeInTheDocument();
         expect(screen.getByTestId("header")).toBeInTheDocument();
         expect(screen.getByTestId("main")).toBeInTheDocument();
         expect(screen.getByTestId("content")).toBeInTheDocument();
         expect(screen.getByTestId("footer")).toBeInTheDocument();
         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();

         // Verify hierarchy
         const walletConnectProvider = screen.getByTestId("walletconnect-context-provider");
         expect(walletConnectProvider).toContainElement(screen.getByTestId("app"));
      });

      it("should handle React.ReactNode children prop type", () => {
         const StringChild = "String child";
         const NumberChild = 42;
         const BooleanChild = true;
         const NullChild = null;

         const { container } = render(
            <AllWalletsProvider>
               {StringChild}
               {NumberChild}
               {BooleanChild && <div data-testid="conditional">Conditional</div>}
               {NullChild}
               <div data-testid="jsx-child">JSX Child</div>
            </AllWalletsProvider>
         );

         expect(container).toHaveTextContent("String child");
         expect(container).toHaveTextContent("42");
         expect(screen.getByTestId("conditional")).toBeInTheDocument();
         expect(screen.getByTestId("jsx-child")).toBeInTheDocument();
      });
   });

   describe("Error Boundaries and Edge Cases", () => {
      it("should handle null children gracefully", () => {
         const { container } = render(<AllWalletsProvider>{null}</AllWalletsProvider>);

         expect(container.firstChild).toBeInTheDocument();
         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();
      });

      it("should handle undefined children gracefully", () => {
         const { container } = render(<AllWalletsProvider>{undefined}</AllWalletsProvider>);

         expect(container.firstChild).toBeInTheDocument();
         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();
      });

      it("should handle empty fragment children", () => {
         render(
            <AllWalletsProvider>
               <>
                  <div data-testid="fragment-child">Fragment Child</div>
               </>
            </AllWalletsProvider>
         );

         expect(screen.getByTestId("fragment-child")).toBeInTheDocument();
         expect(screen.getByTestId("metamask-client")).toBeInTheDocument();
         expect(screen.getByTestId("walletconnect-client")).toBeInTheDocument();
      });
   });

   describe("Props Interface", () => {
      it("should accept children prop as ReactNode", () => {
         interface ExpectedProps {
            children: React.ReactNode | undefined;
         }

         // This test ensures the component accepts the expected prop interface
         const validProps: ExpectedProps = {
            children: <div>Test</div>,
         };

         render(<AllWalletsProvider {...validProps} />);

         expect(screen.getByText("Test")).toBeInTheDocument();
      });

      it("should handle children prop with undefined explicitly", () => {
         interface Props {
            children: React.ReactNode | undefined;
         }

         const props: Props = {
            children: undefined,
         };

         const { container } = render(<AllWalletsProvider {...props} />);

         expect(container.firstChild).toBeInTheDocument();
      });
   });
});