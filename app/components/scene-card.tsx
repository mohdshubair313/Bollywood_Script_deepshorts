import { DialogueBubble } from "./dialogue-bubble";

interface Dialogue {
  character?: string;
  line?: string;
  direction?: string;
  backgroundAudio?: string;
}

interface Trope {
  name?: string;
  sceneNumber?: number;
  description?: string;
}

interface SceneCardProps {
  sceneNumber: number;
  title?: string;
  setting?: string;
  stageCue?: string;
  dialogues: (Dialogue | undefined)[];
  tropes?: (Trope | undefined)[];
}

export function SceneCard({
  sceneNumber,
  title,
  setting,
  stageCue,
  dialogues,
  tropes,
}: SceneCardProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-4">
        <span className="text-cinema-gold text-sm font-mono font-bold">
          SCENE {sceneNumber}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-cinema-gold/30 via-cinema-gold/10 to-transparent" />
      </div>

      <div className="glass rounded-2xl p-6 space-y-5 border border-cinema-card-border">
        {title && (
          <h4 className="font-display font-semibold text-xl text-foreground">
            {title}
          </h4>
        )}

        {setting && (
          <p className="text-sm text-foreground/60 italic">{setting}</p>
        )}

        {stageCue && (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm text-cinema-gold-light/90 border border-cinema-gold/15 animate-pulse-glow">
            <span className="text-base" role="img" aria-label="clapper">🎬</span>
            {stageCue}
          </span>
        )}

        {tropes && tropes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tropes.map((trope, i) =>
              trope ? (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cinema-purple/10 border border-cinema-purple/15 text-[11px] text-cinema-purple-light/90 animate-fade-in"
                >
                  <span>🎭</span>
                  {trope.name}
                </span>
              ) : null
            )}
          </div>
        )}

        <div className="space-y-3 pt-2">
          {dialogues.map((dialogue, i) =>
            dialogue ? (
              <DialogueBubble
                key={i}
                character={dialogue.character}
                line={dialogue.line}
                direction={dialogue.direction}
                backgroundAudio={dialogue.backgroundAudio}
                isAlternate={i % 2 === 1}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
