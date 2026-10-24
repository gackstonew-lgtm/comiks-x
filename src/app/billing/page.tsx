"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  History,
  Plus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { BillingAccount, CreditTransaction } from "@/types";

export default function BillingCreditsPage() {
  const [billing, setBilling] = useState<BillingAccount | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/billing");
      const data = await res.json();
      if (data.success) {
        setBilling(data.billing);
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurchaseCredits = async (amount: number, reason: string) => {
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "purchase_credits",
          amount,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBilling(data.billing);
        setTransactions(data.transactions);
        setStatusMessage(data.message);
      } else {
        alert(data.error || "Failed to purchase credits");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!billing) {
    return (
      <div className="flex items-center justify-center p-12 text-[#888] text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand mr-2" />
        Loading billing details...
      </div>
    );
  }

  const usagePercentage = Math.min(
    100,
    Math.round(
      (billing.creditsUsedThisMonth / (billing.creditsRemaining + billing.creditsUsedThisMonth)) * 100
    )
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            Billing & Production Credits
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Account Credits & Subscriptions
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Transparent usage metering for GPU video inference, speech synthesis, and cloud renders.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] text-[#888] uppercase tracking-wider">Plan:</span>
          <span className="px-2.5 py-1 rounded-[4px] bg-brand/10 border border-brand/30 text-brand text-xs font-semibold uppercase tracking-wider">
            {billing.planTier}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Credits */}
        <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#a0a0a0] font-medium">Available Credits</span>
            <div className="text-3xl font-black text-brand mt-1 tracking-tight">
              {billing.creditsRemaining.toLocaleString()}
            </div>
          </div>
          <p className="text-[11px] text-[#888] mt-4 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-brand" />
            Never expires on active plans
          </p>
        </div>

        {/* Monthly Consumption */}
        <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#a0a0a0] font-medium">Consumed This Month</span>
            <div className="text-3xl font-black text-[#ededed] mt-1 tracking-tight">
              {billing.creditsUsedThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Top-Up Action */}
        <div className="p-5 rounded-[8px] bg-[#18231c] border border-brand/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
              Instant Top-Up
            </span>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Need extra GPU compute for a heavy batch render?
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handlePurchaseCredits(100, "Pack: 100 Credits ($10)")}
              disabled={isProcessing}
              className="flex-1 py-1.5 rounded-[4px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              +100 ($10)
            </button>
            <button
              onClick={() => handlePurchaseCredits(500, "Pack: 500 Credits ($45)")}
              disabled={isProcessing}
              className="flex-1 py-1.5 rounded-[4px] bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-[#ededed] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              +500 ($45)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Tiers & Unit Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tiers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            Subscription Plans
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                name: "Starter",
                price: "Free",
                credits: "100 / mo",
                features: ["Standard 720p Render", "2D Cel presets", "Community support"],
                current: billing.planTier === "starter",
              },
              {
                name: "Creator Pro",
                price: "$29 / mo",
                credits: "500 / mo",
                features: ["1080p 60fps Broadcast", "Luma & Kling v1.5", "Sheng voice cloning", "Priority queue"],
                current: billing.planTier === "creator",
              },
              {
                name: "Studio Ultra",
                price: "$99 / mo",
                credits: "2,500 / mo",
                features: ["4K Upscaling", "Unlimited team seats", "Dedicated GPU lanes", "Custom brand kits"],
                current: billing.planTier === "enterprise",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-4 rounded-[8px] border flex flex-col justify-between ${
                  plan.current
                    ? "bg-[#18231c] border-brand"
                    : "bg-[#141414] border-[#2e2e2e]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#ededed]">{plan.name}</span>
                    {plan.current && (
                      <span className="text-[10px] text-brand font-medium">Active</span>
                    )}
                  </div>
                  <div className="text-lg font-black text-[#ededed]">{plan.price}</div>
                  <div className="text-[11px] text-brand font-semibold mb-3">
                    {plan.credits}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[#a0a0a0]">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-brand" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {!plan.current && (
                  <button
                    onClick={() => handlePurchaseCredits(500, `Upgrade to ${plan.name}`)}
                    className="mt-4 w-full py-1.5 rounded-[4px] bg-[#222] hover:bg-brand hover:text-[#09090b] text-[#ededed] text-xs font-medium transition-colors"
                  >
                    Select Plan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unit Cost Reference (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            Compute Unit Cost Breakdown
          </h3>
          <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] p-4 text-xs divide-y divide-[#222]">
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">AI Video (3s–5s Clip)</span>
              <span className="font-semibold text-brand">5 – 8 Credits</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">AI Video (10s Clip)</span>
              <span className="font-semibold text-brand">15 Credits</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">AI Image Still / Comic Panel</span>
              <span className="font-semibold text-brand">2 Credits</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">4-Angle Character Turnaround</span>
              <span className="font-semibold text-brand">4 Credits</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">4x Resolution Upscale</span>
              <span className="font-semibold text-brand">1 Credit</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">Voiceover TTS Take</span>
              <span className="font-semibold text-brand">1 Credit</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#a0a0a0]">Talking Avatar Presenter (Lip-Sync)</span>
              <span className="font-semibold text-brand">6 Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Audit & Transaction Ledger ({transactions.length})
        </h3>

        <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-[#888] border-b border-[#2e2e2e]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Timestamp</th>
                <th className="py-2.5 px-4 font-medium">Description</th>
                <th className="py-2.5 px-4 font-medium text-right">Credit Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[#666]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-2.5 px-4 text-[#888] font-mono text-[11px]">
                      {new Date(tx.timestamp || tx.createdAt || "").toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-[#ededed]">{tx.description}</td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono font-bold ${
                        tx.amount > 0 ? "text-brand" : "text-amber-400"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
