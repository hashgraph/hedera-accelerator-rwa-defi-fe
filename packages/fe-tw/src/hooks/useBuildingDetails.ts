import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { buildingAbi } from "@/services/contracts/abi/buildingAbi";
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { BuildingToken, QueryData } from "@/types/erc3643/types";
import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useMemo, useState, useEffect } from "react";

export function useBuildingDetails(buildingAddress: `0x${string}`) {
    const [buildingOwner, setBuildingOwner] = useState<`0x${string}`>();
    const [deployedBuildingTokens, setDeployedBuildingTokens] = useState<BuildingToken[]>([]);
    const [newTokenForBuildingLogs, setNewTokenForBuildingLogs] = useState<{ args: `0x${string}`[] }[]>([]);
    const { data: evmAddress } = useEvmAddress();

    watchContractEvent({
        address: BUILDING_FACTORY_ADDRESS as `0x${string}`,
        abi: buildingAbi,
        eventName: 'OwnershipTransferred',
        onLogs: (data) => {
            const owner = (data[0] as unknown as QueryData<`0x${string}`[]>)?.args?.[1];

            setBuildingOwner(owner);
        },
    });

    watchContractEvent({
        address: BUILDING_FACTORY_ADDRESS,
        abi: buildingFactoryAbi,
        eventName: "NewERC3643Token",
        onLogs: (data) => {
            setNewTokenForBuildingLogs(prev => !prev.length ? data as unknown as { args: `0x${string}`[] }[] : prev);
        },
    });

    useEffect(() => {
        setDeployedBuildingTokens(newTokenForBuildingLogs.map(log => ({
            tokenAddress: log.args[1],
            buildingAddress: log.args[0],
        })).filter((log) => log.buildingAddress === buildingAddress));
    }, [newTokenForBuildingLogs?.length, buildingAddress]);

    const isBuildingAdmin = useMemo(() => {
        if (!!buildingOwner) {
            return buildingOwner === evmAddress;
        }

        return false;
    }, [buildingOwner]);

    return { isBuildingAdmin, deployedBuildingTokens };
}
