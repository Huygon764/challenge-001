import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { CHAIN_ID } from "~~/constants/chain";
import { Token } from "~~/types/token/token";

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
    const deploymentPath = path.join(process.cwd(), "..", "stylus", "deployments", `${CHAIN_ID}_latest.json`);

    if (!fs.existsSync(deploymentPath)) {
      return NextResponse.json({ error: "Deployment file not found" }, { status: 404 });
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    // Generate tokens
    const tokens: Token[] = Object.entries(deploymentData)
      .filter(([name]) => name in TOKEN_METADATA)
      .map(([symbol, data]: [string, any]) => ({
        address: data.address,
        symbol,
        name: TOKEN_METADATA[symbol as keyof typeof TOKEN_METADATA].name,
        decimals: TOKEN_METADATA[symbol as keyof typeof TOKEN_METADATA].decimals,
      }));

    // Contract addresses
    const contractAddresses = {
      PORTFOLIO_READER: deploymentData.PortfolioReader?.address,
      YOUR_CONTRACT: deploymentData["your-contract"]?.address,
    };

    return NextResponse.json({
      tokens,
      contractAddresses,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error reading deployment file:", error);
    return NextResponse.json({ error: "Failed to load deployment data" }, { status: 500 });
  }
}
