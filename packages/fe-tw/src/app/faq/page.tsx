"use client";

import Link from "next/link";
import { useState } from "react";

export default function FAQPage() {
   const [expanded, setExpanded] = useState<string | null>(null);

   const toggleExpand = (question: string) => {
      setExpanded(expanded === question ? null : question);
   };

   const faqs = [
      {
         question: "What is RWA Defi Demo?",
         answer: `
RWA Defi Demo is a reference platform demonstrating how real estate can be tokenized on Hedera.
We use DeFi tools like vaults, slices, and auto-compounders to illustrate how developers and enterprises
can build their own Real-World Asset (RWA) solutions.
You can think of it as a blueprint for tokenizing property ownership,
handling revenue distribution, and diversifying investments via smart contracts.
      `,
      },
      {
         question: "Why tokenize real estate?",
         answer: `
Tokenizing real estate removes traditional barriers like high capital requirements 
and lengthy transactions. Fractional ownership lets you buy and sell small portions of 
a property, creating more liquidity and global accessibility. By combining Hedera’s 
speed and security with DeFi concepts, real estate investment becomes more efficient, 
transparent, and open to anyone with an internet connection.
      `,
      },
      {
         question: "What are Building Tokens?",
         answer: `
Each building is represented by its own ERC-20 token (e.g., "MToken" for Building M). 
Holding these tokens grants partial ownership of that specific building. 
As the building earns revenue (like rent), a share is allocated to token holders, 
usually through a vault system.
      `,
      },
      {
         question: "What are Vault Tokens (vTokens)?",
         answer: `
Vault tokens, or vTokens, represent your staked position in a building’s vault. 
When you stake your building tokens (like MToken) in the vault, you receive vTokens 
(one-to-one). These vTokens entitle you to a portion of any rental income or revenue 
the building generates.
      `,
      },
      {
         question: "What are Auto-Compounding Tokens (aTokens)?",
         answer: `
Auto-compounding tokens (aTokens) let you automatically reinvest your building’s rewards. 
Rather than manually claiming and restaking, the auto-compounder contract does it for you. 
Stake MToken, receive aMToken, and watch it appreciate over time as rewards are converted 
back into more MToken and re-staked in the vault.
      `,
      },
      {
         question: "How do expenses and revenue get handled?",
         answer: `
Monthly revenue (rent) or expenses for each building flow through its vault. 
After deducting costs (maintenance, insurance, etc.), the leftover revenue 
is distributed to token holders (vTokens or aTokens) automatically. 
Vaults can also maintain reserves for recurring bills, ensuring transparent treasury operations.
      `,
      },
      {
         question: "What is a Slice?",
         answer: `
A slice is like a DeFi version of an ETF. It’s a contract that holds multiple building tokens 
(or vTokens/aTokens) with defined target allocations. For example, a slice might hold 30% MToken, 
30% NToken, and 40% OToken. As token prices change, the slice automatically rebalances to 
maintain these allocations. This diversifies risk across multiple properties.
      `,
      },
      {
         question: "Where do slice allocations live?",
         answer: `
All target allocations are stored in the slice contract itself. 
Buildings and their tokens don’t “know” how they’re allocated; 
they just exist as assets. The slice actively manages its own portfolio, 
buying or selling tokens to stay at the defined allocations.
      `,
      },
      {
         question: "Why are slices useful?",
         answer: `
Slices simplify portfolio management by letting you hold a single slice token instead of multiple 
individual building tokens. They also automate yield optimization—slices can hold vTokens or aTokens 
so you capture rewards while maintaining balanced allocations. It’s a powerful way to diversify 
and manage real estate exposure on-chain.
      `,
      },
      {
         question: "How do I earn from my tokens?",
         answer: `
If you hold building tokens (or slice tokens that include certain buildings), 
you earn a proportional share of the building’s net income (rent, etc.) 
distributed through vaults. With auto-compounding, you can reinvest those 
rewards automatically, growing your stake over time without constant manual transactions.
      `,
      },
      {
         question: "Where can I learn more or build my own solution?",
         answer: `
Explore the blog posts, reference architecture, dev guides, and open-source code from
RWA Defi Demo.
Join our community or visit our GitHub for hands-on examples and updates.
      `,
      },
   ];

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
         <h1 className="text-3xl font-bold text-center">Frequently Asked Questions</h1>

         <div className="space-y-4">
            {faqs.map((faq) => (
               // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
               <div
                  key={faq.question}
                  className="
              bg-gray-100 
              border border-gray-300 
              rounded-lg 
              p-4 
              transition-transform duration-300 
              hover:scale-[1.01] 
              hover:bg-gray-200 
              cursor-pointer
            "
                  onClick={() => toggleExpand(faq.question)}
               >
                  <div className="flex justify-between items-center">
                     <h2 className="text-lg font-semibold text-gray-800">{faq.question}</h2>
                     <span className="text-gray-600">{expanded === faq.question ? "–" : "+"}</span>
                  </div>

                  {expanded === faq.question && (
                     <p className="mt-2 text-gray-700 w-full block">{faq.answer}</p>
                  )}
               </div>
            ))}
         </div>

         <div className="text-center mt-6">
            <Link href="/explorer">
               <button
                  className="bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-900 transition"
                  type="button"
               >
                  Back to Explorer
               </button>
            </Link>
         </div>
      </div>
   );
}
