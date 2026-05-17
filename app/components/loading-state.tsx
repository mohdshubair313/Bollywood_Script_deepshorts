"use client";

const AGENTS = [
  {
    id: "title" as const,
    label: "Title Architect",
    icon: "🎬",
    messages: [
      "Crafting the perfect Bollywood title...",
      "Brewing a dramatic tagline...",
      "Nailing the genre & mood...",
    ],
  },
  {
    id: "cast" as const,
    label: "Casting Director",
    icon: "🎭",
    messages: [
      "Auditioning larger-than-life characters...",
      "Giving everyone a dramatic backstory...",
      "Adding signature quirks & catchphrases...",
    ],
  },
  {
    id: "screenplay" as const,
    label: "Screenplay Writer",
    icon: "📝",
    messages: [
      "Setting the scene with cinematic flair...",
      "Writing melodramatic dialogues...",
      "Adding background violins & thunder...",
      "Choreographing the climax...",
      "Polishing the final cut...",
    ],
  },
];

interface LoadingStateProps {
  phase: "title" | "cast" | "screenplay";
}

export function LoadingState({ phase }: LoadingStateProps) {
  const currentIndex = AGENTS.findIndex((a) => a.id === phase);
  const isTitleDone = currentIndex > 0;
  const isCastDone = currentIndex > 1;

  return (
    <div className="glass rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full border-2 border-cinema-gold/30 border-t-cinema-gold animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cinema-gold-light">
            {AGENTS[currentIndex].messages[0]}
          </p>
          <p className="text-xs text-cinema-muted mt-0.5">
            Agent {currentIndex + 1} of {AGENTS.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1">
          <div className="flex-1 h-1.5 rounded-full bg-cinema-gold/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cinema-gold to-cinema-gold-light animate-pulse"
              style={{
                width: isTitleDone ? "100%" : phase === "title" ? "45%" : "0%",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-cinema-gold/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cinema-purple-light to-cinema-cyan"
              style={{
                width: isCastDone ? "100%" : phase === "cast" ? "45%" : "0%",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-cinema-gold/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cinema-cyan to-cinema-gold-light"
              style={{
                width: phase === "screenplay" ? "45%" : "0%",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {AGENTS.map((agent, i) => {
            const isActive = i === currentIndex;
            const isCompleted = i < currentIndex;
            return (
              <div
                key={agent.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                  isActive
                    ? "bg-cinema-gold/8 border border-cinema-gold/15"
                    : isCompleted
                      ? "bg-white/[0.02]"
                      : "opacity-40"
                }`}
              >
                <span className="text-lg shrink-0">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-cinema-gold-light"
                        : isCompleted
                          ? "text-foreground/60"
                          : "text-cinema-muted"
                    }`}
                  >
                    {agent.label}
                  </p>
                </div>
                <span className="shrink-0">
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isActive ? (
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cinema-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cinema-gold animate-bounce" style={{ animationDelay: "200ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cinema-gold animate-bounce" style={{ animationDelay: "400ms" }} />
                    </span>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cinema-muted/40" />
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
