"use client";

import { useState, useEffect } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Token } from "~~/types/token/token";
import { formatUnits } from "viem";
import { formatCurrency } from "~~/utils/scaffold-eth/format";

export const BatchedPortfolio = ({
  userAddress,
  refreshKey,
  prices,
  tokens,
  onPerformanceUpdate,
}: {
  userAddress: string;
  refreshKey: number;
  prices: Record<string, number>;
  tokens: Token[];
  onPerformanceUpdate: (data: { time: number; calls: number }) => void;
}) => {
  const {
    data: batchedBalances,
    isLoading,
    error,
    refetch,
  } = useScaffoldReadContract({
    contractName: "PortfolioReader",
    functionName: "getBalances",
    args: [userAddress, tokens.map(t => t.address)],
    watch: false,
  });

  // Measure batched performance
  const measureBatchedCalls = async () => {
    const startTime = performance.now();
    await refetch();
    const endTime = performance.now();

    const performanceData = {
      time: endTime - startTime,
      calls: 1,
    };

    onPerformanceUpdate(performanceData);
  };

  // Calculate total value from batched data
  const calculateBatchedTotalValue = () => {
    if (!batchedBalances) return 0;

    return formatCurrency(
      batchedBalances.reduce((total: number, balance: bigint, index: number) => {
        const token = tokens[index];
        const formattedBalance = parseFloat(formatUnits(balance, token.decimals));
        return total + formattedBalance * (prices[token.symbol] || 0);
      }, 0),
    );
  };

  // Auto-measure when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      measureBatchedCalls();
    }
  }, [refreshKey]);

  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Batched Calls Approach</h2>
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-medium text-green-100">Total Portfolio Value</h3>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">{calculateBatchedTotalValue()}</p>
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: tokens.length }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20"
            >
              <div className="animate-pulse space-y-3">
                <div className="space-y-1">
                  <div className="h-5 bg-white/20 rounded w-12"></div>
                  <div className="h-3 bg-white/20 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-white/20 rounded w-20"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-2 md:col-span-5 bg-red-500/20 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 text-center">
            <p className="text-red-400 font-medium">Error loading batched data</p>
          </div>
        ) : (
          batchedBalances?.map((balance: bigint, index: number) => {
            const token = tokens[index];
            const formattedBalance = formatUnits(balance, token.decimals);
            const usdValue = parseFloat(formattedBalance) * (prices[token.symbol] || 0);

            return (
              <div
                key={`batched-${token.symbol}`}
                className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{token.symbol}</h3>
                  <p className="text-xs sm:text-sm text-white/60">{token.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {parseFloat(formattedBalance).toLocaleString()}
                  </p>
                  <p className="text-sm sm:text-base text-white/80 font-medium">{formatCurrency(usdValue)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
