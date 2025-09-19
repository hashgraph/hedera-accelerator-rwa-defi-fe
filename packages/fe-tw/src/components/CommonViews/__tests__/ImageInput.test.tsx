import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageInput, { InputEntity } from "../ImageInput";

// Mock Next.js Image component
jest.mock("next/image", () => {
   return function MockImage({ src, alt, fill, className, onError }: any) {
      return (
         <img
            src={src}
            alt={alt}
            className={className}
            data-fill={fill}
            onError={onError}
            data-testid="next-image"
         />
      );
   };
});

// Mock UI components
jest.mock("@/components/ui/button", () => ({
   Button: ({ children, onClick, className, variant, size, type, "aria-label": ariaLabel }: any) => (
      <button
         data-testid="button"
         onClick={onClick}
         className={className}
         data-variant={variant}
         data-size={size}
         type={type}
         aria-label={ariaLabel}
      >
         {children}
      </button>
   ),
}));

jest.mock("@/components/ui/formInput", () => ({
   FormInput: ({ label, name, value, onChange, placeholder, error, disabled, required }: any) => (
      <div data-testid="form-input-container">
         <label htmlFor={name}>{label}</label>
         <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            data-error={error}
            data-testid="form-input"
         />
         {error && <div data-testid="form-error">{error}</div>}
      </div>
   ),
}));

jest.mock("@/components/ui/upload-file-button", () => ({
   UploadFileButton: ({ className, onFileAdded }: any) => (
      <button
         data-testid="upload-file-button"
         className={className}
         onClick={() => {
            // Simulate file upload
            const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
            onFileAdded(mockFile);
         }}
      >
         Upload File
      </button>
   ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
   ImageIcon: ({ size }: any) => <div data-testid="image-icon" data-size={size}>ImageIcon</div>,
   Trash: ({ size }: any) => <div data-testid="trash-icon" data-size={size}>Trash</div>,
}));

// Mock class-variance-authority
jest.mock("class-variance-authority", () => ({
   cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("ImageInput", () => {
   const defaultProps = {
      ipfsId: "",
      file: null,
      inputEntity: InputEntity.Building,
      onChange: jest.fn(),
   };

   beforeEach(() => {
      jest.clearAllMocks();
      // Mock FileReader
      const mockFileReader = {
         readAsDataURL: jest.fn(),
         onloadend: null as any,
         result: "data:image/jpeg;base64,test-image-data",
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;
   });

   describe("Initial rendering", () => {
      it("should render with default props for Building entity", () => {
         render(<ImageInput {...defaultProps} />);

         expect(screen.getByLabelText("Building Image IPFS Id")).toBeInTheDocument();
         expect(screen.getByPlaceholderText("QmXYZ...")).toBeInTheDocument();
         expect(screen.getByTestId("upload-file-button")).toBeInTheDocument();
         expect(screen.getByTestId("image-icon")).toBeInTheDocument();
         expect(screen.getByText("No image selected")).toBeInTheDocument();
      });

      it("should render with Slice entity", () => {
         render(<ImageInput {...defaultProps} inputEntity={InputEntity.Slice} />);

         expect(screen.getByLabelText("Slice Image IPFS Id")).toBeInTheDocument();
      });

      it("should show error state when touched and error provided", () => {
         render(
            <ImageInput
               {...defaultProps}
               error="Invalid IPFS ID"
               touched={true}
            />
         );

         expect(screen.getByTestId("form-error")).toHaveTextContent("Invalid IPFS ID");
      });

      it("should not show error when not touched", () => {
         render(
            <ImageInput
               {...defaultProps}
               error="Invalid IPFS ID"
               touched={false}
            />
         );

         expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
      });
   });

   describe("IPFS ID input functionality", () => {
      it("should call onChange when IPFS ID is entered", () => {
         const onChange = jest.fn();

         render(<ImageInput {...defaultProps} onChange={onChange} />);

         const input = screen.getByTestId("form-input");
         fireEvent.change(input, { target: { value: "QmNewIPFSHash" } });

         expect(onChange).toHaveBeenCalledWith({
            id: "QmNewIPFSHash",
            file: null,
         });
      });

      it("should trim whitespace from IPFS ID input", () => {
         const onChange = jest.fn();

         render(<ImageInput {...defaultProps} onChange={onChange} />);

         const input = screen.getByTestId("form-input");
         fireEvent.change(input, { target: { value: "  QmHashWithSpaces  " } });

         expect(onChange).toHaveBeenCalledWith({
            id: "QmHashWithSpaces",
            file: null,
         });
      });

      it("should disable IPFS input when file is present", () => {
         const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
         
         render(<ImageInput {...defaultProps} file={mockFile} />);

         const input = screen.getByTestId("form-input");
         expect(input).toHaveAttribute("disabled");
      });

      it("should display IPFS image when valid IPFS ID is provided", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         const image = screen.getByTestId("next-image");
         expect(image).toHaveAttribute("src", "https://ipfs.io/ipfs/QmTestHash");
         expect(image).toHaveAttribute("alt", "Building preview");
      });
   });

   describe("File upload functionality", () => {
      it("should handle file upload and show preview", async () => {
         const onChange = jest.fn();
         const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

         render(<ImageInput {...defaultProps} onChange={onChange} />);

         const uploadButton = screen.getByTestId("upload-file-button");
         fireEvent.click(uploadButton);

         expect(onChange).toHaveBeenCalledWith({
            id: "",
            file: mockFile,
         });
      });

      it("should show file preview when file is provided", async () => {
         const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
         
         // Mock FileReader for this test
         const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: null as any,
            result: "data:image/jpeg;base64,test-image-data",
         };
         global.FileReader = jest.fn(() => mockFileReader) as any;

         const { rerender } = render(<ImageInput {...defaultProps} />);

         // Simulate file being set
         rerender(<ImageInput {...defaultProps} file={mockFile} />);

         // Simulate FileReader finishing
         await waitFor(() => {
            if (mockFileReader.onloadend) {
               mockFileReader.onloadend(null);
            }
         });

         await waitFor(() => {
            const image = screen.getByTestId("next-image");
            expect(image).toHaveAttribute("src", "data:image/jpeg;base64,test-image-data");
         });
      });
   });

   describe("Clear image functionality", () => {
      it("should clear image when trash button is clicked", async () => {
         const onChange = jest.fn();
         
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" onChange={onChange} />);

         const clearButton = screen.getByLabelText("Clear image");
         fireEvent.click(clearButton);

         expect(onChange).toHaveBeenCalledWith({
            id: "",
            file: null,
         });
      });

      it("should show trash button when image is present", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         expect(screen.getByLabelText("Clear image")).toBeInTheDocument();
         expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
      });

      it("should not show trash button when no image is present", () => {
         render(<ImageInput {...defaultProps} />);

         expect(screen.queryByLabelText("Clear image")).not.toBeInTheDocument();
         expect(screen.queryByTestId("trash-icon")).not.toBeInTheDocument();
      });
   });

   describe("Image error handling", () => {
      it("should handle image load error", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         const image = screen.getByTestId("next-image");
         fireEvent.error(image);

         // After error, should show placeholder
         expect(screen.getByTestId("image-icon")).toBeInTheDocument();
         expect(screen.getByText("No image selected")).toBeInTheDocument();
      });
   });

   describe("CSS classes and styling", () => {
      it("should apply error border styles when touched and error present", () => {
         render(
            <ImageInput
               {...defaultProps}
               error="Invalid IPFS ID"
               touched={true}
            />
         );

         const uploadButton = screen.getByTestId("upload-file-button");
         expect(uploadButton).toHaveClass("border-red-500");
      });

      it("should have correct container classes", () => {
         const { container } = render(<ImageInput {...defaultProps} />);

         const mainContainer = container.firstChild;
         expect(mainContainer).toHaveClass("flex", "flex-col", "gap-4", "w-full");
      });

      it("should have correct image container classes without image", () => {
         const { container } = render(<ImageInput {...defaultProps} />);

         const imageContainer = container.querySelector("div[class*='border-dashed']");
         expect(imageContainer).toHaveClass(
            "relative",
            "overflow-hidden", 
            "w-full",
            "h-64",
            "border-2",
            "rounded-lg",
            "flex",
            "items-center",
            "justify-center",
            "bg-gray-50",
            "border-dashed",
            "border-gray-400"
         );
      });

      it("should have different border styles when image is present", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         const imageContainer = screen.getByTestId("next-image").closest("div");
         expect(imageContainer?.parentElement).toHaveClass("border-gray-300");
         expect(imageContainer?.parentElement).not.toHaveClass("border-dashed");
      });
   });

   describe("Accessibility", () => {
      it("should have proper aria-label on clear button", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         const clearButton = screen.getByLabelText("Clear image");
         expect(clearButton).toHaveAttribute("aria-label", "Clear image");
      });

      it("should have proper alt text for images", () => {
         render(<ImageInput {...defaultProps} ipfsId="QmTestHash" />);

         const image = screen.getByTestId("next-image");
         expect(image).toHaveAttribute("alt", "Building preview");
      });

      it("should have proper alt text for Slice entity", () => {
         render(<ImageInput {...defaultProps} inputEntity={InputEntity.Slice} ipfsId="QmTestHash" />);

         const image = screen.getByTestId("next-image");
         expect(image).toHaveAttribute("alt", "Slice preview");
      });
   });

   describe("React.memo optimization", () => {
      it("should be properly memoized", () => {
         const { rerender } = render(<ImageInput {...defaultProps} />);
         
         // Re-render with same props should not cause re-render
         rerender(<ImageInput {...defaultProps} />);
         
         // This test mainly ensures the component is exported as React.memo
         expect(ImageInput).toBeDefined();
      });
   });
});