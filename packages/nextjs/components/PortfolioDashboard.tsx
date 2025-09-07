"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { IndividualPortfolio } from "./IndividualPortfolio";
import { BatchedPortfolio } from "./BatchedPortfolio";
import { MintTokens } from "./MintToken";
import { useDynamicTokens, useTokenPrices } from "~~/hooks/scaffold-eth";

export const PortfolioDashboard = () => {
  const { address } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);
  const [performanceData, setPerformanceData] = useState({
    individual: { time: 0, calls: 0 },
    batched: { time: 0, calls: 0 },
  });
  const { tokens, isLoading: tokensLoading } = useDynamicTokens();
  const tokenSymbols = tokens.map(token => token.symbol);

  const { prices } = useTokenPrices(tokenSymbols);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const updateIndividualPerformance = (data: { time: number; calls: number }) => {
    setPerformanceData(prev => ({
      ...prev,
      individual: data,
    }));
  };

  const updateBatchedPerformance = (data: { time: number; calls: number }) => {
    setPerformanceData(prev => ({
      ...prev,
      batched: data,
    }));
  };

  const calculateImprovement = () => {
    if (performanceData.individual.time === 0 || performanceData.batched.time === 0) return 0;
    return Math.round((1 - performanceData.batched.time / performanceData.individual.time) * 100);
  };

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-white text-lg sm:text-xl font-semibold">Please connect your wallet to view portfolio</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokensLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg sm:text-xl">Loading contracts...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="text-center text-white">
          <p className="text-lg sm:text-xl">No tokens found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Portfolio Dashboard</h1>
              <p className="text-white/70 text-sm sm:text-base break-all">
                Connected: <span className="font-mono text-blue-300">{address}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">Refresh Portfolio</span>
                  <span className="sm:hidden">Refresh</span>
                </span>
              </button>
              <MintTokens userAddress={address} tokens={tokens} />
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        {(performanceData.individual.time > 0 || performanceData.batched.time > 0) && (
          <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/20 shadow-2xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center text-white">
              ⚡ Performance Comparison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Individual Performance */}
              <div className="group bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-red-500/30 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-red-300 text-sm sm:text-lg">Individual Calls</h4>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">
                  {performanceData.individual.time.toFixed(2)}ms
                </p>
                <p className="text-xs sm:text-sm text-red-300">{performanceData.individual.calls} RPC calls</p>
              </div>

              {/* Batched Performance */}
              <div className="group bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-green-500/30 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-green-300 text-sm sm:text-lg">Batched Calls</h4>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                  {performanceData.batched.time.toFixed(2)}ms
                </p>
                <p className="text-xs sm:text-sm text-green-300">{performanceData.batched.calls} RPC call</p>
              </div>

              {/* Improvement */}
              <div className="group bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-blue-500/30 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl sm:col-span-2 lg:col-span-1">
                <div className="mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-blue-300 text-sm sm:text-lg">Improvement</h4>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">{calculateImprovement()}%</p>
                <p className="text-xs sm:text-sm text-blue-300">Faster execution</p>
              </div>
            </div>
          </div>
        )}

        {/* Individual Portfolio */}
        <IndividualPortfolio
          userAddress={address}
          refreshKey={refreshKey}
          prices={prices}
          tokens={tokens}
          onPerformanceUpdate={updateIndividualPerformance}
        />

        {/* Elegant Divider */}
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-32 sm:max-w-md"></div>
          <div className="mx-3 sm:mx-4 text-white/50 font-semibold text-lg sm:text-xl">VS</div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-32 sm:max-w-md"></div>
        </div>

        {/* Batched Portfolio */}
        <BatchedPortfolio
          userAddress={address}
          refreshKey={refreshKey}
          prices={prices}
          tokens={tokens}
          onPerformanceUpdate={updateBatchedPerformance}
        />
      </div>
    </div>
  );
};
