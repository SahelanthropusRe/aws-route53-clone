import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MissingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* UFO SVG with a subtle hover/bounce animation */}
      <div className="mb-8 text-aws-blue dark:text-blue-400 animate-[bounce_3s_infinite] transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* UFO Dome */}
          <path d="M15.3 8.2A5.5 5.5 0 0 0 8.7 8.2" />
          {/* UFO Body */}
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          {/* Lights */}
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="7" cy="12" r="1" />
          <circle cx="17" cy="12" r="1" />
          {/* Beam/Thrusters */}
          <path d="M10 15.5l-2 4" />
          <path d="M14 15.5l2 4" />
          {/* Antenna */}
          <path d="M12 4V2" />
          <circle cx="12" cy="2" r="1" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-aws-text dark:text-white mb-2 transition-colors">
        Feature Coming Soon
      </h1>
      <p className="text-sm text-aws-muted dark:text-gray-400 max-w-md mx-auto mb-8 transition-colors">
        We're still building this sector of the AWS console. Our alien engineers are working hard to bring this feature to you soon!
      </p>

      <Link
        href="/dashboard"
        className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-aws-orange text-white rounded font-bold hover:bg-aws-orangeHover transition-colors w-fit mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}