import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const options = ["q", "r", "b", "n"] as const;

export function PromotionPicker({
  onPick,
  color
}: {
  onPick: (piece: "q" | "r" | "b" | "n") => void;
  color: "w" | "b";
}) {
  const glyphs =
    color === "w"
      ? { q: "♕", r: "♖", b: "♗", n: "♘" }
      : { q: "♛", r: "♜", b: "♝", n: "♞" };

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-bg/70 p-4">
      <Card className="w-full max-w-sm">
        <div className="mb-4 text-lg font-semibold text-text">Choose promotion</div>
        <div className="grid grid-cols-4 gap-3">
          {options.map((option) => (
            <Button key={option} variant="secondary" className="text-3xl" onClick={() => onPick(option)}>
              {glyphs[option]}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
