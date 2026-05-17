interface MoviePosterCardProps {
  title?: string;
  tagline?: string;
  genre?: string;
  mood?: string;
}

export function MoviePosterCard({
  title,
  tagline,
  genre,
  mood,
}: MoviePosterCardProps) {
  return (
    <div className="glass-strong rounded-2xl p-8 text-center space-y-5 animate-slide-up gradient-border relative overflow-hidden">
      <div className="absolute inset-0 shimmer-bg opacity-30 pointer-events-none" />

      {title && (
        <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text leading-tight">
          {title}
        </h2>
      )}

      {tagline && (
        <p className="text-lg md:text-xl text-cinema-gold-light/70 italic font-light max-w-2xl mx-auto animate-fade-in">
          &ldquo;{tagline}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        {genre && (
          <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-cinema-gold/10 text-cinema-gold border border-cinema-gold/20">
            {genre}
          </span>
        )}
        {mood && (
          <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-cinema-purple-light/10 text-cinema-purple-light border border-cinema-purple-light/20">
            {mood}
          </span>
        )}
      </div>
    </div>
  );
}
