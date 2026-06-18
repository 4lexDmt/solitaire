/// <reference lib="webworker" />

import { solve, type SolverRequest, type SolverResponse } from './solver';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<SolverRequest>) => {
  const { seed, drawCount, maxNodes, maxTimeMs } = event.data;
  const result: SolverResponse = solve({ seed, drawCount, maxNodes, maxTimeMs });
  self.postMessage(result);
};

export {};
