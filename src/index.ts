import { onFrame } from '@amate/on-frame';

const throttlers = new Map<number, ReturnType<typeof createFrameThrottler>>();

export function onFrameThrottled(fps: number, subscriber: FrameRequestCallback, enforceNewThrottler = false) {
  let throttler = throttlers.get(fps);

  if (!throttler || enforceNewThrottler) {
    throttler = createFrameThrottler(
      fps,
      !enforceNewThrottler
        ? () => {
            throttlers.delete(fps);
          }
        : undefined,
    );

    if (!enforceNewThrottler) {
      throttlers.set(fps, throttler);
    }
  }

  const unsubscribe = throttler(subscriber);

  return unsubscribe;
}

function createFrameThrottler(fps: number, onCleanup?: () => void) {
  const subscribers = new Set<FrameRequestCallback>();
  const interval = 1000 / fps;
  // we take into account that the browser might trigger too early
  // the value of 1 (ms) is arbitrary, but should suffice
  const tolerance = 1;

  let previousTime: number | null = null;
  let unsubscribeFrame: ReturnType<typeof onFrame> | null = null;

  function frameCallback(time: DOMHighResTimeStamp) {
    //  invoke the first time
    if (previousTime === null) {
      invokeSubscribers(time);
      previousTime = time;
      return;
    }

    const delta = time - previousTime;

    // invoke if we are past the interval
    if (delta >= interval) {
      previousTime = time - (delta % interval);
      invokeSubscribers(time);
      return;
    }

    // invoke if we are close to the interval
    if (delta >= interval - tolerance) {
      previousTime = time - (delta - interval);
      invokeSubscribers(time);
    }
  }

  function invokeSubscribers(time: DOMHighResTimeStamp) {
    subscribers.forEach((subscriber) => {
      subscriber(time);
    });
  }

  function cleanup() {
    if (unsubscribeFrame) {
      unsubscribeFrame();
    }

    if (onCleanup) {
      onCleanup();
    }
  }

  function subscribe(subscriber: FrameRequestCallback) {
    const shouldStart = subscribers.size === 0;

    subscribers.add(subscriber);

    if (shouldStart) {
      unsubscribeFrame = onFrame(frameCallback);
    }

    function unsubscribe(): boolean {
      if (subscribers.size === 0) {
        return false;
      }

      const result = subscribers.delete(subscriber);

      if (subscribers.size === 0) {
        cleanup();
      }

      return result;
    }

    return unsubscribe;
  }

  return subscribe;
}
