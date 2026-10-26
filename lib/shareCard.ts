import { RoundResult } from "@/games/types";

export interface ShareCardData {
  result: RoundResult;
  streakCount: number;
  dateStr?: string;
}

/**
 * Generates an emoji-block text breakdown (Wordle / Duolingo style) for instant sharing.
 */
export function generateShareText(data: ShareCardData): string {
  const { result, streakCount } = data;
  const totalAttempts = result.puzzlesSolved + result.errors;
  const accuracy = totalAttempts > 0 ? result.accuracy : 100;

  // Generate 10-block visual progress bar based on accuracy
  const activeBlocks = Math.round((accuracy / 100) * 10);
  const progressBar = "🟧".repeat(activeBlocks) + "⬛".repeat(10 - activeBlocks);

  const lines = [
    `Mind Break · ${result.gameName}`,
    `⏱️ 60s Round · ${result.score} pts`,
    `🎯 ${result.puzzlesSolved} solved (${accuracy}% accuracy)`,
    `🔥 ${streakCount} day streak`,
    progressBar,
    `https://mindbreak.in/play/${result.gameId}`,
  ];

  return lines.join("\n");
}

/**
 * Renders the high-DPI (1200x1200) Swiss-precision share card onto an HTML5 Canvas.
 */
export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  data: ShareCardData
): void {
  const { result, streakCount, dateStr } = data;
  const width = 1200;
  const height = 1200;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background - Dark Instrument stopwatch aesthetic (DESIGN.md §2.1 & §2.5)
  ctx.fillStyle = "#0E1411";
  ctx.fillRect(0, 0, width, height);

  // Subtle outer rounded boundary hairline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Header: Brand & Date
  // Dot
  ctx.fillStyle = "#FF5A2B";
  ctx.beginPath();
  ctx.arc(80, 95, 8, 0, Math.PI * 2);
  ctx.fill();

  // Brand Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 28px 'JetBrains Mono', monospace, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("MINDBREAK.IN", 102, 95);

  // Date / Session Stamp (right aligned)
  const displayDate =
    dateStr ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();

  ctx.fillStyle = "#9AA59D";
  ctx.font = "500 22px 'JetBrains Mono', monospace, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(displayDate, width - 80, 95);

  // Game Pill Tag
  const gameTag = `60S ROUND · ${result.gameName.toUpperCase()}`;
  ctx.font = "bold 20px 'JetBrains Mono', monospace, sans-serif";
  const tagWidth = ctx.measureText(gameTag).width + 36;
  const tagX = width / 2 - tagWidth / 2;
  const tagY = 170;
  const tagH = 44;

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagWidth, tagH, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#CFEA6B";
  ctx.textAlign = "center";
  ctx.fillText(gameTag, width / 2, tagY + tagH / 2);

  // Signature 60-Tick Ring (DESIGN.md §5.1)
  const centerX = width / 2;
  const centerY = 560;
  const ringRadius = 240;
  const tickLength = 26;
  const tickWidth = 5;

  // Active progress ratio based on seconds played
  const progressRatio = Math.min(1, Math.max(0.1, result.secondsPlayed / 60));
  const activeTicksCount = Math.round(60 * progressRatio);

  for (let i = 0; i < 60; i++) {
    // 12 o'clock is -90 degrees
    const angleDeg = (i * 360) / 60 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;

    const innerX = centerX + (ringRadius - tickLength) * Math.cos(angleRad);
    const innerY = centerY + (ringRadius - tickLength) * Math.sin(angleRad);
    const outerX = centerX + ringRadius * Math.cos(angleRad);
    const outerY = centerY + ringRadius * Math.sin(angleRad);

    const isActive = i < activeTicksCount;

    ctx.strokeStyle = isActive ? "#FF5A2B" : "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = tickWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }

  // Active indicator dot at current tick
  if (activeTicksCount > 0) {
    const dotAngleDeg = (activeTicksCount * 360) / 60 - 90;
    const dotAngleRad = (dotAngleDeg * Math.PI) / 180;
    const dotX = centerX + ringRadius * Math.cos(dotAngleRad);
    const dotY = centerY + ringRadius * Math.sin(dotAngleRad);

    ctx.fillStyle = "#FF5A2B";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#0E1411";
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  // Inside Ring: Score Numerals
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 130px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText(result.score.toString(), centerX, centerY - 15);

  ctx.fillStyle = "#9AA59D";
  ctx.font = "600 24px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText("FINAL POINTS", centerX, centerY + 80);

  // Micro Stats Separator Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 870);
  ctx.lineTo(width - 80, 870);
  ctx.stroke();

  // 3-Column Stats Grid
  const col1X = 260;
  const col2X = 600;
  const col3X = 940;
  const statsY = 930;

  // Column 1: Streak
  ctx.fillStyle = "#FF5A2B";
  ctx.font = "bold 44px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText(`🔥 ${streakCount}`, col1X, statsY);

  ctx.fillStyle = "#9AA59D";
  ctx.font = "500 18px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText("DAY STREAK", col1X, statsY + 45);

  // Column 2: Accuracy
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 44px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText(`${result.accuracy}%`, col2X, statsY);

  ctx.fillStyle = "#9AA59D";
  ctx.font = "500 18px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText("ACCURACY", col2X, statsY + 45);

  // Column 3: Solved
  ctx.fillStyle = "#CFEA6B";
  ctx.font = "bold 44px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText(`${result.puzzlesSolved}`, col3X, statsY);

  ctx.fillStyle = "#9AA59D";
  ctx.font = "500 18px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText("SOLVED", col3X, statsY + 45);

  // Footer Tagline & Link
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(80, 1050);
  ctx.lineTo(width - 80, 1050);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#9AA59D";
  ctx.font = "400 22px 'Instrument Sans', sans-serif";
  ctx.fillText("Daily 60-Second Mental Reset · One minute. Don't break it.", 80, 1110);

  ctx.textAlign = "right";
  ctx.fillStyle = "#FF5A2B";
  ctx.font = "bold 24px 'JetBrains Mono', monospace, sans-serif";
  ctx.fillText("mindbreak.in", width - 80, 1110);
}
