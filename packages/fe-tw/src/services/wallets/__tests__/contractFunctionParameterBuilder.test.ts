import { ContractFunctionParameters } from "@hashgraph/sdk";
import {
   ContractFunctionParameterBuilder,
   type ContractFunctionParameterBuilderParam,
} from "../contractFunctionParameterBuilder";

// Mock the ContractFunctionParameters class
jest.mock("@hashgraph/sdk", () => ({
   ContractFunctionParameters: jest.fn().mockImplementation(() => ({
      addString: jest.fn().mockReturnThis(),
      addUint256: jest.fn().mockReturnThis(),
      addAddress: jest.fn().mockReturnThis(),
      addBool: jest.fn().mockReturnThis(),
      addInt32: jest.fn().mockReturnThis(),
   })),
}));

describe("ContractFunctionParameterBuilder", () => {
   let builder: ContractFunctionParameterBuilder;
   let mockContractFunctionParams: jest.Mocked<ContractFunctionParameters>;

   beforeEach(() => {
      jest.clearAllMocks();
      builder = new ContractFunctionParameterBuilder();
      
      // Create a mock instance
      mockContractFunctionParams = {
         addString: jest.fn().mockReturnThis(),
         addUint256: jest.fn().mockReturnThis(),
         addAddress: jest.fn().mockReturnThis(),
         addBool: jest.fn().mockReturnThis(),
         addInt32: jest.fn().mockReturnThis(),
      } as any;

      // Mock the constructor to return our mock instance
      (ContractFunctionParameters as jest.Mock).mockImplementation(() => mockContractFunctionParams);
   });

   describe("addParam", () => {
      it("should add a parameter and return the builder instance", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: "testValue",
         };

         const result = builder.addParam(param);

         expect(result).toBe(builder); // Should return the same instance for chaining
      });

      it("should allow method chaining", () => {
         const param1: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "param1",
            value: "value1",
         };

         const param2: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "param2",
            value: "123",
         };

         const result = builder.addParam(param1).addParam(param2);

         expect(result).toBe(builder);
      });
   });

   describe("buildAbiFunctionParams", () => {
      it("should build ABI function parameters string with single parameter", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);
         const result = builder.buildAbiFunctionParams();

         expect(result).toBe("string testParam");
      });

      it("should build ABI function parameters string with multiple parameters", () => {
         const param1: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "param1",
            value: "value1",
         };

         const param2: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "param2",
            value: "123",
         };

         const param3: ContractFunctionParameterBuilderParam = {
            type: "address",
            name: "param3",
            value: "0x123...",
         };

         builder.addParam(param1).addParam(param2).addParam(param3);
         const result = builder.buildAbiFunctionParams();

         expect(result).toBe("string param1, uint256 param2, address param3");
      });

      it("should return empty string when no parameters", () => {
         const result = builder.buildAbiFunctionParams();

         expect(result).toBe("");
      });
   });

   describe("buildEthersParams", () => {
      it("should build ethers parameters array with single parameter", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);
         const result = builder.buildEthersParams();

         expect(result).toEqual(["testValue"]);
      });

      it("should build ethers parameters array with multiple parameters", () => {
         const param1: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "param1",
            value: "value1",
         };

         const param2: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "param2",
            value: 123,
         };

         const param3: ContractFunctionParameterBuilderParam = {
            type: "bool",
            name: "param3",
            value: true,
         };

         builder.addParam(param1).addParam(param2).addParam(param3);
         const result = builder.buildEthersParams();

         expect(result).toEqual(["value1", "123", "true"]);
      });

      it("should convert all values to strings", () => {
         const param1: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "number",
            value: 123,
         };

         const param2: ContractFunctionParameterBuilderParam = {
            type: "bool",
            name: "boolean",
            value: false,
         };

         const param3: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "nullish",
            value: null,
         };

         builder.addParam(param1).addParam(param2).addParam(param3);
         const result = builder.buildEthersParams();

         expect(result).toEqual(["123", "false", "null"]);
      });

      it("should return empty array when no parameters", () => {
         const result = builder.buildEthersParams();

         expect(result).toEqual([]);
      });
   });

   describe("buildHAPIParams", () => {
      it("should build HAPI parameters with valid string type", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);
         const result = builder.buildHAPIParams();

         expect(ContractFunctionParameters).toHaveBeenCalled();
         expect(mockContractFunctionParams.addString).toHaveBeenCalledWith("testValue");
         expect(result).toBe(mockContractFunctionParams);
      });

      it("should build HAPI parameters with valid uint256 type", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "amount",
            value: "1000",
         };

         builder.addParam(param);
         const result = builder.buildHAPIParams();

         expect(mockContractFunctionParams.addUint256).toHaveBeenCalledWith("1000");
         expect(result).toBe(mockContractFunctionParams);
      });

      it("should build HAPI parameters with multiple valid types", () => {
         const param1: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "name",
            value: "test",
         };

         const param2: ContractFunctionParameterBuilderParam = {
            type: "uint256",
            name: "amount",
            value: "100",
         };

         const param3: ContractFunctionParameterBuilderParam = {
            type: "bool",
            name: "active",
            value: true,
         };

         builder.addParam(param1).addParam(param2).addParam(param3);
         const result = builder.buildHAPIParams();

         expect(mockContractFunctionParams.addString).toHaveBeenCalledWith("test");
         expect(mockContractFunctionParams.addUint256).toHaveBeenCalledWith("100");
         expect(mockContractFunctionParams.addBool).toHaveBeenCalledWith(true);
         expect(result).toBe(mockContractFunctionParams);
      });

      it("should throw error for invalid type with special characters", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string[]",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);

         expect(() => builder.buildHAPIParams()).toThrow(
            "Invalid type: string[]. Type must only contain alphanumeric characters."
         );
      });

      it("should throw error for type starting with number", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "1string",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);

         expect(() => builder.buildHAPIParams()).toThrow(
            "Invalid type: 1string. Type must only contain alphanumeric characters."
         );
      });

      it("should throw error for type with whitespace", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string type",
            name: "testParam",
            value: "testValue",
         };

         builder.addParam(param);

         expect(() => builder.buildHAPIParams()).toThrow(
            "Invalid type: string type. Type must only contain alphanumeric characters."
         );
      });

      it("should throw error for type that doesn't exist on ContractFunctionParameters", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "unknowntype",
            name: "testParam",
            value: "testValue",
         };

         // Create a mock that doesn't have the addUnknowntype method
         const limitedMock = {
            addString: jest.fn(),
         } as any;
         (ContractFunctionParameters as jest.Mock).mockImplementation(() => limitedMock);

         builder.addParam(param);

         expect(() => builder.buildHAPIParams()).toThrow(
            "Invalid type: unknowntype. Could not find function addUnknowntype in ContractFunctionParameters class."
         );
      });

      it("should handle empty parameters array", () => {
         const result = builder.buildHAPIParams();

         expect(ContractFunctionParameters).toHaveBeenCalled();
         expect(result).toBe(mockContractFunctionParams);
      });
   });

   describe("Edge cases and type safety", () => {
      it("should handle undefined values", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: undefined,
         };

         builder.addParam(param);
         const ethersResult = builder.buildEthersParams();

         expect(ethersResult).toEqual(["undefined"]);
      });

      it("should handle object values", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "string",
            name: "testParam",
            value: { test: "value" },
         };

         builder.addParam(param);
         const ethersResult = builder.buildEthersParams();

         expect(ethersResult).toEqual(["[object Object]"]);
      });

      it("should capitalize first letter of type correctly", () => {
         const param: ContractFunctionParameterBuilderParam = {
            type: "address",
            name: "testParam",
            value: "0x123",
         };

         builder.addParam(param);
         builder.buildHAPIParams();

         expect(mockContractFunctionParams.addAddress).toHaveBeenCalledWith("0x123");
      });
   });
});