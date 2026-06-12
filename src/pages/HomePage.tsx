import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ShortenForm } from "../components/ShortenForm";

export function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-gray-900 text-lg"
          >
            <span className="text-indigo-600">✂</span>
            Scissor
          </Link>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            Shorten. Share. <span className="text-indigo-600">Analyze.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
            Paste a long URL, get a short link in under a second — with
            real-time analytics on every click.
          </p>
        </div>

        <ShortenForm />

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: "⚡",
              title: "Instant shortening",
              desc: "Get a short link in under a second with collision-safe 6-char slugs.",
            },
            {
              icon: "📊",
              title: "Real-time analytics",
              desc: "Track clicks, referrers, countries, and devices as they happen.",
            },
            {
              icon: "🎨",
              title: "Custom QR codes",
              desc: "Generate branded QR codes with your colors and logo. Download SVG or PNG.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
