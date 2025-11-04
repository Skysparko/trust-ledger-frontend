import { BaseApi } from './base.api';

export type DeployBondTokenPayload = {
  opportunityId: string;
  name?: string;
  symbol?: string;
  maturityDate?: number;
  couponRate?: number;
  bondPrice?: number;
};

export type MintBondsPayload = {
  opportunityId: string;
  toAddress: string;
  amount: number;
};

export type TransferBondsPayload = {
  opportunityId: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
};

export type BondBalanceResponse = {
  bonds: number;
  tokenBalance: string;
  contractAddress: string;
};

export type ContractInfoResponse = {
  contractAddress: string;
  name: string;
  symbol: string;
  opportunityId: string;
  maturityDate: number;
  couponRate: number;
  bondPrice: string;
  isActive: boolean;
  totalBondsIssued: number;
  explorerUrl: string;
};

export type UserHolding = {
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  contractAddress: string;
  bonds: number;
};

export type BlockchainResponse<T> = {
  success: boolean;
  data: T;
};

/**
 * Blockchain API
 * Handles blockchain operations for bond tokens
 */
export class BlockchainApi extends BaseApi {
  /**
   * Deploy a BondToken contract for an investment opportunity (admin only)
   */
  static async deployBondToken(
    payload: DeployBondTokenPayload
  ): Promise<BlockchainResponse<{ contractAddress: string; transactionHash: string; explorerUrl: string }>> {
    return this.post<BlockchainResponse<{ contractAddress: string; transactionHash: string; explorerUrl: string }>>(
      '/blockchain/deploy-bond-token',
      payload
    );
  }

  /**
   * Mint bonds to a user's wallet
   */
  static async mintBonds(
    payload: MintBondsPayload
  ): Promise<BlockchainResponse<{ transactionHash: string; explorerUrl: string }>> {
    return this.post<BlockchainResponse<{ transactionHash: string; explorerUrl: string }>>(
      '/blockchain/mint-bonds',
      payload
    );
  }

  /**
   * Get bond balance for an address
   */
  static async getBondBalance(
    opportunityId: string,
    address: string
  ): Promise<BlockchainResponse<BondBalanceResponse>> {
    return this.get<BlockchainResponse<BondBalanceResponse>>(
      `/blockchain/bond-balance/${opportunityId}/${address}`
    );
  }

  /**
   * Transfer bonds between addresses
   */
  static async transferBonds(
    payload: TransferBondsPayload
  ): Promise<BlockchainResponse<{ transactionHash: string; explorerUrl: string }>> {
    return this.post<BlockchainResponse<{ transactionHash: string; explorerUrl: string }>>(
      '/blockchain/transfer-bonds',
      payload
    );
  }

  /**
   * Get contract information
   */
  static async getContractInfo(
    opportunityId: string
  ): Promise<BlockchainResponse<ContractInfoResponse>> {
    return this.get<BlockchainResponse<ContractInfoResponse>>(
      `/blockchain/contract-info/${opportunityId}`
    );
  }

  /**
   * Get user's bond holdings across all opportunities
   */
  static async getUserHoldings(
    address: string
  ): Promise<BlockchainResponse<UserHolding[]>> {
    return this.get<BlockchainResponse<UserHolding[]>>(
      `/blockchain/user-holdings/${address}`
    );
  }
}

