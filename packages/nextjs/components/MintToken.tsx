import { parseUnits } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Token } from "~~/types/token/token";

const MINT_AMOUNTS = {
  WETH: "10",
  USDC: "1000",
  ARB: "100",
  WBTC: "0.5",
  DAI: "1000",
  LINK: "50",
  UNI: "100",
  MATIC: "1000",
  AAVE: "10",
  CRV: "500",
};

export const MintTokens = ({ userAddress, tokens }: { userAddress: string; tokens: Token[] }) => {
  const wethHook = useScaffoldWriteContract("WETH");
  const usdcHook = useScaffoldWriteContract("USDC");
  const arbHook = useScaffoldWriteContract("ARB");
  const wbtcHook = useScaffoldWriteContract("WBTC");
  const daiHook = useScaffoldWriteContract("DAI");
  const linkHook = useScaffoldWriteContract("LINK");
  const uniHook = useScaffoldWriteContract("UNI");
  const maticHook = useScaffoldWriteContract("MATIC");
  const aaveHook = useScaffoldWriteContract("AAVE");
  const crvHook = useScaffoldWriteContract("CRV");

  const hookMap = {
    WETH: wethHook,
    USDC: usdcHook,
    ARB: arbHook,
    WBTC: wbtcHook,
    DAI: daiHook,
    LINK: linkHook,
    UNI: uniHook,
    MATIC: maticHook,
    AAVE: aaveHook,
    CRV: crvHook,
  };

  const mintAll = async () => {
    if (tokens.length === 0) {
      console.error("❌ No tokens loaded from API");
      return;
    }

    try {
      console.log(`🪙 Minting ${tokens.length} tokens...`);

      for (const token of tokens) {
        const amount = MINT_AMOUNTS[token.symbol as keyof typeof MINT_AMOUNTS];
        const mintHook = hookMap[token.symbol as keyof typeof hookMap];

        if (!amount || !mintHook) {
          console.warn(`⚠️ Skipping ${token.symbol} - no amount or hook`);
          continue;
        }

        console.log(`   Minting ${token.symbol}...`);

        const parsedAmount = parseUnits(amount, token.decimals);

        await mintHook.writeContractAsync({
          functionName: "mint",
          args: [userAddress, parsedAmount],
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log("✅ All tokens minted successfully!");
    } catch (error) {
      console.error("❌ Mint failed:", error);
    }
  };

  if (tokens.length === 0) {
    return (
      <button disabled className="bg-gray-400 px-4 py-2 rounded text-white">
        No Tokens Found
      </button>
    );
  }

  return (
    <button
      onClick={mintAll}
      className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white transition-colors"
    >
      Mint All {tokens.length} Tokens
    </button>
  );
};
