import type { SolverRequest, SolverResponse } from './solver';

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (typeof window === 'undefined') {
    throw new Error('Solver worker is only available in the browser');
  }

  if (!workerPromise) {
    workerPromise = import('./solver.worker').then(
      () => new Worker(new URL('./solver.worker.ts', import.meta.url)),
    );
  }

  return workerPromise;
}

/** Code-split solver: worker loads on first winnability check. */
export async function solveInWorker(
  request: SolverRequest,
): Promise<SolverResponse> {
  const worker = await getWorker();

  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<SolverResponse>) => {
      worker.removeEventListener('message', onMessage);
      resolve(event.data);
    };

    const onError = (event: ErrorEvent) => {
      worker.removeEventListener('error', onError);
      reject(event.error ?? new Error(event.message));
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage(request);
  });
}

export function terminateSolverWorker(): void {
  void workerPromise?.then((worker) => worker.terminate());
  workerPromise = null;
}
