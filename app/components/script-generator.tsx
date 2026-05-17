"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { BollywoodScriptSchema } from "@/lib/schemas";
import { LoadingState } from "./loading-state";
import { MoviePosterCard } from "./movie-poster-card";
import { CastCard } from "./cast-card";
import { SceneCard } from "./scene-card";
import { ErrorBoundary } from "./error-boundary";

type AgentPhase = "title" | "cast" | "screenplay";

export function ScriptGenerator() {
  const [situation, setSituation] = useState("");
  const [status, setStatus] = useState<
    "idle" | "generating" | "streaming" | "done"
  >("idle");
  const [agentPhase, setAgentPhase] = useState<AgentPhase>("title");
  const submitTimeRef = useRef<number | null>(null);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/generate",
    schema: BollywoodScriptSchema,
  });

  const handleSubmit = useCallback(() => {
    const trimmed = situation.trim();
    if (trimmed.length < 3) return;
    submitTimeRef.current = Date.now();
    setAgentPhase("title");
    setStatus("generating");
    submit({ situation: trimmed });
  }, [situation, submit]);

  const handleRetry = useCallback(() => {
    const trimmed = situation.trim();
    if (trimmed.length < 3) return;
    submitTimeRef.current = Date.now();
    setAgentPhase("title");
    setStatus("generating");
    submit({ situation: trimmed });
  }, [situation, submit]);

  useEffect(() => {
    if (status !== "generating" || submitTimeRef.current === null) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - submitTimeRef.current!;
      if (elapsed < 2000) setAgentPhase("title");
      else if (elapsed < 4000) setAgentPhase("cast");
      else setAgentPhase("screenplay");
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "generating" && object?.title) {
      setStatus("streaming");
    }
  }, [object, status]);

  useEffect(() => {
    if (status === "streaming" && !isLoading && object) {
      setStatus("done");
    }
  }, [isLoading, object, status]);

  const canSubmit = situation.trim().length >= 3 && !isLoading;
  const charCount = situation.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="glass rounded-2xl p-6 space-y-4 animate-fade-in">
        <label
          htmlFor="situation"
          className="block text-sm font-medium text-cinema-gold-light uppercase tracking-widest"
        >
          Describe a mundane situation
        </label>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder='e.g., "Two friends fighting over a coffee cup"'
          rows={3}
          maxLength={500}
          className="w-full bg-black/30 border border-cinema-card-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-cinema-muted/40 focus:outline-none focus:border-cinema-gold/50 focus:ring-1 focus:ring-cinema-gold/30 resize-none transition-all text-base"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-cinema-muted">
            {charCount}
            <span className="text-cinema-muted/50"> / 500</span>
          </span>
          <div className="flex gap-3">
            {isLoading && (
              <button
                onClick={stop}
                className="px-5 py-2 rounded-xl bg-cinema-crimson/15 text-cinema-crimson-light border border-cinema-crimson/25 hover:bg-cinema-crimson/25 transition-all text-sm font-medium"
              >
                Stop
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 rounded-xl bg-cinema-gold/15 text-cinema-gold-light border border-cinema-gold/25 hover:bg-cinema-gold/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              {isLoading ? "Generating..." : "Generate Script"}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBoundary message={error.message} onRetry={handleRetry} />}

      {status === "generating" && <LoadingState phase={agentPhase} />}

      {(status === "streaming" || status === "done") && object && (
        <div className="space-y-8 animate-fade-in">
          {object.title && (
            <MoviePosterCard
              title={object.title}
              tagline={object.tagline}
              genre={object.genre}
              mood={object.mood}
            />
          )}

          {object.cast && object.cast.length > 0 && (
            <CastCard characters={object.cast} />
          )}

          {object.scenes && object.scenes.length > 0 && (
            <div className="space-y-8">
              {object.scenes.map((scene, i) =>
                scene ? (
                  <SceneCard
                    key={i}
                    sceneNumber={scene.sceneNumber ?? i + 1}
                    title={scene.title}
                    setting={scene.setting}
                    stageCue={scene.stageCue}
                    dialogues={scene.dialogues ?? []}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
