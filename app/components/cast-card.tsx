interface Character {
  name?: string;
  role?: string;
  description?: string;
  quirk?: string;
}

interface CastCardProps {
  characters: (Character | undefined)[];
}

export function CastCard({ characters }: CastCardProps) {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-xl font-display font-semibold text-cinema-gold-light">
        Starring
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char, i) =>
          char ? (
            <div
              key={i}
              className="glass rounded-xl p-5 border border-cinema-card-border hover:border-cinema-gold/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,168,67,0.15)] space-y-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-foreground text-lg">
                  {char.name}
                </h4>
                {char.role && (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-cinema-gold/10 text-cinema-gold border border-cinema-gold/20">
                    {char.role}
                  </span>
                )}
              </div>

              {char.description && (
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {char.description}
                </p>
              )}

              {char.quirk && (
                <div className="pt-1 border-t border-cinema-card-border">
                  <span className="text-xs text-cinema-cyan italic">
                    &ldquo;{char.quirk}&rdquo;
                  </span>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
