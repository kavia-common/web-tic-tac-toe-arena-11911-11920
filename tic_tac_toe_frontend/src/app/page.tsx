"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Game constants and utilities
 */
type Player = "X" | "O";
type CellValue = Player | null;
type Mode = "pvp" | "pvc";

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

function checkWinner(board: CellValue[]) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] as [number, number, number] };
    }
  }
  if (board.every((c) => c !== null)) return { winner: null, line: null, draw: true as const };
  return null;
}

function getAvailableMoves(board: CellValue[]): number[] {
  const moves: number[] = [];
  for (let i = 0; i < 9; i++) if (board[i] === null) moves.push(i);
  return moves;
}

/**
 * Simple AI: tries to win, block, take center, take a corner, else random.
 */
function computeAIMove(board: CellValue[], ai: Player, human: Player): number | null {
  const moves = getAvailableMoves(board);
  if (!moves.length) return null;

  // Try winning move
  for (const m of moves) {
    const next = board.slice();
    next[m] = ai;
    if (checkWinner(next)?.winner === ai) return m;
  }

  // Block if human can win
  for (const m of moves) {
    const next = board.slice();
    next[m] = human;
    if (checkWinner(next)?.winner === human) return m;
  }

  // Center
  if (board[4] === null) return 4;

  // Corners
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // Any random remaining
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("pvc");
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [current, setCurrent] = useState<Player>("X");
  const [startingPlayer, setStartingPlayer] = useState<Player>("X");
  const [frozen, setFrozen] = useState(false); // prevent clicks during AI move
  const [highlight, setHighlight] = useState<number[] | null>(null);

  const result = useMemo(() => checkWinner(board), [board]);
  const gameOver = !!result;
  const statusText = useMemo(() => {
    if (result?.winner) {
      return `${result.winner} wins!`;
    }
    if (result?.draw) return "It's a draw!";
    return `${current}'s turn`;
  }, [result, current]);

  // Compute who is human/computer
  const players = useMemo(() => {
    if (mode === "pvc") {
      return {
        human: startingPlayer, // the starter is human
        ai: startingPlayer === "X" ? "O" : "X",
      };
    }
    return null;
  }, [mode, startingPlayer]);

  const triggerAIMove = useCallback(
    (nextBoard: CellValue[], nextPlayer: Player) => {
      if (mode !== "pvc" || gameOver) return;
      // Ensure players is non-null in pvc mode before using
      if (players && nextPlayer === players.ai) {
        const ai: Player = players.ai;
        const human: Player = players.human;
        setFrozen(true);
        // simulate thinking
        setTimeout(() => {
          const aiMove = computeAIMove(nextBoard, ai, human);
          if (aiMove !== null) {
            const updated = nextBoard.slice();
            updated[aiMove] = ai;
            const res = checkWinner(updated);
            if (res?.winner && res.line) setHighlight(res.line);
            setBoard(updated);
            setCurrent(human);
            setFrozen(false);
          } else {
            setFrozen(false);
          }
        }, 350);
      }
    },
    [mode, players, gameOver]
  );

  const handleCellClick = (idx: number) => {
    if (frozen || gameOver || board[idx]) return;
    if (mode === "pvc") {
      // Human move
      const isHumanTurn = !players || current === players.human;
      if (!isHumanTurn) return;
    }
    const next = board.slice();
    next[idx] = current;
    const res = checkWinner(next);
    if (res?.winner && res.line) setHighlight(res.line);
    setBoard(next);
    if (!res) {
      const nextPlayer: Player = current === "X" ? "O" : "X";
      setCurrent(nextPlayer);
      triggerAIMove(next, nextPlayer);
    }
  };

  const restartRound = () => {
    setBoard(Array(9).fill(null));
    setCurrent(startingPlayer);
    setHighlight(null);
    setFrozen(false);
  };

  const newGame = (newMode?: Mode) => {
    const m = newMode ?? mode;
    setMode(m);
    const nextStarter: Player = startingPlayer === "X" ? "O" : "X";
    setStartingPlayer(nextStarter);
    setBoard(Array(9).fill(null));
    setCurrent(nextStarter);
    setHighlight(null);
    setFrozen(false);
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    restartRound();
  };

  // Derived board size responsiveness
  // We will use CSS Grid with responsive sizing via Tailwind.
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <header className="flex flex-col gap-3 items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-secondary">
            Tic Tac Toe Arena
          </h1>
          <p className="text-muted text-sm sm:text-base">
            Play in User vs Computer or User vs User modes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <button
              aria-label="User vs Computer"
              className={`btn ${mode === "pvc" ? "btn-primary" : "btn-outline"}`}
              onClick={() => changeMode("pvc")}
            >
              User vs Computer
            </button>
            <button
              aria-label="User vs User"
              className={`btn ${mode === "pvp" ? "btn-primary" : "btn-outline"}`}
              onClick={() => changeMode("pvp")}
            >
              User vs User
            </button>
            <span className="badge bg-surface text-secondary border border-secondary/10">
              Starting: <span className="ml-1 font-bold">{startingPlayer}</span>
            </span>
          </div>
        </header>

        <section className="bg-surface rounded-16 shadow-soft p-4 sm:p-6">
          {/* Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: result?.winner
                    ? "var(--color-accent)"
                    : "var(--color-primary)",
                }}
              />
              <p
                className="font-semibold"
                style={{
                  color: result?.winner
                    ? "var(--color-accent)"
                    : "var(--color-primary)",
                }}
              >
                {statusText}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={restartRound}>
                Restart
              </button>
              <button className="btn btn-primary" onClick={() => newGame()}>
                New Game
              </button>
            </div>
          </div>

          {/* Board */}
          <div className="w-full mx-auto">
            <div
              className="grid gap-2 sm:gap-3 mx-auto"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                maxWidth: 560,
              }}
            >
              {board.map((val, i) => {
                const isWinning = highlight?.includes(i) ?? false;
                const clickable = !board[i] && !gameOver && !frozen;
                const onActivate = () => handleCellClick(i);
                const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (clickable) onActivate();
                  }
                };
                return (
                  <button
                    key={i}
                    aria-label={`Cell ${i + 1}`}
                    aria-disabled={!clickable}
                    disabled={!clickable}
                    role="button"
                    tabIndex={clickable ? 0 : -1}
                    onClick={onActivate}
                    onKeyDown={onKeyDown}
                    className={`relative aspect-square rounded-16 border border-secondary/15 bg-white
                      flex items-center justify-center text-4xl sm:text-5xl font-extrabold transition
                      ${clickable ? "hover:shadow-soft active:scale-[0.99]" : ""}
                      ${isWinning ? "ring-2 ring-offset-2 ring-[--color-accent]" : ""}`}
                  >
                    <span
                      className={`select-none ${
                        val === "X" ? "text-primary" : "text-secondary"
                      }`}
                      style={{
                        color:
                          val === "X"
                            ? "var(--color-primary)"
                            : "var(--color-secondary)",
                      }}
                    >
                      {val}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              Mode:{" "}
              <strong className="text-secondary">
                {mode === "pvc" ? "User vs Computer" : "User vs User"}
              </strong>
              {mode === "pvc" && (
                <span className="ml-2 text-xs text-muted">
                  (You are {players?.human})
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setStartingPlayer((p) => (p === "X" ? "O" : "X"))}
                disabled={!board.every((c) => c === null)}
                title={
                  board.every((c) => c === null)
                    ? "Toggle starting player"
                    : "Can only toggle before starting a round"
                }
              >
                Toggle Starter
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setBoard(Array(9).fill(null));
                  setCurrent(startingPlayer);
                  setHighlight(null);
                  setFrozen(false);
                }}
              >
                Clear Board
              </button>
            </div>
          </div>
        </section>

        {/* Small usage note */}
        <p className="mt-4 text-center text-xs text-muted">
          Tip: Use Restart to replay with the same starter. New Game alternates
          the starting player automatically.
        </p>
      </div>
    </main>
  );
}
