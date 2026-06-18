export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-ui text-title font-semibold text-ui-text">You&apos;re offline</h1>
      <p className="max-w-sm font-ui text-hud text-ui-text-muted">
        Solitaire works offline once installed. Reconnect to sync cloud stats, or keep
        playing your saved game when you return.
      </p>
    </main>
  );
}
