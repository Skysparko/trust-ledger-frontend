"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeSubscription } from "@/store/slices/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addInvestment } from "@/store/slices/investments";
import { issuances } from "@/data/issuances";
import { CheckCircle2 } from "lucide-react";

const paymentMethodOptions = [
  { label: "Bank transfer", value: "bank_transfer" },
];

export function SubscriptionModal() {
  const { subscriptionOpen, subscriptionDefaults } = useAppSelector((s) => s.ui);
  const dispatch = useAppDispatch();
  
  // Generate issuance options from actual data
  const issuanceOptions = issuances
    .filter(iss => iss.status === "open")
    .map(iss => ({
      label: iss.title,
      value: iss.title,
    }));

  const [issuance, setIssuance] = useState(subscriptionDefaults?.issuance || issuanceOptions[0]?.value || "");
  const [bonds, setBonds] = useState<number>(10);
  const [method, setMethod] = useState("bank_transfer");
  const [confirm, setConfirm] = useState(false);

  // Update issuance when defaults change
  useEffect(() => {
    if (subscriptionDefaults?.issuance) {
      setIssuance(subscriptionDefaults.issuance);
    }
  }, [subscriptionDefaults]);

  // Reset confirm state when modal closes
  useEffect(() => {
    if (!subscriptionOpen) {
      setConfirm(false);
      setBonds(10);
    }
  }, [subscriptionOpen]);

  if (!subscriptionOpen) return null;

  function submit() {
    dispatch(
      addInvestment({
        issuance,
        date: new Date().toISOString(),
        amount: bonds * 100,
        bonds,
        status: "pending",
      })
    );
    setConfirm(true);
  }

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
              <p className="text-sm text-zinc-400">Complete the form below to invest in this opportunity</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300">Investment Opportunity</Label>
                {issuanceOptions.length > 0 ? (
                  <Select 
                    options={issuanceOptions} 
                    value={issuance} 
                    onValueChange={setIssuance}
                  />
                ) : (
                  <Input 
                    value={issuance} 
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Number of Bonds</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={bonds} 
                  onChange={(e) => setBonds(parseInt(e.target.value || "0", 10))}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Payment Method</Label>
                <Select 
                  options={paymentMethodOptions} 
                  value={method} 
                  onValueChange={setMethod}
                />
              </div>
              <div className="pt-4 border-t border-zinc-800/50 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => dispatch(closeSubscription())}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submit}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20"
                  disabled={!issuance || bonds < 1}
                >
                  Submit Investment
                </Button>
              </div>
            </div>
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


