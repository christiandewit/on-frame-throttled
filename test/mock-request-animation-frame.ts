import { vi } from 'vitest';

export function mockRequestAnimationFrame() {
  let isRequested = false;
  let timeoutId: NodeJS.Timeout;
  let rafId = 0;
  let callbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];
  const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.push({ id: rafId++, callback });
    if (isRequested) {
      return rafId;
    }
    isRequested = true;
    const start = Date.now();
    timeoutId = setTimeout(() => {
      isRequested = false;
      const currentCallbacks = callbacks;
      callbacks = [];
      currentCallbacks.forEach((cb) => cb.callback(start + 1000 / 60));
    }, 1000 / 60);
    return rafId;
  });

  const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.splice(
      callbacks.findIndex((cb) => cb.id === id),
      1,
    );
    clearTimeout(timeoutId);
  });

  return { requestAnimationFrame, cancelAnimationFrame };
}
