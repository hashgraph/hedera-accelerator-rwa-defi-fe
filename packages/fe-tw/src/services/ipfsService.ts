/**
 * Fetch JSON data from an IPFS hash, using a public gateway.
 */
export async function fetchJsonFromIpfs(ipfsHash: string) {
   let cid = ipfsHash;
   if (cid.startsWith("ipfs://")) {
      cid = cid.slice(7);
   }
   // Use ipfs.io public gateway for reliable access
   const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
   const res = await fetch(gatewayUrl);
   if (!res.ok) {
      throw new Error(`Failed to fetch IPFS data: ${res.status}`);
   }
   return res.json();
}
