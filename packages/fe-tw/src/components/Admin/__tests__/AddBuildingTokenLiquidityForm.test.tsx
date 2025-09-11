import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddBuildingTokenLiquidityForm } from "../AddBuildingTokenLiquidityForm";

jest.mock("@/hooks/useBuildingLiquidity", () => ({ useBuildingLiquidity: jest.fn() }));
jest.mock("@/hooks/useBuildings", () => ({ useBuildings: jest.fn() }));
jest.mock("@/hooks/useBuildingInfo", () => ({ useBuildingInfo: jest.fn() }));
jest.mock("@/hooks/useTokenInfo", () => ({ useTokenInfo: jest.fn() }));
jest.mock("../../CommonViews/TxResultView", () => ({
   TxResultToastView: ({ title }: { title: string }) => (
      <div data-testid="tx-result" data-title={title} />
   ),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { useBuildingLiquidity } from "@/hooks/useBuildingLiquidity";
import { useBuildings } from "@/hooks/useBuildings";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { toast } from "sonner";

beforeAll(() => {
   const EP: any = Element.prototype as unknown as Record<string, any>;
   if (!EP.hasPointerCapture) EP.hasPointerCapture = () => false;
   if (!EP.setPointerCapture) EP.setPointerCapture = () => {};
   if (!EP.releasePointerCapture) EP.releasePointerCapture = () => {};
   if (!EP.scrollIntoView) EP.scrollIntoView = () => {};
});

describe("AddBuildingTokenLiquidityForm", () => {
   const addLiquidity = jest.fn();
   const checkPairAndCalculateAmounts = jest.fn();

   const baseLiquidityReturn = {
      isAddingLiquidity: false,
      txHash: undefined,
      txError: undefined,
      pairInfo: { exists: true, pairAddress: "0xPAIR" },
      calculatedAmounts: {
         tokenARequired: BigInt("1000000000000000000"),
         tokenBRequired: BigInt(1000000),
         tokenAMin: BigInt("950000000000000000"),
         tokenBMin: BigInt(950000),
      },
      isCheckingPair: false,
      pairCheckError: undefined,
      addLiquidity,
      checkPairAndCalculateAmounts,
   };

   beforeEach(() => {
      jest.clearAllMocks();
      window.history.pushState({}, "", "/");
      (useBuildingInfo as jest.Mock).mockReturnValue({ tokenAddress: "0xTOKEN" });
      (useTokenInfo as jest.Mock).mockReturnValue({ name: "BLDG" });
      (useBuildings as jest.Mock).mockReturnValue({
         buildings: [
            { address: "0xB1", title: "Building One" },
            { address: "0xB2", title: "Building Two" },
         ],
      });
   });

   it("submits values and shows computed button label when calculated amounts exist", async () => {
      (useBuildingLiquidity as jest.Mock).mockReturnValue(baseLiquidityReturn);

      window.history.pushState({}, "", "/building/0xB1");
      render(<AddBuildingTokenLiquidityForm buildingAddress={"0xB1" as `0x${string}`} />);
      const user = userEvent.setup();

      await user.type(
         screen.getByRole("textbox", { name: /Token A Amount|Desired Token A Amount/i }),
         "100",
      );
      await user.type(
         screen.getByRole("textbox", { name: /Token B Amount|Desired Token B Amount/i }),
         "100",
      );

      await waitFor(() => {
         expect(checkPairAndCalculateAmounts).toHaveBeenCalledWith(
            "0xTOKEN",
            expect.stringMatching(/^0x/i),
            "100",
            "100",
         );
      });

      expect(
         screen.getByRole("button", { name: /Add Liquidity \(1\.00 Token A \+ 1\.00 USDC\)/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Add Liquidity/i }));

      await waitFor(() => {
         expect(addLiquidity).toHaveBeenCalledWith({
            buildingAddress: "0xB1",
            tokenAAddress: "0xTOKEN",
            tokenBAddress: expect.stringMatching(/^0x/i),
            tokenAAmount: "100",
            tokenBAmount: "100",
         });
      });
   });

   it("requires building selection when not provided and submits with selected building", async () => {
      (useBuildingLiquidity as jest.Mock).mockReturnValue({
         ...baseLiquidityReturn,
         calculatedAmounts: undefined,
      });

      render(<AddBuildingTokenLiquidityForm />);
      const user = userEvent.setup();

      await user.type(
         screen.getByRole("textbox", { name: /Token A Amount|Desired Token A Amount/i }),
         "50",
      );
      await user.type(
         screen.getByRole("textbox", { name: /Token B Amount|Desired Token B Amount/i }),
         "50",
      );

      await user.click(screen.getByRole("button", { name: /Add Liquidity/i }));
      expect(await screen.findByText(/Building selection is required/i)).toBeInTheDocument();

      await user.click(screen.getByRole("combobox", { name: /Choose a Building/i }));
      await user.click(await screen.findByRole("option", { name: /Building One \(0xB1\)/i }));

      await user.click(screen.getByRole("button", { name: /Add Liquidity$/i }));

      await waitFor(() => {
         expect(addLiquidity).toHaveBeenCalledWith({
            buildingAddress: "0xB1",
            tokenAAddress: "0xTOKEN",
            tokenBAddress: expect.stringMatching(/^0x/i),
            tokenAAmount: "50",
            tokenBAmount: "50",
         });
      });
   });

   it("emits success and error toasts from effects", async () => {
      (useBuildingLiquidity as jest.Mock).mockReturnValue({
         ...baseLiquidityReturn,
         txHash: "0xHASH",
      });

      render(<AddBuildingTokenLiquidityForm buildingAddress={"0xB1" as `0x${string}`} />);
      await waitFor(() => {
         expect(toast.success).toHaveBeenCalled();
      });

      (useBuildingLiquidity as jest.Mock).mockReturnValue({
         ...baseLiquidityReturn,
         pairCheckError: "boom",
      });
      render(<AddBuildingTokenLiquidityForm buildingAddress={"0xB1" as `0x${string}`} />);
      await waitFor(() => {
         expect(toast.error).toHaveBeenCalled();
      });
   });
});
