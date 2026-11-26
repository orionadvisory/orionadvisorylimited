/**
 * A tiny store the auth forms write to and the night-sky canvas reads from, so typing
 * literally connects the constellation. Kept outside React so the canvas loop can read
 * it every frame without re-rendering anything.
 */
export type SkyMood = "idle" | "pending" | "error" | "success";

export interface SkyState {
  /** 0..1, how much of the form is validly filled in. */
  progress: number;
  mood: SkyMood;
  /** performance.now() when the mood last changed, for one-shot effects. */
  moodAt: number;
}

let state: SkyState = { progress: 0, mood: "idle", moodAt: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const SERVER_STATE: SkyState = { progress: 0, mood: "idle", moodAt: 0 };

export const sky = {
  get: (): SkyState => state,
  getServer: (): SkyState => SERVER_STATE,
  /** For useSyncExternalStore: React bits (like the counter) re-render on change. */
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setProgress(progress: number) {
    const next = Math.min(1, Math.max(0, progress));
    if (next === state.progress) return;
    state = { ...state, progress: next };
    emit();
  },
  setMood(mood: SkyMood) {
    if (mood === state.mood) return;
    state = { ...state, mood, moodAt: performance.now() };
    emit();
  },
  reset() {
    state = { progress: 0, mood: "idle", moodAt: performance.now() };
    emit();
  },
};
