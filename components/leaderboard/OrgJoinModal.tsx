"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building2, GraduationCap, Users, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { useMounted } from "@/hooks/useMounted";

interface Organization {
  id: string;
  name: string;
  type: "college" | "company" | "community";
  domain?: string | null;
  invite_code: string;
}

interface OrgJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export function OrgJoinModal({ isOpen, onClose, onJoined }: OrgJoinModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"code" | "browse" | "create">("code");
  const [inviteCode, setInviteCode] = useState("");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [userOrgIds, setUserOrgIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"college" | "company" | "community">("college");
  const [newDomain, setNewDomain] = useState("");

  const mounted = useMounted();

  const switchTab = (newTab: "code" | "browse" | "create") => {
    setTab(newTab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    // Fetch existing orgs
    fetch("/api/orgs")
      .then((res) => res.json())
      .then((data) => {
        if (data.organizations) setOrgs(data.organizations);
        if (data.userOrgIds) setUserOrgIds(data.userOrgIds);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orgs/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to join team.");
      } else {
        setSuccessMsg(`Joined ${data.organization.name}!`);
        onJoined();
        setTimeout(() => onClose(), 1200);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDirect = async (orgId: string, orgName: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orgs/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to join team.");
      } else {
        setSuccessMsg(`Joined ${orgName}!`);
        setUserOrgIds((prev) => [...prev, orgId]);
        onJoined();
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType, domain: newDomain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create team.");
      } else {
        setSuccessMsg(`Created ${data.organization.name} (Code: ${data.organization.invite_code})!`);
        onJoined();
        setTimeout(() => onClose(), 1500);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] my-auto p-7 sm:p-9 rounded-[28px] bg-card border border-line shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-line flex items-center justify-center text-mute hover:text-ink hover:border-ink transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line font-mono text-[11px] text-mute uppercase tracking-wider mb-4">
          <Users className="w-3.5 h-3.5 text-acc" />
          <span>Institutional Teams</span>
        </div>

        <h2 className="font-display font-bold text-[26px] text-ink leading-tight mb-2">
          Join your College or Workplace
        </h2>
        <p className="font-body text-[13.5px] text-mute leading-relaxed mb-6">
          Represent your university or company on aggregate daily leaderboards and compete with peers.
        </p>

        {/* Tab switchers */}
        <div className="flex items-center p-1 rounded-full bg-surface border border-line mb-6">
          <button
            type="button"
            onClick={() => switchTab("code")}
            className={`flex-1 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              tab === "code" ? "bg-ink text-surface shadow-xs" : "text-mute hover:text-ink"
            }`}
          >
            Invite Code
          </button>
          <button
            type="button"
            onClick={() => switchTab("browse")}
            className={`flex-1 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              tab === "browse" ? "bg-ink text-surface shadow-xs" : "text-mute hover:text-ink"
            }`}
          >
            Popular Teams
          </button>
          <button
            type="button"
            onClick={() => switchTab("create")}
            className={`flex-1 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              tab === "create" ? "bg-ink text-surface shadow-xs" : "text-mute hover:text-ink"
            }`}
          >
            + New Team
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-[14px] bg-lime/20 border border-lime text-ink text-[13px] font-body mb-4 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-lime-ink shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-[14px] bg-error-bg/30 border border-error/30 text-error text-[13px] font-body mb-4 animate-fade-in">
            {errorMsg}
          </div>
        )}

        {!user ? (
          <div className="p-6 rounded-[20px] bg-surface border border-line text-center">
            <p className="font-body text-[14px] text-mute mb-4">
              Please sign in first so your team points are tied to your account.
            </p>
          </div>
        ) : (
          <>
            {/* Tab 1: Enter 6-char Invite Code */}
            {tab === "code" && (
              <form onSubmit={handleJoinByCode} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1.5">
                    6-Character Team Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="e.g. STAN42 or GOOG01"
                    className="w-full px-4 py-3.5 rounded-[14px] bg-surface border border-line text-ink font-mono font-bold tracking-widest text-[18px] text-center focus:outline-none focus:border-ink uppercase"
                    required
                  />
                  <span className="block font-body text-[12px] text-mute mt-1.5 text-center">
                    Ask your campus ambassador or team lead for your 6-character code.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !inviteCode.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-acc text-ink font-bold text-[15px] shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Joining team..." : "Join Team"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </form>
            )}

            {/* Tab 2: Browse Popular Teams */}
            {tab === "browse" && (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {orgs.length === 0 ? (
                  <p className="font-body text-[13px] text-mute text-center py-6">
                    No teams available yet.
                  </p>
                ) : (
                  orgs.map((o) => {
                    const isJoined = userOrgIds.includes(o.id);
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 rounded-[16px] bg-surface border border-line"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-card border border-line flex items-center justify-center text-mute">
                            {o.type === "college" ? (
                              <GraduationCap className="w-4 h-4 text-acc" />
                            ) : (
                              <Building2 className="w-4 h-4 text-lime-ink" />
                            )}
                          </div>
                          <div>
                            <p className="font-body font-semibold text-[14px] text-ink leading-tight">
                              {o.name}
                            </p>
                            <p className="font-mono text-[11px] text-mute uppercase">
                              Code: {o.invite_code}
                            </p>
                          </div>
                        </div>

                        {isJoined ? (
                          <span className="px-3 py-1 rounded-full bg-lime/20 border border-lime text-lime-ink font-mono text-[11px] font-bold">
                            Joined
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleJoinDirect(o.id, o.name)}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-full border border-line bg-card hover:bg-surface text-ink font-mono text-[12px] font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Create Team */}
            {tab === "create" && (
              <form onSubmit={handleCreateOrg} className="space-y-3.5">
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                    Team / Institution Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Oxford University or Stripe"
                    className="w-full px-4 py-2.5 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                      Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) =>
                        setNewType(
                          e.target.value as "college" | "company" | "community"
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink cursor-pointer"
                    >
                      <option value="college">College / University</option>
                      <option value="company">Company / Workplace</option>
                      <option value="community">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1">
                      Domain (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="ox.ac.uk"
                      className="w-full px-4 py-2.5 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newName.trim()}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-full bg-acc text-ink font-bold text-[15px] shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? "Creating..." : "Create Team & Get Code"}</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
