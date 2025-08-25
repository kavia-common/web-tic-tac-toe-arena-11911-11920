"use client";

import Link from "next/link";

export default function NotFound() {
  /**
   * PUBLIC_INTERFACE
   * A minimal not-found page for the Tic Tac Toe app.
   * Provides navigation back to home and uses the project theme colors.
   */
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-7xl font-extrabold" style={{ color: "var(--color-primary)" }}>
          404
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-secondary)" }}>
          Page not found
        </h1>
        <p className="text-muted">
          The page you are looking for does not exist. Return to the game.
        </p>
        <Link href="/" className="btn btn-primary inline-flex">
          Go Home
        </Link>
      </div>
    </main>
  );
}
