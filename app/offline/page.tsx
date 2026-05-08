"use client";

import { WifiOff, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-8 animate-pulse">
          <WifiOff className="h-10 w-10 text-slate-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-slate-400 leading-relaxed mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry —
          your test progress is saved locally. Reconnect and try again.
        </p>

        {/* Tips */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm font-medium text-slate-300 mb-3">Quick tips:</p>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Check your Wi-Fi or mobile data connection
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Try moving to an area with better signal
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Turn airplane mode on and off
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
