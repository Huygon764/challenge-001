"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Token } from "~~/types/token/token";
import { formatUnits } from "viem";
import { formatCurrency } from "~~/utils/scaffold-eth/format";

type ContractTokenType = "WETH" | "USDC" | "ARB" | "WBTC" | "DAI" | "LINK" | "UNI" | "MATIC" | "AAVE" | "CRV";

// Individual Token Balance Card
const TokenBalanceCard = ({
  token,
  balance,
  isLoading,
  error,
  prices,
}: {
  token: Token;
  balance: bigint | undefined;
  isLoading: boolean;
  error: any;
  prices: Record<string, number>;
}) => {
  const formattedBalance = balance ? formatUnits(balance, token.decimals) : "0";
  const usdValue = parseFloat(formattedBalance) * (prices[token.symbol] || 0);

  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
      <div className="mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-white">{token.symbol}</h3>
        <p className="text-xs sm:text-sm text-white/60">{token.name}</p>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-white/20 rounded w-20"></div>
            <div className="h-4 bg-white/20 rounded w-16"></div>
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm">Error loading</p>
        ) : (
          <>
            <p className="text-xl sm:text-2xl font-bold text-white">{parseFloat(formattedBalance).toLocaleString()}</p>
            <p className="text-sm sm:text-base text-white/80 font-medium">{formatCurrency(usdValue)}</p>
          </>
        )}
      </div>
    </div>
  );
};

export const IndividualPortfolio = ({
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
  // Performance tracking refs
  const performanceRef = useRef<{
    startTime: number | null;
    isTracking: boolean;
    timeoutId: NodeJS.Timeout | null;
  }>({
    startTime: null,
    isTracking: false,
    timeoutId: null,
  });

  // Individual balance hooks for each token - must be declared at top level
  const wethBalance = useScaffoldReadContract({
    contractName: "WETH" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const usdcBalance = useScaffoldReadContract({
    contractName: "USDC" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const arbBalance = useScaffoldReadContract({
    contractName: "ARB" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const wbtcBalance = useScaffoldReadContract({
    contractName: "WBTC" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const daiBalance = useScaffoldReadContract({
    contractName: "DAI" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const linkBalance = useScaffoldReadContract({
    contractName: "LINK" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const uniBalance = useScaffoldReadContract({
    contractName: "UNI" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const maticBalance = useScaffoldReadContract({
    contractName: "MATIC" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const aaveBalance = useScaffoldReadContract({
    contractName: "AAVE" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  const crvBalance = useScaffoldReadContract({
    contractName: "CRV" as ContractTokenType,
    functionName: "balanceOf",
    args: [userAddress],
    watch: false,
  });

  // Create mapping for easy access to balance hooks
  const balanceHooks = useMemo(
    () => ({
      WETH: wethBalance,
      USDC: usdcBalance,
      ARB: arbBalance,
      WBTC: wbtcBalance,
      DAI: daiBalance,
      LINK: linkBalance,
      UNI: uniBalance,
      MATIC: maticBalance,
      AAVE: aaveBalance,
      CRV: crvBalance,
    }),
    [
      wethBalance,
      usdcBalance,
      arbBalance,
      wbtcBalance,
      daiBalance,
      linkBalance,
      uniBalance,
      maticBalance,
      aaveBalance,
      crvBalance,
    ],
  );

  // Create array of balance calls for measuring performance
  const balanceCalls = useMemo(() => {
    return tokens.map(token => balanceHooks[token.symbol as keyof typeof balanceHooks]).filter(Boolean);
  }, [tokens, balanceHooks]);

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    return formatCurrency(
      tokens.reduce((total, token) => {
        const balanceHook = balanceHooks[token.symbol as keyof typeof balanceHooks];
        const balance = balanceHook?.data;
        if (!balance) return total;

        const formattedBalance = parseFloat(formatUnits(balance, token.decimals));
        return total + formattedBalance * (prices[token.symbol] || 0);
      }, 0),
    );
  };

  // Check if all calls are complete and report performance
  const checkPerformanceComplete = useCallback(() => {
    const { startTime, isTracking } = performanceRef.current;

    if (!isTracking || !startTime) return;

    const allLoaded = balanceCalls.every(call => call && !call.isLoading);
    const hasError = balanceCalls.some(call => call && call.error);

    if (allLoaded || hasError) {
      const endTime = performance.now();
      performanceRef.current.isTracking = false;
      performanceRef.current.startTime = null;

      // Clear any existing timeout
      if (performanceRef.current.timeoutId) {
        clearTimeout(performanceRef.current.timeoutId);
        performanceRef.current.timeoutId = null;
      }

      onPerformanceUpdate({
        time: endTime - startTime,
        calls: tokens.length,
      });
    } else {
      // Set timeout with cleanup
      if (performanceRef.current.timeoutId) {
        clearTimeout(performanceRef.current.timeoutId);
      }

      performanceRef.current.timeoutId = setTimeout(checkPerformanceComplete, 50);
    }
  }, [balanceCalls, tokens.length, onPerformanceUpdate]);

  // Monitor loading states for performance measurement
  React.useEffect(() => {
    if (performanceRef.current.isTracking) {
      checkPerformanceComplete();
    }
  }, [checkPerformanceComplete, balanceCalls.map(call => call?.isLoading).join(",")]);

  // Handle refresh and start performance tracking
  React.useEffect(() => {
    if (refreshKey > 0) {
      // Clear any existing tracking
      if (performanceRef.current.timeoutId) {
        clearTimeout(performanceRef.current.timeoutId);
        performanceRef.current.timeoutId = null;
      }

      // Start new performance tracking
      performanceRef.current.startTime = performance.now();
      performanceRef.current.isTracking = true;

      // Trigger refetch for all balance calls
      Promise.all(balanceCalls.filter(call => call && call.refetch).map(call => call.refetch())).catch(error => {
        console.error("Error during refetch:", error);
        // Stop tracking on error
        performanceRef.current.isTracking = false;
        performanceRef.current.startTime = null;
      });
    }

    // Cleanup function
    return () => {
      if (performanceRef.current.timeoutId) {
        clearTimeout(performanceRef.current.timeoutId);
        performanceRef.current.timeoutId = null;
      }
    };
  }, [refreshKey]); // Only depend on refreshKey

  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-300/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Individual Calls Approach</h2>
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-medium text-red-100">Total Portfolio Value</h3>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">{calculateTotalValue()}</p>
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {tokens.map(token => {
          const balanceHook = balanceHooks[token.symbol as keyof typeof balanceHooks];
          return (
            <TokenBalanceCard
              key={`individual-${token.symbol}-${refreshKey}`}
              token={token}
              balance={balanceHook?.data}
              isLoading={balanceHook?.isLoading || false}
              error={balanceHook?.error}
              prices={prices}
            />
          );
        })}
      </div>
    </div>
  );
};
