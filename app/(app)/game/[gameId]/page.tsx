import Link from "next/link";
import { notFound } from "next/navigation";

import { ChessWorkspace } from "@/components/chess/chess-workspace";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getGameById } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export default async function GamePage({
  params
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const data = await getGameById(gameId);

  if (!data.game) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-text">Replay game</div>
          <div className="mt-2 text-sm text-muted">
            Result: {data.game.result}. Opening: {data.game.opening_name ?? "Unknown"}.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/analysis?gameId=${gameId}`} className={cn(buttonVariants({ variant: "secondary", size: "md" }))}>
            Analyze
          </Link>
          <Link href={`/review/${gameId}`} className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
            Review
          </Link>
        </div>
      </Card>
      <ChessWorkspace
        mode="analysis"
        initialPgn={data.game.pgn}
        boardTheme="midnight"
        pieceTheme="classic"
        soundEnabled={false}
        analysisDepth={12}
        multiPv={1}
        readOnly
      />
    </div>
  );
}
