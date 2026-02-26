export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎱 Snooker Club Manager
        </h1>
        <p className="text-slate-400 mb-8">
          Professional Club Management System
        </p>
        <a
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Login to Dashboard
        </a>
      </div>
    </main>
  );
}
