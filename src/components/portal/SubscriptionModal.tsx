"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeSubscription } from "@/store/slices/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addInvestment } from "@/store/slices/investments";
import { useInvestmentOpportunitiesDropdown, useInvestmentOpportunities } from "@/hooks/swr/useInvestmentOpportunities";
import { useUserCreateInvestment } from "@/hooks/swr/useUser";
import { useUserInvestments } from "@/hooks/swr/useUser";
import { CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/wallet/WalletConnect";

const paymentMethodOptions = [
  { label: "Bank transfer", value: "bank_transfer" },
];

const validationSchema = Yup.object({
  issuance: Yup.string()
    .required("Please select an investment opportunity"),
  bonds: Yup.number()
    .min(1, "Number of bonds must be at least 1")
    .required("Number of bonds is required"),
  method: Yup.string()
    .required("Payment method is required"),
});

export function SubscriptionModal() {
  const { subscriptionOpen, subscriptionDefaults } = useAppSelector((s) => s.ui);
  const dispatch = useAppDispatch();
  const [confirm, setConfirm] = useState(false);
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  
  // API hooks
  const { createInvestment, isCreating, error: createError } = useUserCreateInvestment();
  const { mutate: refreshInvestments } = useUserInvestments();
  
  // Fetch investment opportunities with full details (including minInvestment)
  // Note: API only accepts single status value, so we fetch all (no status filter)
  // Backend should return active, upcoming, and paused by default
  const { opportunities: fullOpportunities, isLoading: isLoadingOpportunities } = useInvestmentOpportunities({
    status: undefined, // Fetch all available statuses
  });
  
  // Filter out closed opportunities on the client side
  const availableOpportunities = (fullOpportunities || []).filter(opp => {
    return opp.status !== "closed";
  });

  // Generate dropdown options from API data
  const issuanceOptions = useMemo(() => {
    if (!availableOpportunities || availableOpportunities.length === 0) {
      return [];
    }

    // Map to dropdown options (already sorted by API)
    return availableOpportunities.map(opp => ({
      label: opp.title,
      value: opp.id,
    }));
  }, [availableOpportunities]);

  // Helper function to resolve issuance ID from subscriptionDefaults
  // Handles both ID (preferred) and title (for backward compatibility)
  const resolveIssuanceId = useMemo(() => {
    if (!subscriptionDefaults?.issuance) {
      return issuanceOptions[0]?.value || "";
    }
    
    const defaultValue = subscriptionDefaults.issuance;
    
    // Check if it's already an ID (matches a value in options)
    const foundById = issuanceOptions.find(opt => opt.value === defaultValue);
    if (foundById) {
      return foundById.value;
    }
    
    // Check if it's a title (matches a label in options)
    const foundByTitle = issuanceOptions.find(opt => opt.label === defaultValue);
    if (foundByTitle) {
      return foundByTitle.value;
    }
    
    // Default to first option if no match found
    return issuanceOptions[0]?.value || "";
  }, [subscriptionDefaults?.issuance, issuanceOptions]);

  const formik = useFormik({
    initialValues: {
      issuance: resolveIssuanceId,
      bonds: 10,
      method: "bank_transfer",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Get the selected investment opportunity
        const selectedOpp = availableOpportunities.find(opp => opp.id === values.issuance);
        if (!selectedOpp) {
          setFieldError("issuance", "Please select a valid investment opportunity");
          setSubmitting(false);
          return;
        }
        
        // Validate funding target before submitting
        const pricePerBond = selectedOpp.minInvestment || 100;
        const investmentAmount = values.bonds * pricePerBond;
        const remainingFunding = selectedOpp.maxInvestment! - selectedOpp.currentFunding;
        
        if (investmentAmount > remainingFunding) {
          const maxBonds = Math.floor(remainingFunding / pricePerBond);
          setFieldError(
            "bonds",
            `Investment exceeds funding target. Maximum ${maxBonds} bond${maxBonds !== 1 ? 's' : ''} available ($${remainingFunding.toLocaleString()} remaining)`
          );
          setSubmitting(false);
          
          // Show toast notification
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast.error("Investment Exceeds Funding Target", {
                description: `Maximum ${maxBonds} bond${maxBonds !== 1 ? 's' : ''} available. Remaining funding: $${remainingFunding.toLocaleString()}`,
                duration: 5000,
              });
            });
          }
          return;
        }
        
        // Call the API to create investment
        const payload = {
          investmentOpportunityId: values.issuance,
          bonds: values.bonds,
          paymentMethod: values.method as "bank_transfer" | "credit_card" | "sepa",
          walletAddress: walletAddress || undefined, // Include wallet address if connected
        };
        
        await createInvestment(payload);
        
        // Refresh investments list
        await refreshInvestments();
        
        // Calculate amount using minInvestment (price per bond) from the selected opportunity
        // (selectedOpp is already defined above, reuse it)
        const calculatedAmount = values.bonds * pricePerBond;
        
        // Also update Redux for local state management
        dispatch(
          addInvestment({
            issuance: values.issuance,
            date: new Date().toISOString(),
            amount: calculatedAmount,
            bonds: values.bonds,
            status: "pending",
          })
        );
        
        setConfirm(true);
      } catch (err: any) {
        // Error toast is already shown by axios interceptor
        console.error("Investment creation error:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Update issuance when defaults change
  useEffect(() => {
    if (resolveIssuanceId) {
      formik.setFieldValue("issuance", resolveIssuanceId);
    }
  }, [resolveIssuanceId]);

  // Reset confirm state when modal closes
  useEffect(() => {
    if (!subscriptionOpen) {
      setConfirm(false);
      formik.resetForm();
      formik.setFieldValue("bonds", 10);
    }
  }, [subscriptionOpen]);

  if (!subscriptionOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => dispatch(closeSubscription())}
    >
      <div 
        className="w-full max-w-lg rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 backdrop-blur-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!confirm ? (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">New Investment</h3>
              <p className="text-sm text-zinc-400 mb-4">Complete the form below to invest in this opportunity</p>
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Wallet Connection</p>
                  <p className="text-sm text-zinc-300">
                    {isWalletConnected ? "Connected for on-chain bond minting" : "Connect wallet to receive bond tokens"}
                  </p>
                </div>
                <WalletConnect />
              </div>
            </div>
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300">Investment Opportunity</Label>
                {isLoadingOpportunities ? (
                  <Input 
                    value="Loading opportunities..." 
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                ) : issuanceOptions.length > 0 ? (
                  <>
                    <Select 
                      options={issuanceOptions} 
                      value={formik.values.issuance} 
                      onValueChange={(value) => formik.setFieldValue("issuance", value)}
                      className={formik.touched.issuance && formik.errors.issuance ? "border-red-500" : ""}
                    />
                    {formik.touched.issuance && formik.errors.issuance && (
                      <p className="text-xs text-red-400">{formik.errors.issuance}</p>
                    )}
                  </>
                ) : (
                  <Input 
                    value="No opportunities available" 
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Number of Bonds</Label>
                <Input 
                  id="bonds"
                  name="bonds"
                  type="number" 
                  min={1} 
                  value={formik.values.bonds} 
                  onChange={(e) => formik.setFieldValue("bonds", parseInt(e.target.value || "0", 10))}
                  onBlur={formik.handleBlur}
                  className={`bg-zinc-800/50 border-zinc-700 text-white ${
                    formik.touched.bonds && formik.errors.bonds ? "border-red-500" : ""
                  }`}
                />
                {formik.touched.bonds && formik.errors.bonds && (
                  <p className="text-xs text-red-400">{formik.errors.bonds}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Payment Method</Label>
                <Select 
                  options={paymentMethodOptions} 
                  value={formik.values.method} 
                  onValueChange={(value) => formik.setFieldValue("method", value)}
                  className={formik.touched.method && formik.errors.method ? "border-red-500" : ""}
                />
                {formik.touched.method && formik.errors.method && (
                  <p className="text-xs text-red-400">{formik.errors.method}</p>
                )}
              </div>
              <div className="pt-4 border-t border-zinc-800/50 flex justify-end gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => dispatch(closeSubscription())}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  disabled={formik.isSubmitting || isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20"
                  disabled={formik.isSubmitting || isCreating || !formik.isValid}
                >
                  {(formik.isSubmitting || isCreating) ? "Submitting..." : "Submit Investment"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Investment Submitted</h3>
            <p className="mb-6 text-sm text-zinc-400">We have received your investment request. You will receive payment instructions by email within 24 hours.</p>
            <Button 
              onClick={() => dispatch(closeSubscription())}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


