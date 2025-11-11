"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminApi, BlockchainInvestment } from "@/api/admin.api";
import { InvestmentOpportunitiesApi, InvestmentOpportunityListItem } from "@/api/investment-opportunities.api";
import { BlockchainApi } from "@/api/blockchain.api";
import { Search, ExternalLink, Copy, CheckCircle2, RefreshCw, Rocket, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 20;

export default function AdminBlockchainPage() {
  const [investments, setInvestments] = useState<BlockchainInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<BlockchainInvestment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalContracts: number; totalInvestments: number } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  // Undeployed opportunities state
  const [undeployedOpportunities, setUndeployedOpportunities] = useState<InvestmentOpportunityListItem[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [deployingOpportunityId, setDeployingOpportunityId] = useState<string | null>(null);
  
  // Success/Error message state
  const [deploymentMessage, setDeploymentMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    contractAddress?: string;
    transactionHash?: string;
  } | null>(null);

  // Determine explorer URL based on network
  const getExplorerUrl = (address: string, type: "address" | "tx" = "address") => {
    // You can make this configurable via env variable
    const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || "testnet";
    const baseUrl = network === "mainnet" 
      ? "https://sonicscan.org" 
      : "https://testnet.sonicscan.org";
    return `${baseUrl}/${type}/${address}`;
  };

  const copyToClipboard = (text: string, address: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    loadInvestments();
    loadUndeployedOpportunities();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = investments.filter(
        (inv) =>
          (inv.userEmail && inv.userEmail.toLowerCase().includes(query)) ||
          (inv.userName && inv.userName.toLowerCase().includes(query)) ||
          (inv.opportunityTitle && inv.opportunityTitle.toLowerCase().includes(query)) ||
          (inv.company && inv.company.toLowerCase().includes(query)) ||
          (inv.contractAddress && inv.contractAddress.toLowerCase().includes(query)) ||
          (inv.walletAddress && inv.walletAddress.toLowerCase().includes(query))
      );
      setFilteredInvestments(filtered);
      setCurrentPage(1);
    } else {
      setFilteredInvestments(investments);
    }
  }, [searchQuery, investments]);

  const loadInvestments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminApi.getBlockchainInvestments();
      console.log("response", response.data);
      if (response.data.success) {
        // Ensure data is an array
        const investmentsData = Array.isArray(response.data.data) ? response.data.data : [];
        setInvestments(investmentsData);
        setFilteredInvestments(investmentsData);
        setStats({
          totalContracts: response.data.totalContracts || 0,
          totalInvestments: response.data.totalInvestments || 0,
        });
      } else {
        setError("Failed to load blockchain investments");
      }
    } catch (err: any) {
      console.error("Error loading blockchain investments:", err);
      setError(err.message || "Failed to load blockchain investments");
      // Set empty array on error so UI still renders
      setInvestments([]);
      setFilteredInvestments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUndeployedOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({ 
        limit: 100,
        page: 1 
      });
      
      const allOpportunities = response.opportunities || [];
      
      // Filter opportunities without contract addresses
      // Now we can check contractAddress directly from the response
      const undeployed = allOpportunities.filter(opp => {
        // If no contractAddress, it's undeployed
        if (!opp.contractAddress) {
          return true;
        }
        
        // If contractAddress exists but is empty string, it's undeployed
        if (opp.contractAddress.trim() === '') {
          return true;
        }
        
        // Contract is deployed, skip it
        return false;
      });
      
      setUndeployedOpportunities(undeployed);
    } catch (err: any) {
      console.error("Error loading undeployed opportunities:", err);
      // Don't show error, just set empty array
      setUndeployedOpportunities([]);
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const handleDeployContract = async (opportunity: InvestmentOpportunityListItem) => {
    setDeployingOpportunityId(opportunity.id);
    setDeploymentMessage(null); // Clear any previous messages
    
    try {
      const response = await BlockchainApi.deployBondToken({
        opportunityId: opportunity.id,
        name: `${opportunity.company} Bond`,
        symbol: `${opportunity.company.substring(0, 3).toUpperCase()}BOND`,
        couponRate: opportunity.rate, // Pass as percentage (e.g., 7.5 for 7.5%)
        bondPrice: opportunity.minInvestment, // Use minInvestment as price per bond
      });

      if (response.success) {
        // Show success message immediately
        setDeploymentMessage({
          type: 'success',
          title: 'Contract Deployed Successfully!',
          message: `The bond contract for "${opportunity.title}" has been deployed to the blockchain.`,
          contractAddress: response.data.contractAddress,
          transactionHash: response.data.transactionHash,
        });
        
        // Immediately remove from undeployed list (optimistic update)
        setUndeployedOpportunities(prev => 
          prev.filter(opp => opp.id !== opportunity.id)
        );
        
        // Reload undeployed opportunities list to ensure consistency
        // Use a small delay to ensure backend has updated
        setTimeout(async () => {
          await loadUndeployedOpportunities();
        }, 1000);
        
        // Reload investments to show new contract
        await loadInvestments();
        
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setDeploymentMessage(null);
        }, 10000);
      }
    } catch (err: any) {
      console.error("Error deploying contract:", err);
      const errorMessage = err.response?.data?.message 
        ? Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(", ")
          : err.response.data.message
        : err.message || "Unknown error";
      
      setDeploymentMessage({
        type: 'error',
        title: 'Deployment Failed',
        message: errorMessage,
      });
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => {
        setDeploymentMessage(null);
      }, 8000);
    } finally {
      setDeployingOpportunityId(null);
    }
  };

  // Client-side pagination for blockchain investments (since API doesn't support pagination)
  const paginatedItems = filteredInvestments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredInvestments.length / ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "confirmed":
      case "completed":
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return "-";
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading blockchain investments...</div>
      </div>
    );
  }

  // Show error but still render the page if we have any data
  const showErrorOnly = error && investments.length === 0;

  if (showErrorOnly) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blockchain Investments</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            View all investments recorded on the blockchain
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={loadInvestments} disabled={isLoading}>
                {isLoading ? "Loading..." : "Retry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blockchain Investments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          View all investments recorded on the Sonic blockchain
        </p>
      </div>

      {error && (
        <Card className="border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-orange-600 text-sm">{error}</div>
              <Button variant="outline" size="sm" onClick={loadInvestments} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Success/Error Message */}
      {deploymentMessage && (
        <Card className={deploymentMessage.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {deploymentMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={`font-semibold ${deploymentMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {deploymentMessage.title}
                  </div>
                  <div className={`text-sm mt-1 ${deploymentMessage.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {deploymentMessage.message}
                  </div>
                  {deploymentMessage.type === 'success' && deploymentMessage.contractAddress && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-green-700 dark:text-green-300">
                          Contract: {formatAddress(deploymentMessage.contractAddress)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(deploymentMessage.contractAddress!, deploymentMessage.contractAddress!)}
                          title="Copy contract address"
                        >
                          {copiedAddress === deploymentMessage.contractAddress ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <a
                          href={getExplorerUrl(deploymentMessage.contractAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="View on explorer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {deploymentMessage.transactionHash && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-green-700 dark:text-green-300">
                            TX: {formatAddress(deploymentMessage.transactionHash)}
                          </span>
                          <a
                            href={getExplorerUrl(deploymentMessage.transactionHash, "tx")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                            title="View transaction"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setDeploymentMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
              <p className="text-xs text-zinc-500 mt-1">Deployed bond contracts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvestments}</div>
              <p className="text-xs text-zinc-500 mt-1">All investments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">On-Chain Bonds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investments.reduce((sum, inv) => sum + (inv.onChainBonds || 0), 0)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Verified from Sonic network</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">With Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {investments.filter(inv => inv.blockchainError).length}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Undeployed Opportunities Section */}
      {undeployedOpportunities.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-orange-500" />
                  Undeployed Bond Contracts
                </CardTitle>
                <p className="text-sm text-zinc-500 mt-1">
                  {undeployedOpportunities.length} investment opportunity{undeployedOpportunities.length !== 1 ? 'ies' : ''} without deployed contracts
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUndeployedOpportunities}
                disabled={isLoadingOpportunities}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingOpportunities ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {undeployedOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-sm">{opp.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          {opp.company} • {opp.rate}% • {opp.termMonths} months
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Not Deployed
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeployContract(opp)}
                    disabled={deployingOpportunityId === opp.id || isLoadingOpportunities}
                    className="ml-4"
                  >
                    {deployingOpportunityId === opp.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy Contract
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoadingOpportunities && undeployedOpportunities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mr-2" />
              <span className="text-zinc-500">Checking for undeployed contracts...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Records</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by user, opportunity, or contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadInvestments}
                disabled={isLoading}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>On-Chain Bonds</TableHead>
                <TableHead>DB Bonds</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Contract Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-zinc-500 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">No blockchain investments found</p>
                      <p className="text-xs">
                        {investments.length === 0 
                          ? "No investments exist yet. Create an investment to see it here."
                          : "No investments match your search criteria."
                        }
                      </p>
                      {investments.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="mt-2"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((inv) => (
                  <TableRow key={inv.investmentId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inv.userName}</div>
                        <div className="text-xs text-zinc-500">{inv.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inv.walletAddress ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{formatAddress(inv.walletAddress)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(inv.walletAddress!, inv.walletAddress!)}
                            title="Copy wallet address"
                          >
                            {copiedAddress === inv.walletAddress ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <a
                            href={getExplorerUrl(inv.walletAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                            title="View wallet on explorer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">No wallet</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{inv.opportunityTitle}</TableCell>
                    <TableCell>{inv.company}</TableCell>
                    <TableCell>
                      {inv.blockchainError ? (
                        <div className="max-w-xs">
                          <div className="font-bold text-red-500 text-xs">Error</div>
                          <div className="text-xs text-red-400 break-all">{inv.blockchainError}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-green-600">{inv.onChainBonds || 0}</div>
                          <div className="text-xs text-zinc-500">
                            {inv.onChainTokenBalance && inv.onChainTokenBalance !== "0" 
                              ? "✓ Verified" 
                              : inv.contractAddress 
                                ? "Checking..." 
                                : "No contract"
                            }
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{inv.dbBonds}</div>
                      <div className="text-xs text-zinc-500">Database</div>
                    </TableCell>
                    <TableCell>${inv.dbAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      {inv.contractAddress ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{formatAddress(inv.contractAddress)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(inv.contractAddress!, inv.contractAddress!)}
                            title="Copy address"
                          >
                            {copiedAddress === inv.contractAddress ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <a
                            href={getExplorerUrl(inv.contractAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">Not deployed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inv.status)}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {inv.createdAt 
                        ? format(new Date(inv.createdAt), "MMM dd, yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {inv.mintTxHash && (
                          <a
                            href={getExplorerUrl(inv.mintTxHash, "tx")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                            title="View mint transaction"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {inv.contractDeploymentTx && (
                          <a
                            href={getExplorerUrl(inv.contractDeploymentTx, "tx")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                            title="View deployment transaction"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-zinc-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvestments.length)} of{" "}
                {filteredInvestments.length} investments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

