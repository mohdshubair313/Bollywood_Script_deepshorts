import { ScriptGenerator } from "@/app/components/script-generator";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-cinema-gold/[0.02] to-transparent pointer-events-none" />

      <header className="relative text-center pt-14 pb-2 px-4">
        <div className="flex items-center justify-center gap-2 text-cinema-gold/30 text-xs font-mono tracking-[0.3em] uppercase mb-4">
          <span className="w-8 h-px bg-cinema-gold/20" />
          AI Cinema Studio
          <span className="w-8 h-px bg-cinema-gold/20" />
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text leading-tight">
          BollyScript
        </h1>

        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="w-12 h-px bg-gradient-to-r from-transparent via-cinema-gold/30 to-transparent" />
          <span className="text-cinema-gold/40 text-xs">✦</span>
          <span className="w-12 h-px bg-gradient-to-r from-transparent via-cinema-gold/30 to-transparent" />
        </div>

        <p className="mt-4 text-sm md:text-base text-cinema-muted max-w-lg mx-auto leading-relaxed">
          Turn mundane real-life situations into over-the-top{" "}
          <span className="text-cinema-gold-light font-medium">Bollywood</span>{" "}
          movie scripts. Enter a situation and watch the AI craft a full dramatic
          screenplay.
        </p>
      </header>

      <main className="flex-1 relative">
        <ScriptGenerator />
      </main>

      <footer className="relative text-center py-6 text-xs text-cinema-muted/30 font-mono tracking-wider">
        <span className="w-16 h-px bg-cinema-gold/10 mx-auto mb-3" />
        Powered by Groq &middot; No dialogue is too dramatic
      </footer>
    </div>
  );
}
