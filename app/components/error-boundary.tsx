"use client";

interface ErrorBoundaryProps {
  message?: string;
  onRetry?: () => void;
}

const ERROR_MESSAGES = [
  "Interval! Something went wrong...",
  "The projector broke down! Let's try again.",
  "The villain cut the power! Hit retry.",
  "Climax scene needs a retake!",
  "The film reel got tangled!",
];

export function ErrorBoundary({ message, onRetry }: ErrorBoundaryProps) {
  const heading =
    ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];

  return (
    <div className="glass rounded-2xl p-8 text-center space-y-4 border border-cinema-crimson/20 animate-fade-in">
      <span className="text-4xl" role="img" aria-label="popcorn">
        🍿
      </span>
      <h3 className="text-lg font-display font-semibold text-cinema-crimson-light">
        {heading}
      </h3>
      {message && (
        <p className="text-sm text-cinema-muted max-w-md mx-auto">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-xl bg-cinema-gold/15 text-cinema-gold-light border border-cinema-gold/25 hover:bg-cinema-gold/25 transition-all text-sm font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
}
