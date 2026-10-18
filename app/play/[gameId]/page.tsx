import { Suspense } from "react";
import { PlayClient } from "./PlayClient";
import { getAllGames } from "@/games/registry";

export function generateStaticParams() {
  const games = getAllGames();
  return games.map((game) => ({
    gameId: game.id,
  }));
}

interface PlayPageProps {
  params: Promise<{ gameId: string }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="w-8 h-8 rounded-full border-2 border-line border-t-acc animate-spin" />
        </div>
      }
    >
      <PlayClient params={params} />
    </Suspense>
  );
}
