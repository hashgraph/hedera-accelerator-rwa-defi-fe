import { BuildingNFTData } from "@/types/erc3643/types";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

export const SliceBuildings = ({ buildingsData }: { buildingsData: BuildingNFTData[] }) => {
    return (
        <div className="space-y-4">
            {buildingsData.map((building, index) => (
                <Link
                    key={building.address}
                    href={`/building/${building.address}`}
                    className="group block p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {building.name}
                                </h3>
                                <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <p className="text-sm text-gray-500 font-mono">
                                        {building.address?.slice(0, 6)}...{building.address?.slice(-4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </div>
                    </div>
                    
                    {building.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {building.description}
                        </p>
                    )}
                </Link>
            ))}
            
            {buildingsData.length === 0 && (
                <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No buildings connected</h3>
                    <p className="text-gray-500">
                        This slice doesn't have any connected buildings yet.
                    </p>
                </div>
            )}
        </div>
    );
};
