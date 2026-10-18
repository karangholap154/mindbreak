"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";

interface ClaimResult {
  success: boolean;
  claimId: string;
  rewardName: string;
  status: string;
  message: string;
}

const MILESTONES: Record<number, { title: string; desc: string; type: string; icon: string }> = {
  50: {
    title: "Pen & Metal Pin Pack",
    desc: "Custom heavyweight ballpoint pen and solid die-cast enamel lapel pin in matte black & lime.",
    type: "Stationery & Badge",
    icon: "🖊️",
  },
  100: {
    title: "Matte Ceramic Desk Mug (12oz)",
    desc: "Premium double-walled stoneware with laser-etched stopwatch ring mark and textured base.",
    type: "Drinkware",
    icon: "☕",
  },
  200: {
    title: "Embroidered Champion Heavyweight Hoodie",
    desc: "Ultra-dense 450gsm fleece hoodie with micro-stitched Mind Break chest insignia.",
    type: "Apparel",
    icon: "🧥",
  },
  365: {
    title: "Solid Metal Heavyweight Trophy",
    desc: "Hand-finished brushed brass trophy engraved with your name and streak date.",
    type: "Honorary Trophy",
    icon: "🏆",
  },
};

function ClaimFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawMilestone = Number(searchParams.get("milestone")) || 50;
  const milestone = [50, 100, 200, 365].includes(rawMilestone) ? rawMilestone : 50;

  const { user } = useAuth();
  const streak = useStreak();

  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("United States");
  const [size, setSize] = useState("L");
  const [engravingName, setEngravingName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);

  const reward = MILESTONES[milestone];
  const isEligible = streak.currentStreak >= milestone || streak.bestStreak >= milestone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg("Please sign in first to submit your physical gift claim.");
      return;
    }

    setLoading(true);

    try {
      const customization =
        milestone === 200
          ? `Size: ${size}`
          : milestone === 365
          ? `Engraved: ${engravingName || shippingName}`
          : undefined;

      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneDay: milestone,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingCountry,
          customization,
          isTestClaim: !isEligible, // Allows preview claim in dev if not reached yet
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit claim.");
      } else {
        setClaimResult(data);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[880px] mx-auto px-5 py-8 sm:py-12 animate-fade-in">
      {/* Back button */}
      <Link
        href="/rewards"
        className="inline-flex items-center gap-2 text-mute hover:text-ink font-mono text-[13px] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Rewards Ladder</span>
      </Link>

      {/* Success State */}
      {claimResult ? (
        <div className="p-8 sm:p-12 rounded-[28px] bg-card border border-line shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-lime text-lime-ink flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line font-mono text-[11px] text-mute uppercase tracking-wider mb-2">
            <span>Claim #{claimResult.claimId.slice(0, 8).toUpperCase()}</span>
          </div>

          <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-ink mb-3 leading-tight">
            Claim Confirmed!
          </h2>
          <p className="font-body text-[16px] text-mute max-w-[500px] mb-8 leading-relaxed">
            Your claim for the <strong className="text-ink">{claimResult.rewardName}</strong> has been logged. Our fulfillment team ships milestone prizes worldwide with tracking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[620px] mb-8 text-left">
            <div className="p-4 rounded-[18px] bg-surface border border-line">
              <span className="font-mono text-[11px] text-mute uppercase block mb-1">Status</span>
              <span className="font-body font-bold text-[14px] text-acc flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>Processing Order</span>
              </span>
            </div>
            <div className="p-4 rounded-[18px] bg-surface border border-line">
              <span className="font-mono text-[11px] text-mute uppercase block mb-1">Estimated Dispatch</span>
              <span className="font-body font-bold text-[14px] text-ink flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-mute" />
                <span>7–10 Business Days</span>
              </span>
            </div>
            <div className="p-4 rounded-[18px] bg-surface border border-line">
              <span className="font-mono text-[11px] text-mute uppercase block mb-1">Cost to You</span>
              <span className="font-body font-bold text-[14px] text-lime-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-lime-ink" />
                <span>100% Free Shipping</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/rewards")}
            className="px-8 py-3.5 rounded-full bg-acc text-ink font-bold text-[15px] shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        /* Claim Form Card */
        <div className="rounded-[28px] bg-card border border-line shadow-sm overflow-hidden">
          {/* Milestone Prize Banner */}
          <div className="p-8 sm:p-10 border-b border-line bg-surface/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-card border border-line flex items-center justify-center text-[32px] shadow-xs shrink-0">
                  {reward.icon}
                </div>
                <div>
                  <span className="font-mono text-[11px] font-bold text-acc uppercase tracking-widest block mb-1">
                    Day {milestone} Milestone Reward · {reward.type}
                  </span>
                  <h1 className="font-display font-bold text-[26px] sm:text-[30px] text-ink leading-tight">
                    {reward.title}
                  </h1>
                </div>
              </div>

              {/* Milestone Switcher Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-card border border-line shrink-0">
                {[50, 100, 200, 365].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => router.push(`/rewards/claim?milestone=${day}`)}
                    className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                      milestone === day ? "bg-ink text-surface" : "text-mute hover:text-ink"
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </div>

            <p className="font-body text-[14px] text-mute mt-4 leading-relaxed max-w-[650px]">
              {reward.desc}
            </p>

            {/* Streak eligibility notice */}
            <div className="mt-6 flex items-center gap-2 p-3.5 rounded-[14px] bg-card border border-line font-mono text-[12px]">
              <span className="text-mute">Your Current Record:</span>
              <span className="font-bold text-ink">
                {Math.max(streak.currentStreak, streak.bestStreak)} Days
              </span>
              <span className="text-mute">·</span>
              <span className="text-mute">Required:</span>
              <span className="font-bold text-acc">{milestone} Days</span>
              {!isEligible && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-lime/20 text-lime-ink text-[11px] font-bold">
                  Preview Mode
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
            {errorMsg && (
              <div className="flex items-center gap-2 p-4 rounded-[14px] bg-error-bg/30 border border-error/30 text-error text-[13.5px] font-body animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customization Options for Hoodie or Trophy */}
            {milestone === 200 && (
              <div className="p-5 rounded-[20px] bg-surface border border-line">
                <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-2">
                  Select Hoodie Size (Unisex Athletic Fit)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["S", "M", "L", "XL", "2XL"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`px-5 py-2 rounded-full font-mono text-[13px] font-bold transition-all cursor-pointer ${
                        size === sz
                          ? "bg-ink text-surface shadow-xs"
                          : "bg-card border border-line text-mute hover:text-ink"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {milestone === 365 && (
              <div className="p-5 rounded-[20px] bg-surface border border-line">
                <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                  Custom Engraving Name on Trophy Plaque
                </label>
                <input
                  type="text"
                  value={engravingName}
                  onChange={(e) => setEngravingName(e.target.value)}
                  placeholder="e.g. Alex M. Taylor"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-card border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                />
                <span className="block font-body text-[11px] text-mute mt-1">
                  Max 30 characters. Will be laser-engraved below the Mind Break 365 Days medallion.
                </span>
              </div>
            )}

            {/* Shipping Address Inputs */}
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink mb-4">
                Shipping Destination
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                    Full Recipient Name
                  </label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="Alex Taylor"
                    className="w-full px-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                    Street Address & Apartment / Suite
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    className="w-full px-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      placeholder="94107"
                      className="w-full px-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-line">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-acc text-ink font-bold text-[16px] shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Submitting Claim..." : `Claim Day ${milestone} Physical Prize`}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>

              <p className="font-body text-[12px] text-mute text-center mt-3">
                Shipping is 100% free. No credit card or payment will ever be asked.
              </p>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default function ClaimRewardPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-line border-t-acc animate-spin" />
        </div>
      }
    >
      <ClaimFormContent />
    </Suspense>
  );
}
