"use client";

import React, { useEffect, useRef, useState } from "react";

function makeEquation() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const ops: Array<string> = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let real: number;
  if (op === "+") real = a + b;
  else if (op === "-") real = a - b;
  else real = a * b;

  const correct = Math.random() < 0.6; // 60% chance the shown result is correct
  let shown = real;
  if (!correct) {
    const delta = Math.floor(Math.random() * 5) + 1;
    shown = Math.random() < 0.5 ? real + delta : real - delta;
    if (shown === real) shown = real + 1;
  }

  return { text: `${a} ${op} ${b} = ${shown}`, correct };
}

export default function Home() {
  const TIME_LIMIT = 3000; // milliseconds
  const [equation, setEquation] = useState(() => makeEquation());
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(true);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // load best score from localStorage (client-only)
    try {
      const raw = localStorage.getItem("calc_best_score");
      if (raw) setBest(Number(raw));
    } catch (e) {
      // ignore (e.g., SSR or privacy settings)
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
  }, [equation.text]);

  function nextEquation() {
    setEquation(makeEquation());
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
          localStorage.setItem("calc_best_score", String(newStreak));
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
    setStreak(0);
    setMessage("");
    setEquation(makeEquation());
  }

  const pct = Math.round((timeLeft / TIME_LIMIT) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl p-8">
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
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
              Correct
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 rounded bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              aria-label="Mark wrong"
            >
              Wrong
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="mr-2 text-sm text-zinc-600 dark:text-zinc-300">Streak</span>
              <span className="text-lg font-bold">{streak}</span>
              <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">Best: {best}</span>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">{Math.ceil(timeLeft / 100)}s</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-zinc-700 dark:text-zinc-300">{message}</div>
            <div>
              <button
                onClick={restart}
                className="rounded bg-zinc-200 px-3 py-1 text-sm hover:bg-zinc-300"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Click the button matching whether the equation is correct. You have 3 seconds per
          equation. Your score is how many correct guesses you make in a row.
        </p>
      </main>
    </div>
  );
}
