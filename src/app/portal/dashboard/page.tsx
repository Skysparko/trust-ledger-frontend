"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAgreementSigned, hydrateFromAuth } from "@/store/slices/profile";
import { hydrateFromStorage } from "@/store/slices/auth";
import { openSubscription } from "@/store/slices/ui";
import { useUserInvestments } from "@/hooks/swr/useUser";
import { SubscriptionModal } from "@/components/portal/SubscriptionModal";
import { CheckCircle2, XCircle, FileText, UserCheck, Shield, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const profile = useAppSelector((s) => s.profile);
  const { investments: apiInvestments, isLoading: investmentsLoading, isError: investmentsError } = useUserInvestments();

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, user, router]);

  // Don't render if not authenticated (redirect is happening)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      dispatch(hydrateFromAuth({ name: user.name, email: user.email }));
    }
  }, [user, dispatch]);

  // Map API investments to the format expected by the component
  const investments = useMemo(() => {
    if (!apiInvestments) return [];
    return apiInvestments.map((inv) => ({
      id: inv.id,
      issuance: inv.investmentOpportunityTitle || `Investment Opportunity ${inv.issuanceId || 'N/A'}`,
      date: inv.date || inv.createdAt,
      amount: inv.amount,
      bonds: inv.bonds,
      status: inv.status,
      documentUrl: undefined,
    }));
  }, [apiInvestments]);

  const total = useMemo(
    () => investments.filter((i) => i.status === "confirmed").reduce((sum, i) => sum + i.amount, 0),
    [investments]
  );

  // Calculate completion statuses
  const kycCompleted = !!profile.kycDocumentName;
  const profileCompleted = !!(profile.phone && profile.bank?.iban && profile.bank?.accountName);
  const agreementSigned = !!profile.agreementSigned;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-3">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {getGreeting()}, {user?.name || "User"}!
        </h1>
        <p className="text-lg text-zinc-400 font-light">
          Welcome back to your investor portal
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* KYC Completion Card */}
        <Card className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-2xl ${
          kycCompleted 
            ? "border-green-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-green-900/10 shadow-lg shadow-green-500/5" 
            : "border-amber-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-amber-900/10 shadow-lg shadow-amber-500/5 hover:border-amber-500/30 hover:shadow-amber-500/10"
        }`}>
          {/* Gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            kycCompleted 
              ? "bg-gradient-to-br from-green-500/5 to-transparent" 
              : "bg-gradient-to-br from-amber-500/5 to-transparent"
          }`} />
          
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                KYC Completion
              </CardTitle>
              {kycCompleted ? (
                <div className="rounded-full bg-green-500/20 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              ) : (
                <div className="rounded-full bg-amber-500/20 p-1.5">
                  <XCircle className="h-4 w-4 text-amber-400" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 rounded-xl p-3 ${
                kycCompleted 
                  ? "bg-green-500/10 ring-1 ring-green-500/20" 
                  : "bg-amber-500/10 ring-1 ring-amber-500/20"
              }`}>
                <Shield className={`h-6 w-6 ${kycCompleted ? "text-green-400" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-semibold mb-1 ${kycCompleted ? "text-green-400" : "text-amber-400"}`}>
                  {kycCompleted ? "Completed" : "Pending"}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {kycCompleted 
                    ? "Your KYC documents have been verified" 
                    : "Upload your KYC documents to continue"}
                </p>
              </div>
            </div>
            {!kycCompleted && (
              <Link href="/portal/profile">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-between group/btn text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-amber-500/30 transition-all duration-200"
                >
                  <span className="font-medium">Complete KYC</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        <Card className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-2xl ${
          profileCompleted 
            ? "border-green-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-green-900/10 shadow-lg shadow-green-500/5" 
            : "border-amber-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-amber-900/10 shadow-lg shadow-amber-500/5 hover:border-amber-500/30 hover:shadow-amber-500/10"
        }`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            profileCompleted 
              ? "bg-gradient-to-br from-green-500/5 to-transparent" 
              : "bg-gradient-to-br from-amber-500/5 to-transparent"
          }`} />
          
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                Profile Completion
              </CardTitle>
              {profileCompleted ? (
                <div className="rounded-full bg-green-500/20 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              ) : (
                <div className="rounded-full bg-amber-500/20 p-1.5">
                  <XCircle className="h-4 w-4 text-amber-400" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 rounded-xl p-3 ${
                profileCompleted 
                  ? "bg-green-500/10 ring-1 ring-green-500/20" 
                  : "bg-amber-500/10 ring-1 ring-amber-500/20"
              }`}>
                <UserCheck className={`h-6 w-6 ${profileCompleted ? "text-green-400" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-semibold mb-1 ${profileCompleted ? "text-green-400" : "text-amber-400"}`}>
                  {profileCompleted ? "Complete" : "Incomplete"}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {profileCompleted 
                    ? "All profile information is filled" 
                    : "Complete your profile details"}
                </p>
              </div>
            </div>
            {!profileCompleted && (
              <Link href="/portal/profile">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-between group/btn text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-amber-500/30 transition-all duration-200"
                >
                  <span className="font-medium">Complete Profile</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Agreement Sign Card */}
        <Card className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-2xl ${
          agreementSigned 
            ? "border-green-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-green-900/10 shadow-lg shadow-green-500/5" 
            : "border-amber-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-amber-900/10 shadow-lg shadow-amber-500/5 hover:border-amber-500/30 hover:shadow-amber-500/10"
        }`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            agreementSigned 
              ? "bg-gradient-to-br from-green-500/5 to-transparent" 
              : "bg-gradient-to-br from-amber-500/5 to-transparent"
          }`} />
          
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                Agreement Sign
              </CardTitle>
              {agreementSigned ? (
                <div className="rounded-full bg-green-500/20 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              ) : (
                <div className="rounded-full bg-amber-500/20 p-1.5">
                  <XCircle className="h-4 w-4 text-amber-400" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 rounded-xl p-3 ${
                agreementSigned 
                  ? "bg-green-500/10 ring-1 ring-green-500/20" 
                  : "bg-amber-500/10 ring-1 ring-amber-500/20"
              }`}>
                <FileText className={`h-6 w-6 ${agreementSigned ? "text-green-400" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-semibold mb-1 ${agreementSigned ? "text-green-400" : "text-amber-400"}`}>
                  {agreementSigned ? "Signed" : "Not Signed"}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {agreementSigned 
                    ? "Investment agreement is signed" 
                    : "Sign the investment agreement"}
                </p>
              </div>
            </div>
            {!agreementSigned && (
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-between group/btn text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-amber-500/30 transition-all duration-200"
                onClick={() => {
                  dispatch(setAgreementSigned(true));
                }}
              >
                <span className="font-medium">Sign Agreement</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end pt-2">
        <Button 
          onClick={() => dispatch(openSubscription(undefined))}
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold px-8"
          size="lg"
        >
          Invest Now
        </Button>
      </div>

      {/* Total Invested Card */}
      <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-blue-900/5 backdrop-blur-sm shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
            Total Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-zinc-500">$</span>
            <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              {total.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investments Table Card */}
      <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
            Your Investments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                    Investment Opportunity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400/80">
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-zinc-500 text-sm">No investments yet</div>
                        <p className="text-zinc-600 text-xs">Start investing to see your portfolio here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  investments.map((inv, index) => (
                    <tr 
                      key={inv.id || `investment-${index}-${inv.issuance}`} 
                      className="group transition-all duration-200 hover:bg-zinc-800/30 border-b border-zinc-800/20 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {inv.issuance}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-400">
                          {new Date(inv.date).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          $ {inv.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={
                          inv.status === "confirmed"
                            ? "inline-flex items-center rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1.5 text-xs font-semibold text-green-400 shadow-sm shadow-green-500/10"
                            : inv.status === "pending"
                            ? "inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-sm shadow-amber-500/10"
                            : "inline-flex items-center rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 shadow-sm shadow-red-500/10"
                        }>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inv.documentUrl ? (
                          <a 
                            className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors group/link" 
                            href={inv.documentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            <span>Download PDF</span>
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SubscriptionModal />
    </div>
  );
}


