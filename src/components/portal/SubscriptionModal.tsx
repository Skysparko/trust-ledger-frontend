"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeSubscription } from "@/store/slices/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addInvestment } from "@/store/slices/investments";

const issuanceOptions = [
  { label: "Windpark Noordoostpolder", value: "Windpark Noordoostpolder" },
  { label: "Zonnepark Zeeland", value: "Zonnepark Zeeland" },
];

const paymentMethodOptions = [
  { label: "Bank transfer", value: "bank_transfer" },
];

export function SubscriptionModal() {
  const { subscriptionOpen, subscriptionDefaults } = useAppSelector((s) => s.ui);
  const dispatch = useAppDispatch();
  const [issuance, setIssuance] = useState(subscriptionDefaults?.issuance || "Windpark Noordoostpolder");
  const [bonds, setBonds] = useState<number>(10);
  const [method, setMethod] = useState("bank_transfer");
  const [confirm, setConfirm] = useState(false);

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        {!confirm ? (
          <>
            <h3 className="mb-4 text-lg font-semibold">New subscription</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Issuance</Label>
                <Select 
                  options={issuanceOptions} 
                  value={issuance} 
                  onValueChange={setIssuance}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of bonds</Label>
                <Input type="number" min={1} value={bonds} onChange={(e) => setBonds(parseInt(e.target.value || "0", 10))} />
              </div>
              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select 
                  options={paymentMethodOptions} 
                  value={method} 
                  onValueChange={setMethod}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => dispatch(closeSubscription())}>Cancel</Button>
                <Button onClick={submit}>Submit</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">Subscription submitted</h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">We have received your request. You will receive payment instructions by email.</p>
            <Button onClick={() => dispatch(closeSubscription())}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}


