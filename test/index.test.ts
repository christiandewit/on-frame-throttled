import { expect, test, vi } from 'vitest';
import { onFrameThrottled } from '../src/index';
import { mockRequestAnimationFrame } from './mock-request-animation-frame';

test('Return value', () => {
  const fn = vi.fn();

  const unsubscribe = onFrameThrottled(60, fn);

  expect(unsubscribe).toEqual(expect.any(Function));

  unsubscribe();
});

test('Return value of unsubscribe() after first invocation', () => {
  const fn = vi.fn();

  const unsubscribe = onFrameThrottled(60, fn);

  const result = unsubscribe();

  expect(result).toEqual(true);
});

test('Return value of unsubscribe() after second invocation', () => {
  const fn = vi.fn();

  const unsubscribe = onFrameThrottled(60, fn);

  unsubscribe();
  const result = unsubscribe();

  expect(result).toEqual(false);
});

test('Throttling at 30fps invokes the function 30 times in a second', () => {
  vi.useFakeTimers();

  const { requestAnimationFrame, cancelAnimationFrame } = mockRequestAnimationFrame();

  const fn = vi.fn();

  const fps = 30;
  const unsubscribe = onFrameThrottled(fps, fn);

  vi.advanceTimersByTime(1000);

  unsubscribe();

  vi.useRealTimers();
  requestAnimationFrame.mockRestore();
  cancelAnimationFrame.mockRestore();

  expect(fn).toHaveBeenCalledTimes(fps);
});

test('Throttling at 10fps invokes the function 10 times in a second', () => {
  vi.useFakeTimers();

  const { requestAnimationFrame, cancelAnimationFrame } = mockRequestAnimationFrame();

  const fn = vi.fn();

  const fps = 10;
  const unsubscribe = onFrameThrottled(fps, fn);

  vi.advanceTimersByTime(1000);

  unsubscribe();

  vi.useRealTimers();
  requestAnimationFrame.mockRestore();
  cancelAnimationFrame.mockRestore();

  expect(fn).toHaveBeenCalledTimes(fps);
});
