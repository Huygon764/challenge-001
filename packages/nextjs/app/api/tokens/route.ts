import { NextResponse } from "next/server";
import { Token } from "~~/types/token/token";
import contracts from "~~/contracts/deployedContracts";

const TOKEN_METADATA = {
  WETH: { name: "Wrapped ETH", decimals: 18 },
  USDC: { name: "USD Coin", decimals: 6 },
  ARB: { name: "Arbitrum", decimals: 18 },
  WBTC: { name: "Wrapped Bitcoin", decimals: 8 },
  DAI: { name: "Dai Stablecoin", decimals: 18 },
  LINK: { name: "Chainlink", decimals: 18 },
  UNI: { name: "Uniswap", decimals: 18 },
  MATIC: { name: "Polygon", decimals: 18 },
  AAVE: { name: "Aave", decimals: 18 },
  CRV: { name: "Curve", decimals: 18 },
};

export async function GET() {
  try {
    const chainContracts = contracts["412346"];

    if (!chainContracts) {
      return NextResponse.json({ error: "No contracts found for this chain" }, { status: 404 });
    }

    const tokens: Token[] = Object.entries(chainContracts)
      .filter(([name]) => name in TOKEN_METADATA)
      .map(([symbol, contract]) => ({
        address: contract.address,
        symbol,
        name: TOKEN_METADATA[symbol as keyof typeof TOKEN_METADATA].name,
        decimals: TOKEN_METADATA[symbol as keyof typeof TOKEN_METADATA].decimals,
      }));

    // Contract addresses
    const contractAddresses = {
      PORTFOLIO_READER: chainContracts.PortfolioReader?.address,
      YOUR_CONTRACT: chainContracts["your-contract"]?.address,
    };

    return NextResponse.json({
      tokens,
      contractAddresses,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading contracts:", error);
    return NextResponse.json({ error: "Failed to load contract data" }, { status: 500 });
  }
}
