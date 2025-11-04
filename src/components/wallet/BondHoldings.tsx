'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { BlockchainApi, UserHolding } from '@/api/blockchain.api';

export function BondHoldings() {
  const { address, isConnected } = useAccount();
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadHoldings();
    } else {
      setHoldings([]);
    }
  }, [address, isConnected]);

  const loadHoldings = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);
    try {
      const response = await BlockchainApi.getUserHoldings(address);
      if (response.success) {
        setHoldings(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load holdings');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        Connect your wallet to view bond holdings
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading holdings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={loadHoldings}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        No bond holdings found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Bond Holdings</h2>
      <div className="grid gap-4">
        {holdings.map((holding) => (
          <div
            key={holding.opportunityId}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{holding.opportunityTitle}</h3>
                <p className="text-sm text-gray-600">{holding.company}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{holding.bonds}</p>
                <p className="text-sm text-gray-500">bonds</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Contract: {holding.contractAddress.slice(0, 10)}...{holding.contractAddress.slice(-8)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

