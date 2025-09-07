import { useState, useEffect } from "react";

// Map token symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO: Record<string, string> = {
  WETH: "weth",
  USDC: "usd-coin",
  ARB: "arbitrum",
  WBTC: "wrapped-bitcoin",
  DAI: "dai",
  LINK: "chainlink",
  UNI: "uniswap",
  MATIC: "matic-network",
  AAVE: "aave",
  CRV: "curve-dao-token",
};

export const useTokenPrices = (tokenSymbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    if (tokenSymbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build dynamic CoinGecko IDs từ token symbols
      const coingeckoIds = tokenSymbols
        .map(symbol => SYMBOL_TO_COINGECKO[symbol])
        .filter(Boolean) // Remove undefined
        .join(",");

      if (!coingeckoIds) {
        throw new Error("No valid CoinGecko IDs found");
      }

      const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`;
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert back to our symbol format
      const priceMap: Record<string, number> = {};

      tokenSymbols.forEach(symbol => {
        const coingeckoId = SYMBOL_TO_COINGECKO[symbol];
        if (coingeckoId && data[coingeckoId]) {
          priceMap[symbol] = data[coingeckoId].usd;
        } else {
          priceMap[symbol] = 0; // Fallback
        }
      });

      setPrices(priceMap);
    } catch (err) {
      console.error("❌ Error fetching prices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prices");

      // Fallback prices
      const fallbackPrices: Record<string, number> = {
        WETH: 2000,
        USDC: 1,
        ARB: 1.2,
        WBTC: 45000,
        DAI: 1,
        LINK: 15,
        UNI: 8,
        MATIC: 0.8,
        AAVE: 95,
        CRV: 0.4,
      };

      const priceMap: Record<string, number> = {};
      tokenSymbols.forEach(symbol => {
        priceMap[symbol] = fallbackPrices[symbol] || 0;
      });
      setPrices(priceMap);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when tokenSymbols change
  useEffect(() => {
    fetchPrices();
  }, [tokenSymbols.join(",")]); // Dependency on symbols

  return {
    prices,
    isLoading,
    error,
    fetchPrices,
    hasPrices: Object.keys(prices).length > 0,
  };
};
