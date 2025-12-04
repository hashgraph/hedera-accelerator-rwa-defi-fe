export const prepareStorageIPFSfileURL = (ipfsHash: string) => {
    // Use ipfs.io for browser-accessible images since Pinata gateway may require auth
    return `https://ipfs.io/ipfs/${ipfsHash}`;
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
