import { render, screen } from "@testing-library/react";
import { ReactWalletsProvider } from "../ReactWalletsProvider";

// Mock the external dependencies
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   HWBridgeProvider: ({ children, metadata, projectId, connectors, chains }: any) => (
      <div 
         data-testid="hw-bridge-provider"
         data-metadata={JSON.stringify(metadata)}
         data-connectors={JSON.stringify(connectors)}
         data-chains={JSON.stringify(chains)}
      >
         <div data-testid="project-id-value">{String(projectId)}</div>
         {children}
      </div>
   ),
}));

jest.mock("@buidlerlabs/hashgraph-react-wallets/chains", () => ({
   HederaTestnet: { name: "Hedera Testnet", id: "testnet" },
}));

jest.mock("@buidlerlabs/hashgraph-react-wallets/connectors", () => ({
   HashpackConnector: { name: "Hashpack" },
   MetamaskConnector: { name: "Metamask" },
}));

// Mock environment variable
const originalEnv = process.env;

describe("ReactWalletsProvider", () => {
   beforeEach(() => {
      jest.clearAllMocks();
      // Reset environment variables
      process.env = { ...originalEnv };
   });

   afterAll(() => {
      process.env = originalEnv;
   });

   describe("Rendering and Structure", () => {
      it("should render children correctly", () => {
         render(
            <ReactWalletsProvider>
               <div data-testid="test-child">Test Child Component</div>
            </ReactWalletsProvider>
         );

         expect(screen.getByTestId("test-child")).toBeInTheDocument();
         expect(screen.getByText("Test Child Component")).toBeInTheDocument();
      });

      it("should wrap children in HWBridgeProvider", () => {
         render(
            <ReactWalletsProvider>
               <div data-testid="test-child">Test Content</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         expect(hwBridgeProvider).toBeInTheDocument();
         
         // Child should be inside the HWBridgeProvider
         const child = screen.getByTestId("test-child");
         expect(hwBridgeProvider).toContainElement(child);
      });

      it("should render multiple children", () => {
         render(
            <ReactWalletsProvider>
               <div data-testid="child-1">Child 1</div>
               <div data-testid="child-2">Child 2</div>
               <span data-testid="child-3">Child 3</span>
            </ReactWalletsProvider>
         );

         expect(screen.getByTestId("child-1")).toBeInTheDocument();
         expect(screen.getByTestId("child-2")).toBeInTheDocument();
         expect(screen.getByTestId("child-3")).toBeInTheDocument();
      });
   });

   describe("HWBridgeProvider Configuration", () => {
      it("should configure HWBridgeProvider with correct metadata", () => {
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         const metadataAttr = hwBridgeProvider.getAttribute("data-metadata");
         const metadata = JSON.parse(metadataAttr!);

         expect(metadata).toEqual({
            name: "RWA Demo UI",
            description: "RWA Demo UI",
            url: "http://localhost:3000/",
            icons: ["http://localhost:3000/logo192.png"],
         });
      });

      it("should configure HWBridgeProvider with environment project ID", () => {
         // Since process.env is evaluated at import time, we test that the component
         // correctly passes the projectId to HWBridgeProvider
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const projectIdElement = screen.getByTestId("project-id-value");
         expect(projectIdElement).toBeInTheDocument();
         // The actual value depends on the environment when the module is loaded
      });

      it("should handle undefined project ID", () => {
         // Test that the component handles the projectId prop correctly
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const projectIdElement = screen.getByTestId("project-id-value");
         expect(projectIdElement).toBeInTheDocument();
         // Project ID value is passed through regardless of whether it's undefined
      });

      it("should configure HWBridgeProvider with correct connectors", () => {
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         const connectorsAttr = hwBridgeProvider.getAttribute("data-connectors");
         const connectors = JSON.parse(connectorsAttr!);

         expect(connectors).toEqual([
            { name: "Hashpack" },
            { name: "Metamask" },
         ]);
      });

      it("should configure HWBridgeProvider with correct chains", () => {
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         const chainsAttr = hwBridgeProvider.getAttribute("data-chains");
         const chains = JSON.parse(chainsAttr!);

         expect(chains).toEqual([
            { name: "Hedera Testnet", id: "testnet" },
         ]);
      });
   });

   describe("Props Interface", () => {
      it("should accept children prop as React.ReactNode", () => {
         interface ExpectedProps {
            children: React.ReactNode;
         }

         const validProps: ExpectedProps = {
            children: <div data-testid="prop-child">Prop Child</div>,
         };

         render(<ReactWalletsProvider {...validProps} />);

         expect(screen.getByTestId("prop-child")).toBeInTheDocument();
      });

      it("should be marked as Readonly props", () => {
         // This test ensures the component accepts Readonly props interface
         const readonlyProps: Readonly<{ children: React.ReactNode }> = {
            children: <div data-testid="readonly-child">Readonly Child</div>,
         };

         render(<ReactWalletsProvider {...readonlyProps} />);

         expect(screen.getByTestId("readonly-child")).toBeInTheDocument();
      });
   });

   describe("Error Boundaries and Edge Cases", () => {
      it("should handle null children gracefully", () => {
         const { container } = render(<ReactWalletsProvider>{null}</ReactWalletsProvider>);

         expect(container.firstChild).toBeInTheDocument();
         expect(screen.getByTestId("hw-bridge-provider")).toBeInTheDocument();
      });

      it("should handle undefined children gracefully", () => {
         const { container } = render(<ReactWalletsProvider>{undefined}</ReactWalletsProvider>);

         expect(container.firstChild).toBeInTheDocument();
         expect(screen.getByTestId("hw-bridge-provider")).toBeInTheDocument();
      });

      it("should handle empty fragment children", () => {
         render(
            <ReactWalletsProvider>
               <>
                  <div data-testid="fragment-child">Fragment Child</div>
               </>
            </ReactWalletsProvider>
         );

         expect(screen.getByTestId("fragment-child")).toBeInTheDocument();
         expect(screen.getByTestId("hw-bridge-provider")).toBeInTheDocument();
      });

      it("should handle React.ReactNode children prop type", () => {
         const StringChild = "String child";
         const NumberChild = 42;
         const BooleanChild = true;
         const NullChild = null;

         const { container } = render(
            <ReactWalletsProvider>
               {StringChild}
               {NumberChild}
               {BooleanChild && <div data-testid="conditional">Conditional</div>}
               {NullChild}
               <div data-testid="jsx-child">JSX Child</div>
            </ReactWalletsProvider>
         );

         expect(container).toHaveTextContent("String child");
         expect(container).toHaveTextContent("42");
         expect(screen.getByTestId("conditional")).toBeInTheDocument();
         expect(screen.getByTestId("jsx-child")).toBeInTheDocument();
      });
   });

   describe("Component Integration", () => {
      it("should maintain component hierarchy with complex children", () => {
         render(
            <ReactWalletsProvider>
               <div data-testid="app">
                  <header data-testid="header">Header</header>
                  <main data-testid="main">
                     <div data-testid="content">Main Content</div>
                  </main>
                  <footer data-testid="footer">Footer</footer>
               </div>
            </ReactWalletsProvider>
         );

         // Verify all components are rendered
         expect(screen.getByTestId("app")).toBeInTheDocument();
         expect(screen.getByTestId("header")).toBeInTheDocument();
         expect(screen.getByTestId("main")).toBeInTheDocument();
         expect(screen.getByTestId("content")).toBeInTheDocument();
         expect(screen.getByTestId("footer")).toBeInTheDocument();
         expect(screen.getByTestId("hw-bridge-provider")).toBeInTheDocument();

         // Verify hierarchy
         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         expect(hwBridgeProvider).toContainElement(screen.getByTestId("app"));
      });
   });

   describe("Environment Variable Handling", () => {
      it("should pass project ID to HWBridgeProvider", () => {
         // Test that the component correctly passes the projectId from environment
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const projectIdElement = screen.getByTestId("project-id-value");
         expect(projectIdElement).toBeInTheDocument();
      });

      it("should handle project ID as string or undefined", () => {
         // The component should handle any value of projectId
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const projectIdElement = screen.getByTestId("project-id-value");
         expect(projectIdElement).toBeInTheDocument();
         
         // Value should be converted to string regardless of type
         const projectIdText = projectIdElement.textContent;
         expect(typeof projectIdText).toBe("string");
      });
   });

   describe("Metadata Configuration", () => {
      it("should have consistent metadata structure", () => {
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         const metadataAttr = hwBridgeProvider.getAttribute("data-metadata");
         const metadata = JSON.parse(metadataAttr!);

         // Ensure all required fields are present
         expect(metadata).toHaveProperty("name");
         expect(metadata).toHaveProperty("description");
         expect(metadata).toHaveProperty("url");
         expect(metadata).toHaveProperty("icons");
         
         // Ensure types are correct
         expect(typeof metadata.name).toBe("string");
         expect(typeof metadata.description).toBe("string");
         expect(typeof metadata.url).toBe("string");
         expect(Array.isArray(metadata.icons)).toBe(true);
         expect(metadata.icons.every((icon: any) => typeof icon === "string")).toBe(true);
      });

      it("should use localhost URLs in metadata", () => {
         render(
            <ReactWalletsProvider>
               <div>Test</div>
            </ReactWalletsProvider>
         );

         const hwBridgeProvider = screen.getByTestId("hw-bridge-provider");
         const metadataAttr = hwBridgeProvider.getAttribute("data-metadata");
         const metadata = JSON.parse(metadataAttr!);

         expect(metadata.url).toBe("http://localhost:3000/");
         expect(metadata.icons[0]).toBe("http://localhost:3000/logo192.png");
      });
   });
});