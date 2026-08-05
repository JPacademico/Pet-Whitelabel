// Artificial latency so loading states are actually exercised during development — without this,
// skeletons and disabled-while-submitting states never render locally and break on first real
// integration with a backend. See IMPLEMENTATION_PLAN.md §3.6.
const MIN_MS = 150;
const MAX_MS = 350;

export function simulatedLatency(): Promise<void> {
  const ms = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
