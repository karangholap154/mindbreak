"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Download,
  Share2,
  Check,
  FileText,
  Sparkles,
} from "lucide-react";
import { RoundResult } from "@/games/types";
import {
  renderShareCardToCanvas,
  generateShareText,
  ShareCardData,
} from "@/lib/shareCard";
import { useMounted } from "@/hooks/useMounted";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RoundResult;
  streakCount: number;
}

export function ShareModal({
  isOpen,
  onClose,
  result,
  streakCount,
}: ShareModalProps) {
  const mounted = useMounted();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cardData: ShareCardData = {
    result,
    streakCount,
  };

  // Render canvas once modal is opened
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    renderShareCardToCanvas(canvasRef.current, cardData);
    try {
      const url = canvasRef.current.toDataURL("image/png");
      setDataUrl(url);
    } catch (err) {
      console.warn("Could not generate data URL:", err);
    }
  }, [isOpen, result, streakCount]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Copy Image to Clipboard
  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Clipboard Item PNG copy
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedImage(true);
          setStatusMessage("Image copied! Paste into Slack, WhatsApp, Twitter or Discord.");
          setTimeout(() => {
            setCopiedImage(false);
            setStatusMessage(null);
          }, 3500);
        } catch {
          // Fallback if browser blocks image copy: copy text
          const shareText = generateShareText(cardData);
          await navigator.clipboard.writeText(shareText);
          setCopiedText(true);
          setStatusMessage("Direct image copy blocked by browser. Score text copied instead!");
          setTimeout(() => {
            setCopiedText(false);
            setStatusMessage(null);
          }, 3500);
        }
      }, "image/png");
    } catch (err) {
      console.warn("Copy image error:", err);
    }
  }, [cardData]);

  // Download PNG file
  const handleDownloadImage = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `mindbreak-${result.gameId}-${result.score}pts.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage("Score card downloaded!");
    setTimeout(() => setStatusMessage(null), 3000);
  }, [dataUrl, result]);

  // Copy Text Breakdown
  const handleCopyText = useCallback(async () => {
    const text = generateShareText(cardData);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setStatusMessage("Score text breakdown copied to clipboard!");
      setTimeout(() => {
        setCopiedText(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err) {
      console.warn("Could not copy text:", err);
    }
  }, [cardData]);

  // Mobile Web Share
  const handleNativeShare = useCallback(async () => {
    const text = generateShareText(cardData);
    if (typeof navigator !== "undefined" && navigator.share) {
      if (canvasRef.current && navigator.canShare) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File(
            [blob],
            `mindbreak-${result.gameId}.png`,
            { type: "image/png" }
          );
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "Mind Break Score",
                text,
                files: [file],
              });
              return;
            } catch {
              // User dismissed or fallback
            }
          }
          // Fallback text share
          navigator.share({
            title: "Mind Break Score",
            text,
            url: `https://mindbreak.in/play/${result.gameId}`,
          });
        }, "image/png");
      } else {
        navigator.share({
          title: "Mind Break Score",
          text,
          url: `https://mindbreak.in/play/${result.gameId}`,
        });
      }
    }
  }, [cardData, result]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Result Card"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[540px] bg-card border border-line rounded-[28px] shadow-hero overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-acc/15 text-acc flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-acc" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink leading-tight">
                Share Score Card
              </h3>
              <p className="font-mono text-[11px] text-mute uppercase">
                {result.gameName} · {result.score} Points
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-line bg-surface text-mute hover:text-ink hover:border-ink/40 transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Card Preview */}
        <div className="p-6 overflow-y-auto flex flex-col items-center">
          {/* Offscreen high-DPI canvas (hidden, used for blob rendering) */}
          <canvas
            ref={canvasRef}
            className="hidden"
            width={1200}
            height={1200}
          />

          {/* Visual Card Preview rendered from canvas */}
          <div className="w-full max-w-[400px] aspect-square rounded-[20px] overflow-hidden border border-line shadow-md bg-[#0E1411] flex items-center justify-center relative mb-5 group">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`Mind Break ${result.gameName} Score Card`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-mute font-mono text-[13px]">
                <div className="w-6 h-6 rounded-full border-2 border-line border-t-acc animate-spin" />
                <span>Generating card...</span>
              </div>
            )}
          </div>

          {/* Status Toast Message */}
          {statusMessage && (
            <div className="w-full py-2 px-3 rounded-xl bg-lime/20 border border-lime text-lime-ink text-[12px] font-mono text-center mb-4 animate-fade-in flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {/* Action: Copy Image */}
            <button
              onClick={handleCopyImage}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-acc text-ink font-bold text-[14px] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* Action: Download PNG */}
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-line bg-surface text-ink font-semibold text-[14px] hover:border-ink hover:bg-card active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            {/* Action: Copy Text Breakdown */}
            <button
              onClick={handleCopyText}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-line bg-surface text-ink font-semibold text-[14px] hover:border-ink hover:bg-card active:scale-95 transition-all cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Action: Web Share */}
            <button
              onClick={handleNativeShare}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-line bg-surface text-mute hover:text-ink hover:border-ink active:scale-95 transition-all cursor-pointer text-[14px] font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>

          <p className="font-mono text-[11px] text-mute text-center mt-4">
            Share on Instagram, Slack, Twitter, WhatsApp or college discord channels
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
