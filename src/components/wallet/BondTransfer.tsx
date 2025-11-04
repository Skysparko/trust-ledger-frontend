'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
import { BlockchainApi } from '@/api/blockchain.api';

type BondTransferProps = {
  opportunityId: string;
  contractAddress: string;
  onTransferComplete?: () => void;
};

export function BondTransfer({ opportunityId, contractAddress, onTransferComplete }: BondTransferProps) {
  const { address } = useAccount();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await BlockchainApi.transferBonds({
        opportunityId,
        fromAddress: address,
        toAddress,
        amount: parseInt(amount),
      });

      if (response.success) {
        setSuccess(`Transfer successful! TX: ${response.data.transactionHash.slice(0, 10)}...`);
        setToAddress('');
        setAmount('');
        onTransferComplete?.();
      } else {
        setError('Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800">
        Please connect your wallet to transfer bonds
      </div>
    );
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-semibold">Transfer Bonds</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Address
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="0x..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (bonds)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1"
          min="1"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !toAddress || !amount}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Transferring...' : 'Transfer Bonds'}
      </button>
    </form>
  );
}

