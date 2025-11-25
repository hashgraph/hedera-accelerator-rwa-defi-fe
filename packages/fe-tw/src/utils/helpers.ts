export const prepareStorageIPFSfileURL = (ipfsHash: string) => {
    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "ipfs.io/ipfs";
    // Remove protocol if present in gateway URL
    const cleanGatewayUrl = gatewayUrl.replace(/^https?:\/\//, "");
    return `https://${cleanGatewayUrl}/ipfs/${ipfsHash}`;
};

export const isValidIPFSImageUrl = (imageUrl?: string): boolean => {
    if (!imageUrl) {
        return false;
    }

    // Check for both ipfs.io and pinata gateway URLs
    const isIPFS = imageUrl.includes("/ipfs/") || imageUrl.startsWith("ipfs://");

    if (!isIPFS) {
        return false;
    }

    const ipfsHash = imageUrl.replace(/^https?:\/\/[^/]+\/ipfs\//, "").replace("ipfs://", "");

    if (!ipfsHash || ipfsHash === 'undefined') {
        return false;
    }

    return true;
}

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};
