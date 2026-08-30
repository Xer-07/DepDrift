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

const getSnapshot = () => currentFixture;
const getServerSnapshot = () => "polyglot";

export function useFixture() {
  const id = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const select = useCallback((next: FixtureId) => setFixture(next), []);
  return [id, select] as const;
}

const getScannedSnapshot = () => scanned;
const getScannedServerSnapshot = () => false;

export function useHasScanned() {
  return useSyncExternalStore(
    subscribe,
    getScannedSnapshot,
    getScannedServerSnapshot,
  );
}

export function useReport() {
  const [fixture] = useFixture();
  return getReport(fixture);
}
