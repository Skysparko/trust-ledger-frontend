"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminTransaction,
  useConfirmInvestment,
  useAdminCancelInvestment,
} from "@/hooks/swr/useAdmin";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Building2,
  FileText,
  CreditCard,
  Shield,
  Banknote,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params?.id as string;
  const { transaction, isLoading, isError, error, mutate } = useAdminTransaction(
    transactionId || null
  );
  const { confirmInvestment, isConfirming } = useConfirmInvestment();
  const { cancelInvestment, isCancelling } = useAdminCancelInvestment();
  const [copiedId, setCopiedId] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleConfirm = async () => {
    if (!transactionId || !transaction) return;
    
    // Check if investment opportunity is active before confirming
    const rawTransaction = transaction as any;
    const investmentOpportunity = rawTransaction?.investmentOpportunity;
    if (investmentOpportunity && investmentOpportunity.status !== "active") {
      // The button should already be disabled, but show a toast if somehow clicked
      if (typeof window !== "undefined") {
        import("sonner").then(({ toast }) => {
          toast.error("Cannot Confirm", {
            description: "Investment opportunity is not active",
            duration: 5000,
          });
        });
      }
      return;
    }
    
    // Validate funding target before confirming
    if (investmentOpportunity) {
      const investment = rawTransaction?.investment;
      const investmentAmount = investment?.amount || (investment?.bonds || 0) * (investmentOpportunity.minInvestment || 100);
      const remainingFunding = investmentOpportunity.maxInvestment - investmentOpportunity.currentFunding;
      
      if (investmentAmount > remainingFunding) {
        if (typeof window !== "undefined") {
          import("sonner").then(({ toast }) => {
            toast.error("Cannot Confirm Investment", {
              description: `Investment amount ($${investmentAmount.toLocaleString()}) exceeds remaining funding target ($${remainingFunding.toLocaleString()})`,
              duration: 5000,
            });
          });
        }
        return;
      }
    }
    
    try {
      await confirmInvestment({ id: transactionId });
      await mutate(); // Refresh the transaction data
    } catch (err: any) {
      // Error toast is already shown by axios interceptor
      console.error("Failed to confirm transaction:", err);
    }
  };

  const handleCancel = async () => {
    if (!transactionId) return;
    try {
      await cancelInvestment({ id: transactionId });
      await mutate(); // Refresh the transaction data
    } catch (err: any) {
      // Error toast is already shown by axios interceptor
      console.error("Failed to cancel transaction:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "confirmed":
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
      case "cancelled":
        return "bg-red-500";
      case "refunded":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return "-";
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Extract nested data from raw transaction (if available)
  const rawTransaction = transaction as any;
  const user = rawTransaction?.user;
  const investment = rawTransaction?.investment;
  const investmentOpportunity = rawTransaction?.investmentOpportunity;
  
  // Check if investment opportunity is active
  const isOpportunityActive = investmentOpportunity?.status === "active";
  
  // Check if investment would exceed funding target
  const wouldExceedFunding = (() => {
    if (!investmentOpportunity) return false;
    const investment = rawTransaction?.investment;
    const investmentAmount = investment?.amount || (investment?.bonds || 0) * (investmentOpportunity.minInvestment || 100);
    const remainingFunding = investmentOpportunity.maxInvestment - investmentOpportunity.currentFunding;
    return investmentAmount > remainingFunding;
  })();
  
  const canConfirm = 
    transaction?.status?.toLowerCase() === "pending" && 
    isOpportunityActive &&
    !wouldExceedFunding;
  const canCancel =
    transaction?.status?.toLowerCase() === "pending" ||
    transaction?.status?.toLowerCase() === "confirmed";
  
  // Get the reason why confirm button is disabled
  const getConfirmDisabledReason = (): string | null => {
    if (isConfirming || isCancelling) {
      return "Transaction is being processed";
    }
    if (transaction?.status?.toLowerCase() !== "pending") {
      return `Transaction status is "${transaction?.status}" - only pending transactions can be confirmed`;
    }
    if (!isOpportunityActive) {
      const status = investmentOpportunity?.status || "unknown";
      return `Investment opportunity is not active (status: ${status}) - only active opportunities can be confirmed`;
    }
    if (wouldExceedFunding && investmentOpportunity) {
      const investment = rawTransaction?.investment;
      const investmentAmount = investment?.amount || (investment?.bonds || 0) * (investmentOpportunity.minInvestment || 100);
      console.log("investmentAmount", investmentAmount);
      console.log("investmentOpportunity.maxInvestment", investmentOpportunity.maxInvestment);
      console.log("investmentOpportunity.currentFunding", investmentOpportunity.currentFunding);
      const remainingFunding = investmentOpportunity.maxInvestment - investmentOpportunity.currentFunding;
      return `Investment amount ($${investmentAmount.toLocaleString()}) exceeds remaining funding target ($${remainingFunding.toLocaleString()})`;
    }
    return null;
  };
  
  const confirmDisabledReason = getConfirmDisabledReason();
  
  // Hide actions if transaction is in a final/completed state
  const isCompleted = 
    transaction?.status?.toLowerCase() === "completed" ||
    transaction?.status?.toLowerCase() === "failed" ||
    transaction?.status?.toLowerCase() === "refunded" ||
    transaction?.status?.toLowerCase() === "cancelled";
  const userProfile = user?.profile;
  const bankDetails = userProfile?.bank;

  const getKycStatusColor = (status?: string) => {
    if (!status) return "bg-gray-500";
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleCopyTransactionId = async () => {
    if (!transaction) return;
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy transaction ID:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/transactions")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">
                {error?.message || "Transaction not found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/transactions")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-600 dark:text-zinc-400">
              Transaction ID: <span className="font-mono text-sm">{transaction.id}</span>
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={handleCopyTransactionId}
              title="Copy Transaction ID"
            >
              {copiedId ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Badge className={getStatusColor(transaction.status)}>
          {transaction.status}
        </Badge>
      </div>

      {/* Action Buttons - Only show if transaction is not in a final state */}
      {!isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div 
                className="relative inline-block"
                onMouseEnter={() => {
                  if (confirmDisabledReason) {
                    setShowTooltip(true);
                  }
                }}
                onMouseLeave={() => {
                  setShowTooltip(false);
                }}
              >
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm || isConfirming || isCancelling}
                  className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-200 font-semibold px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Transaction
                    </>
                  )}
                </Button>
                {confirmDisabledReason && showTooltip && (
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-2xl border border-zinc-700/50 pointer-events-none z-[100] max-w-sm whitespace-normal text-left animate-in fade-in-0 zoom-in-95 duration-200"
                  >
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-zinc-900/95"></div>
                    </div>
                    <p className="text-zinc-100 leading-relaxed">{confirmDisabledReason}</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCancel}
                disabled={!canCancel || isConfirming || isCancelling}
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 font-semibold px-6 py-2.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Transaction
                  </>
                )}
              </Button>
            </div>
            {(!canConfirm && !canCancel) && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                This transaction cannot be confirmed or cancelled in its current state.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Amount</p>
              <p className="text-2xl font-bold mt-1">
                ${Math.abs(transaction.amount || investment?.amount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bonds</p>
              <p className="text-2xl font-bold mt-1">{transaction.bonds || investment?.bonds || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</p>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Payment Method</p>
              <p className="text-lg font-semibold mt-1">
                {formatPaymentMethod(transaction.paymentMethod || investment?.paymentMethod)}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Transaction Date</p>
                <p className="text-lg">
                  {transaction.date || investment?.date
                    ? format(new Date(transaction.date || investment.date), "PPP 'at' p")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Transaction ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {transaction.id}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    onClick={handleCopyTransactionId}
                    title="Copy Transaction ID"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              {investment?.documentUrl && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Document</p>
                  <a
                    href={investment.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User Information
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Investment Details
          </TabsTrigger>
          <TabsTrigger value="opportunity" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Investment Opportunity
          </TabsTrigger>
        </TabsList>

        {/* User Information Tab */}
        <TabsContent value="user" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</p>
                  <p className="text-lg font-semibold">{user?.name || transaction.userName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</p>
                  <p className="text-lg">{user?.email || transaction.userEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User Type</p>
                  <Badge className="mt-1">
                    {user?.type || "individual"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Account Status</p>
                  <Badge className={user?.isActive ? "bg-green-500 mt-1" : "bg-gray-500 mt-1"}>
                    {user?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User ID</p>
                  <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {user?.id || transaction.userId || "-"}
                  </p>
                </div>
                {user?.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Member Since</p>
                    <p className="text-lg">
                      {format(new Date(user.createdAt), "PPP")}
                    </p>
                  </div>
                )}
                {user?.lastLogin && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Login</p>
                    <p className="text-lg">
                      {format(new Date(user.lastLogin), "PPP 'at' p")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  KYC & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile?.kycStatus && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">KYC Status</p>
                    <Badge className={getKycStatusColor(userProfile.kycStatus)}>
                      {userProfile.kycStatus}
                    </Badge>
                  </div>
                )}
                {userProfile?.emailVerified !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email Verified</p>
                    <Badge className={userProfile.emailVerified ? "bg-green-500" : "bg-gray-500"}>
                      {userProfile.emailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                    {userProfile.emailVerifiedAt && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {format(new Date(userProfile.emailVerifiedAt), "PPP")}
                      </p>
                    )}
                  </div>
                )}
                {userProfile?.agreementSigned !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Agreement Signed</p>
                    <Badge className={userProfile.agreementSigned ? "bg-green-500" : "bg-gray-500"}>
                      {userProfile.agreementSigned ? "Signed" : "Not Signed"}
                    </Badge>
                    {userProfile.agreementSignedAt && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {format(new Date(userProfile.agreementSignedAt), "PPP")}
                      </p>
                    )}
                  </div>
                )}
                {userProfile?.twoFactorEnabled !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">2FA Enabled</p>
                    <Badge className={userProfile.twoFactorEnabled ? "bg-green-500" : "bg-gray-500"}>
                      {userProfile.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                )}
                {userProfile?.kycDocumentName && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">KYC Document</p>
                    {userProfile.kycDocumentUrl ? (
                      <a
                        href={userProfile.kycDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 mt-1"
                      >
                        <FileText className="h-4 w-4" />
                        {userProfile.kycDocumentName}
                      </a>
                    ) : (
                      <p className="text-sm">{userProfile.kycDocumentName}</p>
                    )}
                  </div>
                )}
                {userProfile?.phone && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</p>
                    <p className="text-lg">{userProfile.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bank Details */}
          {bankDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {bankDetails.iban && (
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">IBAN</p>
                      <p className="text-lg font-mono">{bankDetails.iban}</p>
                    </div>
                  )}
                  {bankDetails.bic && (
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">BIC</p>
                      <p className="text-lg font-mono">{bankDetails.bic}</p>
                    </div>
                  )}
                  {bankDetails.accountName && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Account Name</p>
                      <p className="text-lg">{bankDetails.accountName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Investment Details Tab */}
        <TabsContent value="investment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Investment ID</p>
                  <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 mt-1">
                    {investment?.id || transaction.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Amount</p>
                  <p className="text-2xl font-bold mt-1">
                    ${Math.abs(investment?.amount || transaction.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bonds</p>
                  <p className="text-lg font-semibold mt-1">{investment?.bonds || transaction.bonds || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</p>
                  <Badge className={getStatusColor(investment?.status || transaction.status)}>
                    {investment?.status || transaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Payment Method</p>
                  <p className="text-lg mt-1">
                    {formatPaymentMethod(investment?.paymentMethod || transaction.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Investment Date</p>
                  <p className="text-lg mt-1">
                    {investment?.date
                      ? format(new Date(investment.date), "PPP 'at' p")
                      : "-"}
                  </p>
                </div>
                {investment?.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</p>
                    <p className="text-lg">
                      {format(new Date(investment.createdAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {investment?.updatedAt && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Updated</p>
                    <p className="text-lg">
                      {format(new Date(investment.updatedAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {investment?.documentUrl && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Document</p>
                    <a
                      href={investment.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 mt-1"
                    >
                      <FileText className="h-4 w-4" />
                      View Investment Document
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Opportunity Tab */}
        <TabsContent value="opportunity" className="space-y-4">
          {investmentOpportunity ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Title</p>
                      <p className="text-lg font-semibold">{investmentOpportunity.title}</p>
                    </div>
                    {investmentOpportunity.slug && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Slug</p>
                        <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                          {investmentOpportunity.slug}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Company</p>
                      <p className="text-lg">{investmentOpportunity.company || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</p>
                      <Badge>{investmentOpportunity.type || "-"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sector</p>
                      <p className="text-lg">{investmentOpportunity.sector || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                      <p className="text-lg">{investmentOpportunity.location || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</p>
                      <Badge className="mt-1">{investmentOpportunity.status || "-"}</Badge>
                    </div>
                    {investmentOpportunity.isFeatured !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Featured</p>
                        <Badge className={investmentOpportunity.isFeatured ? "bg-blue-500 mt-1" : "bg-gray-500 mt-1"}>
                          {investmentOpportunity.isFeatured ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Interest Rate</p>
                      <p className="text-2xl font-bold">{investmentOpportunity.rate || "-"}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Term</p>
                      <p className="text-lg">{investmentOpportunity.termMonths || "-"} months</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Price</p>
                      <p className="text-lg">${investmentOpportunity.minInvestment?.toLocaleString() || "-"}</p>
                    </div>
                    {investmentOpportunity.maxInvestment !== undefined &&
                      investmentOpportunity.maxInvestment !== null && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Offering</p>
                          <p className="text-lg">${investmentOpportunity.maxInvestment.toLocaleString()}</p>
                        </div>
                      )}
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Bonds</p>
                      <p className="text-lg">
                        ${investmentOpportunity.totalFundingTarget?.toLocaleString() || "-"}
                      </p>
                    </div>
                    {investmentOpportunity.currentFunding !== undefined &&
                      investmentOpportunity.currentFunding !== null && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Funding</p>
                          <p className="text-lg">
                            ${investmentOpportunity.currentFunding.toLocaleString()} (
                            {investmentOpportunity.totalFundingTarget
                              ? Math.round(
                                  (investmentOpportunity.currentFunding / investmentOpportunity.totalFundingTarget) *
                                    100
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                      )}
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Payment Frequency</p>
                      <p className="text-lg">{investmentOpportunity.paymentFrequency || "-"}</p>
                    </div>
                    {investmentOpportunity.bondStructure && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bond Structure</p>
                        <p className="text-lg">{investmentOpportunity.bondStructure}</p>
                      </div>
                    )}
                    {investmentOpportunity.creditRating && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Credit Rating</p>
                        <Badge>{investmentOpportunity.creditRating}</Badge>
                      </div>
                    )}
                    {investmentOpportunity.riskLevel && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Risk Level</p>
                        <Badge>{investmentOpportunity.riskLevel}</Badge>
                      </div>
                    )}
                    {investmentOpportunity.earlyRedemptionAllowed !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          Early Redemption Allowed
                        </p>
                        <Badge className={investmentOpportunity.earlyRedemptionAllowed ? "bg-green-500" : "bg-gray-500"}>
                          {investmentOpportunity.earlyRedemptionAllowed ? "Yes" : "No"}
                        </Badge>
                        {investmentOpportunity.earlyRedemptionAllowed &&
                          investmentOpportunity.earlyRedemptionPenalty && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              Penalty: {investmentOpportunity.earlyRedemptionPenalty}%
                            </p>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {(investmentOpportunity.description || investmentOpportunity.shortDescription) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investmentOpportunity.shortDescription && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                          Short Description
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300">{investmentOpportunity.shortDescription}</p>
                      </div>
                    )}
                    {investmentOpportunity.description && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                          Full Description
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                          {investmentOpportunity.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Company Information */}
              {(investmentOpportunity.companyDescription ||
                investmentOpportunity.companyWebsite ||
                investmentOpportunity.companyAddress) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investmentOpportunity.companyDescription && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Company Description</p>
                        <p className="text-zinc-700 dark:text-zinc-300 mt-1">
                          {investmentOpportunity.companyDescription}
                        </p>
                      </div>
                    )}
                    {investmentOpportunity.companyWebsite && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Website</p>
                        <a
                          href={investmentOpportunity.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {investmentOpportunity.companyWebsite}
                        </a>
                      </div>
                    )}
                    {investmentOpportunity.companyAddress && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Address</p>
                        <p className="text-zinc-700 dark:text-zinc-300">{investmentOpportunity.companyAddress}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Project Information */}
              {(investmentOpportunity.projectType || investmentOpportunity.useOfFunds) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investmentOpportunity.projectType && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Project Type</p>
                        <p className="text-lg">{investmentOpportunity.projectType}</p>
                      </div>
                    )}
                    {investmentOpportunity.useOfFunds && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Use of Funds</p>
                        <p className="text-zinc-700 dark:text-zinc-300">{investmentOpportunity.useOfFunds}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Key Highlights */}
              {investmentOpportunity.keyHighlights &&
                Array.isArray(investmentOpportunity.keyHighlights) &&
                investmentOpportunity.keyHighlights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {investmentOpportunity.keyHighlights.map((highlight: string, index: number) => (
                          <li key={index} className="text-zinc-700 dark:text-zinc-300">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Risk Factors */}
              {investmentOpportunity.riskFactors &&
                Array.isArray(investmentOpportunity.riskFactors) &&
                investmentOpportunity.riskFactors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {investmentOpportunity.riskFactors.map((risk: string, index: number) => (
                          <li key={index} className="text-zinc-700 dark:text-zinc-300">
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Legal & Structure */}
              {(investmentOpportunity.legalStructure || investmentOpportunity.jurisdiction) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Legal & Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {investmentOpportunity.legalStructure && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Legal Structure</p>
                          <p className="text-lg">{investmentOpportunity.legalStructure}</p>
                        </div>
                      )}
                      {investmentOpportunity.jurisdiction && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Jurisdiction</p>
                          <p className="text-lg">{investmentOpportunity.jurisdiction}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {investmentOpportunity.startDate && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Start Date</p>
                        <p className="text-lg">
                          {format(new Date(investmentOpportunity.startDate), "PPP")}
                        </p>
                      </div>
                    )}
                    {investmentOpportunity.endDate && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">End Date</p>
                        <p className="text-lg">
                          {format(new Date(investmentOpportunity.endDate), "PPP")}
                        </p>
                      </div>
                    )}
                    {investmentOpportunity.createdAt && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</p>
                        <p className="text-lg">
                          {format(new Date(investmentOpportunity.createdAt), "PPP 'at' p")}
                        </p>
                      </div>
                    )}
                    {investmentOpportunity.updatedAt && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Updated</p>
                        <p className="text-lg">
                          {format(new Date(investmentOpportunity.updatedAt), "PPP 'at' p")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Statistics */}
              {(investmentOpportunity.investorsCount !== undefined ||
                investmentOpportunity.investorsCount !== null ||
                (investmentOpportunity.averageInvestment !== undefined &&
                  investmentOpportunity.averageInvestment !== null) ||
                (investmentOpportunity.medianInvestment !== undefined &&
                  investmentOpportunity.medianInvestment !== null) ||
                (investmentOpportunity.largestInvestment !== undefined &&
                  investmentOpportunity.largestInvestment !== null)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {(investmentOpportunity.investorsCount !== undefined &&
                        investmentOpportunity.investorsCount !== null) && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Investors</p>
                          <p className="text-2xl font-bold">{investmentOpportunity.investorsCount}</p>
                        </div>
                      )}
                      {investmentOpportunity.averageInvestment !== undefined &&
                        investmentOpportunity.averageInvestment !== null && (
                          <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Average Investment</p>
                            <p className="text-2xl font-bold">
                              ${investmentOpportunity.averageInvestment.toLocaleString()}
                            </p>
                          </div>
                        )}
                      {investmentOpportunity.medianInvestment !== undefined &&
                        investmentOpportunity.medianInvestment !== null && (
                          <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Median Investment</p>
                            <p className="text-2xl font-bold">
                              ${investmentOpportunity.medianInvestment.toLocaleString()}
                            </p>
                          </div>
                        )}
                      {investmentOpportunity.largestInvestment !== undefined &&
                        investmentOpportunity.largestInvestment !== null && (
                          <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Largest Investment</p>
                            <p className="text-2xl font-bold">
                              ${investmentOpportunity.largestInvestment.toLocaleString()}
                            </p>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Media */}
              {(investmentOpportunity.thumbnailImage ||
                investmentOpportunity.logo ||
                (investmentOpportunity.images && investmentOpportunity.images.length > 0) ||
                investmentOpportunity.videoUrl) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investmentOpportunity.thumbnailImage && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Thumbnail</p>
                        <img
                          src={investmentOpportunity.thumbnailImage}
                          alt="Thumbnail"
                          className="max-w-xs rounded-lg"
                        />
                      </div>
                    )}
                    {investmentOpportunity.logo && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Logo</p>
                        <img src={investmentOpportunity.logo} alt="Logo" className="max-w-xs rounded-lg" />
                      </div>
                    )}
                    {investmentOpportunity.images &&
                      Array.isArray(investmentOpportunity.images) &&
                      investmentOpportunity.images.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Images</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {investmentOpportunity.images.map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Image ${index + 1}`}
                                className="rounded-lg w-full h-48 object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    {investmentOpportunity.videoUrl && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Video</p>
                        <a
                          href={investmentOpportunity.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {investmentOpportunity.videoUrl}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* FAQ */}
              {investmentOpportunity.faq &&
                Array.isArray(investmentOpportunity.faq) &&
                investmentOpportunity.faq.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {investmentOpportunity.faq.map((item: any, index: number) => (
                          <div key={index} className="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                              {item.question || item.q}
                            </p>
                            <p className="text-zinc-700 dark:text-zinc-300">{item.answer || item.a}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Milestones */}
              {investmentOpportunity.milestones &&
                Array.isArray(investmentOpportunity.milestones) &&
                investmentOpportunity.milestones.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {investmentOpportunity.milestones.map((milestone: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0"
                          >
                            <div className="flex-shrink-0">
                              <Badge
                                className={
                                  milestone.status === "completed"
                                    ? "bg-green-500"
                                    : milestone.status === "in-progress"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                                }
                              >
                                {milestone.status || "pending"}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {milestone.date ? format(new Date(milestone.date), "PPP") : "No date"}
                              </p>
                              <p className="text-zinc-700 dark:text-zinc-300 mt-1">
                                {milestone.description || milestone.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Tags */}
              {investmentOpportunity.tags &&
                Array.isArray(investmentOpportunity.tags) &&
                investmentOpportunity.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {investmentOpportunity.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-zinc-500 dark:text-zinc-400">Investment opportunity details not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
