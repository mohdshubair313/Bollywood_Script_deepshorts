interface DialogueBubbleProps {
  character?: string;
  line?: string;
  direction?: string;
  backgroundAudio?: string;
  isAlternate?: boolean;
}

export function DialogueBubble({
  character,
  line,
  direction,
  backgroundAudio,
  isAlternate = false,
}: DialogueBubbleProps) {
  return (
    <div
      className={`flex ${isAlternate ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 border transition-all ${
          isAlternate
            ? "bg-cinema-purple/10 border-cinema-purple/15"
            : "bg-cinema-card border-cinema-card-border"
        }`}
      >
        {character && (
          <span
            className={`text-sm font-semibold ${
              isAlternate
                ? "text-cinema-purple-light"
                : "text-cinema-gold-light"
            }`}
          >
            {character}
          </span>
        )}

        {direction && (
          <span className="block text-xs text-cinema-muted italic mt-0.5">
            ({direction})
          </span>
        )}

        {line && (
          <p className="text-foreground/90 text-base leading-relaxed mt-1">
            {line}
          </p>
        )}

        {backgroundAudio && (
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg glass text-[11px] text-cinema-cyan/90 border border-cinema-cyan/15 animate-pulse-glow">
            <span role="img" aria-label="music">🎵</span>
            {backgroundAudio}
          </span>
        )}
      </div>
    </div>
  );
}
