"use client";

import React, { useEffect, useRef, useState } from "react";

function makeEquation(mode: "easy" | "normal" | "hard" | "insane" = "normal") {
  // mode changes ranges, operations and correctness probability
  let min = 1;
  let max = 12;
  let ops: Array<string> = ["+", "-", "×"];
  let correctProb = 0.6;

  if (mode === "easy") {
    min = 1;
    max = 8;
    ops = ["+", "-"];
    correctProb = 0.8;
  } else if (mode === "hard") {
    // Hard: larger numbers, more multiplication, slightly lower correctness
    min = 2;
    max = 30;
    // include × twice to weight multiplication higher
    ops = ["+", "-", "×", "×"];
    correctProb = 0.4;
  } else if (mode === "insane") {
    // Insane mode: larger numbers, more terms, all ops, and lower chance of being correct
    min = 2;
    max = 50;
    ops = ["+", "-", "×"];
    correctProb = 0.35;
  }

  // For insane mode create multi-term expressions
  if (mode === "insane") {
    const termCount = Math.random() < 0.5 ? 3 : 4;
    const terms: number[] = [];
    const chosenOps: string[] = [];
    for (let i = 0; i < termCount; i++) {
      terms.push(Math.floor(Math.random() * (max - min + 1)) + min);
      if (i < termCount - 1) chosenOps.push(ops[Math.floor(Math.random() * ops.length)]);
    }

    // compute real value left-to-right (no precedence simplification for simplicity)
    let real = terms[0];
    for (let i = 0; i < chosenOps.length; i++) {
      const op = chosenOps[i];
      const val = terms[i + 1];
      if (op === "+") real = real + val;
      else if (op === "-") real = real - val;
      else real = real * val;
    }

    const correct = Math.random() < correctProb;
    let shown = real;
    if (!correct) {
      // Introduce a complicated mistake: either change one term or one operator
      if (Math.random() < 0.5) {
        // change a term
        const idx = Math.floor(Math.random() * terms.length);
        const delta = Math.max(1, Math.floor(Math.abs(real) * 0.08)) + Math.floor(Math.random() * 10);
        const newTerms = terms.slice();
        newTerms[idx] = newTerms[idx] + (Math.random() < 0.5 ? delta : -delta);
        // recompute
        let r = newTerms[0];
        for (let i = 0; i < chosenOps.length; i++) {
          const op = chosenOps[i];
          const val = newTerms[i + 1];
          if (op === "+") r = r + val;
          else if (op === "-") r = r - val;
          else r = r * val;
        }
        shown = r;
      } else {
        // change an operator
        const opIdx = Math.floor(Math.random() * chosenOps.length);
        const newOps = chosenOps.slice();
        // pick a different op
        const altOps = ops.filter((o) => o !== newOps[opIdx]);
        newOps[opIdx] = altOps[Math.floor(Math.random() * altOps.length)];
        // recompute
        let r = terms[0];
        for (let i = 0; i < newOps.length; i++) {
          const op = newOps[i];
          const val = terms[i + 1];
          if (op === "+") r = r + val;
          else if (op === "-") r = r - val;
          else r = r * val;
        }
        shown = r;
      }
      if (shown === real) shown = real + (Math.floor(Math.random() * 3) + 1);
    }

    // build text
    let txt = String(terms[0]);
    for (let i = 0; i < chosenOps.length; i++) {
      txt += ` ${chosenOps[i]} ${terms[i + 1]}`;
    }
    return { text: `${txt} = ${shown}`, correct };
  }

  // Occasionally make a 3-term expression in hard mode (adds extra difficulty)
  if (mode === "hard" && Math.random() < 0.25) {
    const termCount = 3;
    const terms: number[] = [];
    const chosenOps: string[] = [];
    for (let i = 0; i < termCount; i++) {
      terms.push(Math.floor(Math.random() * (max - min + 1)) + min);
      if (i < termCount - 1) chosenOps.push(ops[Math.floor(Math.random() * ops.length)]);
    }

    let real = terms[0];
    for (let i = 0; i < chosenOps.length; i++) {
      const op = chosenOps[i];
      const val = terms[i + 1];
      if (op === "+") real = real + val;
      else if (op === "-") real = real - val;
      else real = real * val;
    }

    const correct = Math.random() < correctProb;
    let shown = real;
    if (!correct) {
      // small but noticeable mistake
      const idx = Math.floor(Math.random() * terms.length);
      const delta = Math.max(2, Math.floor(Math.abs(real) * 0.12)) + Math.floor(Math.random() * 8);
      const newTerms = terms.slice();
      newTerms[idx] = newTerms[idx] + (Math.random() < 0.5 ? delta : -delta);
      let r = newTerms[0];
      for (let i = 0; i < chosenOps.length; i++) {
        const op = chosenOps[i];
        const val = newTerms[i + 1];
        if (op === "+") r = r + val;
        else if (op === "-") r = r - val;
        else r = r * val;
      }
      shown = r;
      if (shown === real) shown = real + (Math.floor(Math.random() * 3) + 1);
    }

    let txt = String(terms[0]);
    for (let i = 0; i < chosenOps.length; i++) {
      txt += ` ${chosenOps[i]} ${terms[i + 1]}`;
    }
    return { text: `${txt} = ${shown}`, correct };
  }

  // default two-term expression for other modes
  const a = Math.floor(Math.random() * (max - min + 1)) + min;
  const b = Math.floor(Math.random() * (max - min + 1)) + min;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let real: number;
  if (op === "+") real = a + b;
  else if (op === "-") real = a - b;
  else real = a * b;

  const correct = Math.random() < correctProb;
  let shown = real;
  if (!correct) {
    // make harder modes have larger mistakes
    const deltaBase = mode === "hard" ? Math.max(2, Math.floor(Math.abs(real) * 0.15)) : 1;
    const delta = deltaBase + Math.floor(Math.random() * (mode === "easy" ? 2 : 6));
    shown = Math.random() < 0.5 ? real + delta : real - delta;
    if (shown === real) shown = real + (delta || 1);
  }

  return { text: `${a} ${op} ${b} = ${shown}`, correct };
}

export default function Home() {
  const [mode, setMode] = useState<"easy" | "normal" | "hard" | "insane">("normal");
  const TIME_LIMIT = mode === "easy" ? 10000 : mode === "normal" ? 5000 : mode === "hard" ? 5000 : 5000; // ms by mode (easy=10s, normal=5s, hard=5s, insane=5s)
  const [equation, setEquation] = useState(() => makeEquation(mode));
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(false); // start as false, wait for player to click
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // load best score for the current mode from localStorage (client-only)
    try {
      const key = `calc_best_score_${mode}`;
      const raw = localStorage.getItem(key);
      if (raw) setBest(Number(raw));
      else setBest(0);
    } catch (e) {
      // ignore (e.g., SSR or privacy settings)
    }

    // don't start the timer until the player has started the game
    if (!started) {
      return;
    }

    // start timer when a new equation is shown
    setTimeLeft(TIME_LIMIT);
    setRunning(true);
    setMessage("");
    startRef.current = Date.now();

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(() => {
      if (!startRef.current) return;
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(left);
      if (left === 0) {
        // timeout
        setMessage("Time!");
        setStreak(0);
        setRunning(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 40);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equation.text, started, mode]);

  function nextEquation() {
    setEquation(makeEquation(mode));
  }

  function handleAnswer(choiceIsCorrect: boolean) {
    if (!running) return;
    if (choiceIsCorrect === equation.correct) {
      // correct answer
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMessage("Correct!");
      // update best if needed
      if (newStreak > best) {
        setBest(newStreak);
        try {
          const key = `calc_best_score_${mode}`;
          localStorage.setItem(key, String(newStreak));
        } catch (e) {}
      }
      // small delay then next
      setRunning(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeout(() => {
        nextEquation();
      }, 180);
    } else {
      // wrong answer
      setMessage("Wrong");
      setStreak(0);
      setRunning(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function restart() {
    // start a fresh game immediately
    setStreak(0);
    setMessage("");
    setEquation(makeEquation(mode));
    setStarted(true);
    setRunning(true);
  }

  function startGame() {
    setStarted(true);
    setRunning(true);
    setMessage("");
  }

  const pct = Math.round((timeLeft / TIME_LIMIT) * 100);

  // Keyboard controls: when not started, Enter/Space/P starts the game.
  // When running: 'C' => Correct, 'W' => Wrong.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!started) {
        if (key === " " || key === "spacebar" || e.code === "Space" || key === "enter" || key === "p") {
          // allow starting via keyboard
          e.preventDefault();
          setStarted(true);
          setRunning(true);
          setStreak(0);
          setEquation(makeEquation(mode));
        }
        return;
      }

      // If the game has been started but is not currently running (game over),
      // allow Space to play again.
      if (!running) {
        if (key === " " || key === "spacebar" || e.code === "Space") {
          e.preventDefault();
          restart();
        }
        return;
      }

      if (key === "c") {
        e.preventDefault();
        handleAnswer(true);
      } else if (key === "w") {
        e.preventDefault();
        handleAnswer(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, running, equation.text, streak, best]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl p-8">
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
          {!started ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <h2 className="text-2xl font-bold">Quick Math — Correct or Wrong?</h2>
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Choose a mode, then click Play Game. Time per equation changes with mode.
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setMode("easy")}
                  className={`px-3 py-1 rounded ${mode === "easy" ? "bg-blue-600 text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setMode("normal")}
                  className={`px-3 py-1 rounded ${mode === "normal" ? "bg-blue-600 text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setMode("hard")}
                  className={`px-3 py-1 rounded ${mode === "hard" ? "bg-blue-600 text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Hard
                </button>
                <button
                  onClick={() => setMode("insane")}
                  className={`px-3 py-1 rounded ${mode === "insane" ? "bg-blue-600 text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Insane
                </button>
              </div>

              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Selected: <span className="font-semibold">{mode}</span></div>
                <button
                  onClick={() => {
                      // start fresh
                      setStreak(0);
                      setEquation(makeEquation(mode));
                      setStarted(true);
                      setRunning(true);
                    }}
                  className="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Play Game
                </button>
              </div>

              {best > 0 && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
                  Best streak: <span className="font-bold">{best}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold">Quick Math — Correct or Wrong?</h2>

              <div className="mb-4">
                <div
                  className="mb-2 text-4xl font-bold"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {equation.text}
                </div>

                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700">
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    style={{ width: `${pct}%` }}
                    className={`h-3 rounded bg-green-500 transition-[width]`}>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex gap-3">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 rounded bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Mark correct"
                  >
                    Correct (C)
                  </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 rounded bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  aria-label="Mark wrong"
                >
                  Wrong (W)
                </button>
              </div>

                <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="mr-2 text-sm text-zinc-600 dark:text-zinc-300">Streak</span>
                  <span className="text-lg font-bold">{streak}</span>
                  <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">Best: {best}</span>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">{Math.ceil(timeLeft / 1000)}s</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-zinc-700 dark:text-zinc-300">{message}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={restart}
                    className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Play Again (Space)
                  </button>
                  {!running && (
                    <button
                      onClick={() => {
                        setStarted(false);
                        setRunning(false);
                        setMessage("");
                      }}
                      className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Choose Different Mode
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {started && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Click the button matching whether the equation is correct. You have {Math.ceil(TIME_LIMIT/1000)} seconds per
            equation. Your score is how many correct guesses you make in a row.
          </p>
        )}
      </main>
    </div>
  );
}
