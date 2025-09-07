import { useState, useEffect } from "react";
import { Token } from "~~/types/token/token";

interface ApiResponse {
  tokens: Token[];
  contractAddresses: {
    PORTFOLIO_READER: string;
    YOUR_CONTRACT: string;
  };
  lastUpdated: string;
}

export const useDynamicTokens = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: ApiResponse = await response.json();
      setData(apiData);
    } catch (err) {
      console.error("❌ Error fetching dynamic tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tokens");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return {
    tokens: data?.tokens || [],
    contractAddresses: data?.contractAddresses || {},
    isLoading,
    error,
    refetch: fetchTokens,
    lastUpdated: data?.lastUpdated,
  };
};

export type { Token };
