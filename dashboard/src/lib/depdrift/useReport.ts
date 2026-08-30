import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getReport } from "./reportAdapter";
import type { FixtureId } from "./fixtures";

let currentFixture: FixtureId = "polyglot";
let scanned = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setFixture(id: FixtureId) {
  currentFixture = id;
  emit();
}

export function markScanned() {
  scanned = true;
  emit();
}

export function useFixture() {
  const id = useSyncExternalStore(
    subscribe,
    () => currentFixture,
    () => currentFixture,
  );
  const select = useCallback((next: FixtureId) => setFixture(next), []);
  return [id, select] as const;
}

export function useHasScanned() {
  return useSyncExternalStore(
    subscribe,
    () => scanned,
    () => false,
  );
}

export function useReport() {
  const [fixture] = useFixture();
  return useMemo(() => getReport(fixture), [fixture]);
}
