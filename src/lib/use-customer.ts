"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  lifeCoins: number;
} | null;

type CustomerState = { customer: CustomerInfo; loaded: boolean };

/**
 * The signed-in customer, shared by every component that needs it.
 *
 * This lives outside React because the nav sits in the root layout and never
 * unmounts: a per-component `useEffect` would fetch once on first page load and
 * never again, so signing in or out left the header stale until a hard reload.
 * Keeping one store means an auth action can push the new state to every
 * consumer at once, and the nav and mobile menu share a single request instead
 * of each firing their own.
 */
const EMPTY: CustomerState = { customer: null, loaded: false };

let state: CustomerState = EMPTY;
const listeners = new Set<() => void>();
let inFlight: Promise<void> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Identity is stable between changes, which is what useSyncExternalStore needs.
function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

function setState(next: CustomerState) {
  state = next;
  emit();
}

/**
 * Re-read the session and notify every consumer. Call after logging in, out, or
 * registering so the header updates immediately rather than on the next reload.
 * Concurrent calls share one request.
 */
export function refreshCustomer(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = fetch("/api/auth/me", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : { customer: null }))
    .then((data) => setState({ customer: data.customer ?? null, loaded: true }))
    .catch(() => setState({ customer: null, loaded: true }))
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Clear the cached session without waiting for a round trip. */
export function clearCustomer() {
  setState({ customer: null, loaded: true });
}

export function useCustomer() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pathname = usePathname();

  // Re-validate on navigation so an expired or externally-ended session doesn't
  // leave a stale name in the header.
  useEffect(() => {
    refreshCustomer();
  }, [pathname]);

  return snapshot;
}
