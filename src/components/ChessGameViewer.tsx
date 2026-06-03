"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";

type Square = string | null;
type Board = Square[][];

const PIECE_SYMBOLS: Record<string, string> = {
  K: "\u2654",
  Q: "\u2655",
  R: "\u2656",
  B: "\u2657",
  N: "\u2658",
  P: "\u2659",
  k: "\u265A",
  q: "\u265B",
  r: "\u265C",
  b: "\u265D",
  n: "\u265E",
  p: "\u265F",
};

const MOVES: { san: string; note?: string }[] = [
  { san: "e4", note: "Polgár opens with the king's pawn." },
  { san: "e5" },
  { san: "Nf3" },
  { san: "Nc6" },
  { san: "Bb5", note: "The Ruy Lopez." },
  { san: "Nf6" },
  { san: "O-O", note: "Berlin Defence incoming. Kasparov chose this line, famously used by himself against Kramnik. Polgár is forcing him to play against his own preparation." },
  { san: "Nxe4" },
  { san: "d4" },
  { san: "Nd6" },
  { san: "Bxc6" },
  { san: "dxc6" },
  { san: "dxe5" },
  { san: "Nf5" },
  { san: "Qxd8+" },
  { san: "Kxd8", note: "The queens come off early. This is a queenless middlegame, the position Kasparov knows inside out." },
  { san: "Nc3" },
  { san: "h6" },
  { san: "Rd1+" },
  { san: "Ke8" },
  { san: "h3" },
  { san: "Be7" },
  { san: "Ne2" },
  { san: "Nh4" },
  { san: "Nxh4" },
  { san: "Bxh4" },
  { san: "Be3" },
  { san: "Bf5" },
  { san: "Nd4" },
  { san: "Bh7" },
  { san: "g4", note: "Polgár pushes her kingside pawn majority. This is her trump card." },
  { san: "Be7" },
  { san: "Kg2" },
  { san: "h5" },
  { san: "Nf5" },
  { san: "Bf8" },
  { san: "Kf3" },
  { san: "Bg6" },
  { san: "Rd2" },
  { san: "hxg4+" },
  { san: "hxg4" },
  { san: "Rh3+" },
  { san: "Kg2" },
  { san: "Rh7" },
  { san: "Kg3" },
  { san: "f6" },
  { san: "Bf4" },
  { san: "Bxf5" },
  { san: "gxf5" },
  { san: "fxe5" },
  { san: "Re1" },
  { san: "Bd6" },
  { san: "Bxe5" },
  { san: "Kd7" },
  { san: "c4" },
  { san: "c5" },
  { san: "Bxd6" },
  { san: "cxd6" },
  { san: "Re6", note: "Polgár's rooks storm into Kasparov's position. His king is still stranded on d7." },
  { san: "Rah8" },
  { san: "Rexd6+" },
  { san: "Kc8" },
  { san: "R2d5" },
  { san: "Rh3+" },
  { san: "Kg2" },
  { san: "Rh2+" },
  { san: "Kf3" },
  { san: "R2h3+" },
  { san: "Ke4" },
  { san: "b6" },
  { san: "Rc6+" },
  { san: "Kb8" },
  { san: "Rd7", note: "The rooks dominate. Kasparov is two pawns down with no counterplay." },
  { san: "Rh2" },
  { san: "Ke3" },
  { san: "Rf8" },
  { san: "Rcc7" },
  { san: "Rxf5" },
  { san: "Rb7+" },
  { san: "Kc8" },
  { san: "Rdc7+" },
  { san: "Kd8" },
  { san: "Rxg7", note: "Kasparov resigned. For the first time in chess history, a woman had beaten the world's number one player in competitive play. He walked out refusing to face the press." },
];

// Convert a chess.js board() result into the [8][8] string grid this component renders.
// chess.js board()[0] is rank 8 (top), which matches the existing render order.
function chessBoardToGrid(chess: Chess): Board {
  return chess.board().map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        return cell.color === "w" ? cell.type.toUpperCase() : cell.type.toLowerCase();
      })
  );
}

export default function ChessGameViewer() {
  const [moveIndex, setMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Build every board state once by replaying the SAN list through chess.js.
  // chess.js validates legality, so an illegal/typo move throws here loudly
  // during development instead of silently rendering a corrupted board.
  const boards = useMemo(() => {
    const chess = new Chess();
    const all: Board[] = [chessBoardToGrid(chess)];
    MOVES.forEach((m, i) => {
      const result = chess.move(m.san);
      if (!result) {
        throw new Error(
            `Illegal or unparseable move at ply ${i + 1}: "${m.san}". ` +
            `Check the MOVES array against the source PGN.`
        );
      }
      all.push(chessBoardToGrid(chess));
    });
    return all;
  }, []);

  const currentBoard = boards[moveIndex + 1] || boards[0];
  const currentNote = moveIndex >= 0 ? MOVES[moveIndex].note : undefined;
  const moveNumber = Math.floor(moveIndex / 2) + 1;
  const currentMove = moveIndex >= 0 ? MOVES[moveIndex].san : "";
  const isWhiteMove = moveIndex % 2 === 0;

  useEffect(() => {
    if (!isPlaying) return;
    if (moveIndex >= MOVES.length - 1) {
      setIsPlaying(false);
      return;
    }
    const delay = currentNote ? 2500 : 900;
    const t = setTimeout(() => setMoveIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [isPlaying, moveIndex, currentNote]);

  const goTo = (i: number) => {
    setIsPlaying(false);
    setMoveIndex(Math.max(-1, Math.min(MOVES.length - 1, i)));
  };

  return (
      <div className="bg-paper p-6 rounded-lg shadow-sm border border-sage-100">
        <p className="text-xs uppercase tracking-widest text-sage-600 mb-2">Figure 6</p>
        <h3 className="text-2xl font-serif mb-1">Polgár vs Kasparov, Moscow 2002</h3>
        <p className="text-xs text-sage-600 italic mb-6">
          Russia vs The Rest of the World, round 5. Rapid time control. Ruy Lopez, Berlin Defence.
        </p>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-start">
          <div className="aspect-square max-w-md mx-auto w-full">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded overflow-hidden border border-sage-300">
              {currentBoard.map((row, r) =>
                  row.map((piece, f) => {
                    const isLight = (r + f) % 2 === 0;
                    return (
                        <div
                            key={`${r}-${f}`}
                            className={`flex items-center justify-center ${isLight ? "bg-sage-50" : "bg-sage-300"}`}
                            style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)", lineHeight: 1 }}
                        >
                          {piece ? (
                              <span style={{ color: piece === piece.toUpperCase() ? "#2D2D2B" : "#5c4a2e" }}>
                        {PIECE_SYMBOLS[piece]}
                      </span>
                          ) : null}
                        </div>
                    );
                  })
              )}
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="mb-4 min-h-[120px]">
              {moveIndex >= 0 ? (
                  <>
                    <p className="text-sage-600 text-xs uppercase tracking-widest mb-1">
                      Move {moveNumber}
                      {isWhiteMove ? "" : "..."}
                    </p>
                    <p className="stat-number text-4xl mb-3">
                      {isWhiteMove ? `${moveNumber}. ${currentMove}` : `${moveNumber}... ${currentMove}`}
                    </p>
                  </>
              ) : (
                  <>
                    <p className="text-sage-600 text-xs uppercase tracking-widest mb-1">Starting position</p>
                    <p className="stat-number text-4xl mb-3">Press play</p>
                  </>
              )}
              {currentNote ? (
                  <p className="text-sm text-ink/80 leading-relaxed italic">{currentNote}</p>
              ) : null}
            </div>

            <div className="flex gap-2 flex-wrap mt-auto">
              <button
                  onClick={() => goTo(-1)}
                  className="px-4 py-2 text-sm border border-sage-300 rounded hover:bg-sage-50 transition-colors"
              >
                Reset
              </button>
              <button
                  onClick={() => goTo(moveIndex - 1)}
                  disabled={moveIndex < 0}
                  className="px-4 py-2 text-sm border border-sage-300 rounded hover:bg-sage-50 transition-colors disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                  onClick={() => {
                    if (moveIndex >= MOVES.length - 1) goTo(-1);
                    setIsPlaying((p) => !p);
                  }}
                  className="px-6 py-2 text-sm bg-sage-700 text-paper rounded hover:bg-sage-800 transition-colors"
              >
                {isPlaying ? "Pause" : moveIndex >= MOVES.length - 1 ? "Replay" : "Play"}
              </button>
              <button
                  onClick={() => goTo(moveIndex + 1)}
                  disabled={moveIndex >= MOVES.length - 1}
                  className="px-4 py-2 text-sm border border-sage-300 rounded hover:bg-sage-50 transition-colors disabled:opacity-40"
              >
                Next →
              </button>
              <button
                  onClick={() => goTo(MOVES.length - 1)}
                  className="px-4 py-2 text-sm border border-sage-300 rounded hover:bg-sage-50 transition-colors"
              >
                End
              </button>
            </div>

            <div className="mt-4">
              <input
                  type="range"
                  min={-1}
                  max={MOVES.length - 1}
                  value={moveIndex}
                  onChange={(e) => goTo(parseInt(e.target.value, 10))}
                  className="w-full accent-sage-700"
              />
              <p className="text-xs text-sage-600 mt-1 text-center">
                Move {moveIndex + 1} of {MOVES.length}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}