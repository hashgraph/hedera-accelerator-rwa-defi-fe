"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Formik, Form, Field } from "formik";
import { Button } from "react-daisyui";
import { ContractId } from "@hashgraph/sdk";
import { useWriteContract } from "@buidlerlabs/hashgraph-react-wallets";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { uploadJsonToPinata } from "@/services/ipfsService";
import { useBuildings } from "@/hooks/useBuildings";

type Props = {
  onBuildingDeployed: () => void;
  onGetVaultStep: () => void;
};

interface FormValues {
	name: string;
	location: string;
	image: string;
	tokenSupply: number;
}

export function AddBuildingForm({ onBuildingDeployed, onGetVaultStep }: Props) {
  const { writeContract } = useWriteContract();
  const { buildings } = useBuildings();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues, { resetForm }: any) {
    try {
			setIsLoading(true);
			const { name, location, image, tokenSupply } = values;

			const sanitizedBuildingName = name.replace(/\s+/g, "-").toLowerCase();

			const metadata = {
				description: `Tokenized building at ${location}`,
				image,
				name,
				address: location,
				allocation: 0,
				purchasedAt: Date.now(),
				attributes: [
					{ trait_type: "Location", value: location },
					{ trait_type: "Initial Token Supply", value: tokenSupply.toString() },
				],
				copeIpfsHash: "",
			};

			const ipfsHash = await uploadJsonToPinata(
				metadata,
				`Building-${sanitizedBuildingName}`,
			);
			const finalTokenURI = `ipfs://${ipfsHash}`;

			const transactionOrHash = await writeContract({
				contractId: ContractId.fromSolidityAddress(BUILDING_FACTORY_ADDRESS),
				abi: buildingFactoryAbi,
				functionName: "newBuilding",
				args: [finalTokenURI],
				metaArgs: { gas: 1_000_000 },
			});

			if (transactionOrHash) {
				onBuildingDeployed();
				toast.success(`New building created! Tx: ${transactionOrHash}`);

				resetForm();
			}
		} catch (error: any) {
			console.error(error);
			toast.error("Failed to create new building");
		} finally {
			setIsLoading(false);
		}
  }

  return (
    <div className="bg-white p-6 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">
        Add New Building
      </h3>

      <Formik<FormValues>
        initialValues={{
          name: "",
          location: "",
          tokenSupply: 1000000,
          image: "",
        }}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="space-y-4">
            {/* Building Name */}
            <div>
              <label className="block text-md font-semibold text-purple-400" htmlFor="name">Building Name</label>
              <Field
                name="name"
                className="input input-bordered w-full mt-2"
                placeholder="Enter building name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-md font-semibold text-purple-400">Location</label>
              <Field
                name="location"
                className="input input-bordered w-full mt-2"
                placeholder="Enter location"
              />
            </div>

            {/* Token Supply */}
            <div>
              <label className="block text-md font-semibold text-purple-400">Token Supply</label>
              <Field
                name="tokenSupply"
                type="number"
                className="input input-bordered w-full mt-2"
                placeholder="Enter token supply"
              />
            </div>

            <div className="flex flex-wrap gap-5 mt-5">
              <Button
                className="pr-20 pl-20"
                type="submit"
                color="primary"
                loading={isLoading}
                disabled={isLoading}
              >
                Deploy Building
              </Button>
              <Button
                className="pr-10 pl-10"
                type="button"
                color="secondary"
                onClick={() => onBuildingDeployed()}
                disabled={buildings.length === 0}
              >
                To Add Luquidity
              </Button>
              <Button
                className="pr-10 pl-10"
                type="button"
                color="secondary"
                onClick={() => onGetVaultStep()}
                disabled={buildings.length === 0}
              >
                To Vault Deployment
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
