import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

// One animation loop for the whole page: smooth wheel scrolling on desktop
// (Lenis) and scroll-linked effects, which get called only when the scroll
// position or the layout changes.

const listeners = new Set();
let lenis = null;
let started = false;
let dirty = true;

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startMotion() {
  if (started) return;
  started = true;
  if (!reducedMotion() && window.matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: false });
  }
  let lastY = -1;
  let lastH = -1;
  const frame = (time) => {
    lenis?.raf(time);
    const y = window.scrollY;
    const h = window.innerHeight;
    if (dirty || y !== lastY || h !== lastH) {
      dirty = false;
      lastY = y;
      lastH = h;
      listeners.forEach((fn) => fn(y, h));
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  new ResizeObserver(() => {
    dirty = true;
  }).observe(document.body);
}

/** Calls `fn(scrollY, viewportHeight)` whenever either changes. */
export function useScrollFrame(fn, deps = []) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const call = (y, h) => ref.current(y, h);
    listeners.add(call);
    dirty = true;
    return () => listeners.delete(call);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** How far a tall section has scrolled past the top of the viewport, 0..1. */
export function stickyProgress(element, viewportHeight) {
  const rect = element.getBoundingClientRect();
  const span = rect.height - viewportHeight;
  if (span <= 0) return rect.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -rect.top / span));
}

/** Progress of an element through the viewport, 0 entering … 1 leaving. */
export function passProgress(element, viewportHeight, { from = 1, to = 0 } = {}) {
  const rect = element.getBoundingClientRect();
  const start = viewportHeight * from;
  const end = viewportHeight * to - rect.height;
  return Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
}

export function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/** Freezes the page behind an open menu or dialog. */
export function lockScroll(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

export function scrollToY(top, duration = 1.4) {
  if (lenis) lenis.scrollTo(top, { duration });
  else window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

export function scrollToTop() {
  scrollToY(0, 1.6);
}

/** Adds `is-in` to the element once it scrolls into view. */
export function useInView(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: options.rootMargin ?? '0px 0px -8% 0px', threshold: options.threshold ?? 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
