"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const SOUND_PREF_KEY = "mindbreak_sound_enabled";
const SOUND_CHANGE_EVENT = "mindbreak_sound_changed";

/**
 * Lazy audio context singleton to comply with browser autoplay policies.
 */
let audioCtx: AudioContext | null = null;

function initAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// Auto-unlock AudioContext on first user interaction anywhere on the page
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = initAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  ["click", "keydown", "touchstart", "pointerdown"].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
  });
}

/**
 * Check if sound effects are enabled.
 * Defaults to true so players hear audio out-of-the-box, unless explicitly muted.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUND_PREF_KEY);
  return stored !== "false";
}

/**
 * Persist sound preference and notify active listeners.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
}

/**
 * Helper to safely execute a sound synth function after ensuring the AudioContext is running.
 */
function playSynthSound(synth: (ctx: AudioContext) => void): void {
  if (!isSoundEnabled()) return;
  const ctx = initAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume()
      .then(() => {
        try {
          synth(ctx);
        } catch {
          // ignore playback errors
        }
      })
      .catch(() => {});
  } else {
    try {
      synth(ctx);
    } catch {
      // ignore playback errors
    }
  }
}

/**
 * Tactile, subtle click for button presses, tile selections, and digit inputs.
 * Duration: ~45ms, frequency: 440Hz sine wave.
 */
export function playTapSound(): void {
  playSynthSound((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  });
}

/**
 * Crisp, rewarding two-tone sine chime on correct puzzle solve.
 * Notes: D5 (587Hz) -> A5 (880Hz), duration ~180ms.
 */
export function playCorrectSound(): void {
  playSynthSound((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.07); // A5

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  });
}

/**
 * Soft, low-frequency triangle thud on error/mistake/skip.
 * Duration: ~160ms, frequency drop: 150Hz -> 80Hz.
 */
export function playErrorSound(): void {
  playSynthSound((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  });
}

/**
 * Musical pitch for Pattern Recall memory quadrants (0, 1, 2, 3).
 * Four distinct harmonic notes: E4 (330Hz), G4 (392Hz), B4 (494Hz), E5 (659Hz).
 */
export function playPatternNoteSound(tileIndex: number): void {
  playSynthSound((ctx) => {
    const frequencies = [329.63, 392.0, 493.88, 659.25];
    const freq = frequencies[tileIndex % frequencies.length] || 440;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  });
}

/**
 * Celebratory 3-note ascending harmonic chime on round completion.
 * Notes: C5 (523Hz), E5 (659Hz), G5 (784Hz).
 */
export function playRoundEndSound(): void {
  playSynthSound((ctx) => {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.32, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  });
}

/**
 * React hook to access and toggle sound effects.
 */
export function useSoundEffects() {
  const [enabled, setEnabled] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setEnabled(isSoundEnabled());

    const handlePrefChange = () => {
      if (mountedRef.current) {
        setEnabled(isSoundEnabled());
      }
    };

    window.addEventListener(SOUND_CHANGE_EVENT, handlePrefChange);
    window.addEventListener("storage", handlePrefChange);

    return () => {
      mountedRef.current = false;
      window.removeEventListener(SOUND_CHANGE_EVENT, handlePrefChange);
      window.removeEventListener("storage", handlePrefChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);

    // Play immediate feedback tone when toggling
    if (next) {
      playCorrectSound();
    }
  }, [enabled]);

  return {
    soundEnabled: enabled,
    toggleSound: toggle,
    playTap: playTapSound,
    playCorrect: playCorrectSound,
    playError: playErrorSound,
    playPatternNote: playPatternNoteSound,
    playRoundEnd: playRoundEndSound,
  };
}
