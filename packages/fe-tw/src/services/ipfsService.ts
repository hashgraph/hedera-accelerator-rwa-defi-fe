/**
 * Fetch JSON data from an IPFS hash, using a public gateway.
 */
export async function fetchJsonFromIpfs(ipfsHash: string) {
   let cid = ipfsHash;
   if (cid.startsWith("ipfs://")) {
      cid = cid.slice(7);
   }
   const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "ipfs.io/ipfs";
   const cleanGatewayUrl = gatewayUrl.replace(/^https?:\/\//, "");
   const fullUrl = `https://${cleanGatewayUrl}/ipfs/${cid}`;
   const res = await fetch(fullUrl);
   if (!res.ok) {
      throw new Error(`Failed to fetch IPFS data: ${res.status}`);
   }
   return res.json();
}
