import { useEffect, useRef, useState } from 'react';
import { HOUSE_POSTER, HouseRenderer, loadHouse } from './renderer.js';

/**
 * The night photo with its roofline lit by `look`. With `intro` the lights
 * come on in a wave the first time the house is seen; `power` switches them
 * on and off. Rendering pauses whenever the canvas is off-screen.
 */
export default function HouseCanvas({
  look = 'warm',
  power = true,
  intro = false,
  introDelay = 350,
  options,
  className = '',
  onLit,
}) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const propsRef = useRef({ power, intro, introDelay, onLit });
  propsRef.current = { power, intro, introDelay, onLit };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new HouseRenderer(canvas, options);
    rendererRef.current = renderer;
    renderer.setLook(look, -Infinity);
    let raf = 0;
    let visible = false;
    let started = false;
    let alive = true;

    const frame = (now) => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      // Full rate while something moves, half rate for the gentle idle shimmer.
      if (renderer.busy(now) || renderer.frames % 2 === 0) renderer.render(now);
      else renderer.frames += 1;
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (started || !renderer.assets || !visible) return;
      started = true;
      const { power: on, intro: sweep, introDelay: delay, onLit: lit } = propsRef.current;
      if (!on) {
        wake();
        return;
      }
      if (sweep && !renderer.reduced) {
        setTimeout(() => {
          if (!alive) return;
          renderer.turnOn(performance.now(), { sweep: true });
          lit?.();
          wake();
        }, delay);
      } else {
        renderer.powerFrom = 1;
        renderer.powerTo = 1;
        lit?.();
      }
      wake();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
      if (renderer.assets) renderer.render(performance.now());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          start();
          wake();
        }
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(canvas);

    const onVisibility = () => wake();
    document.addEventListener('visibilitychange', onVisibility);

    loadHouse()
      .then((assets) => {
        if (!alive) return;
        renderer.setAssets(assets);
        resize();
        start();
        wake();
      })
      .catch(() => alive && setFailed(true));

    renderer.wake = wake;
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // The renderer lives for the component's lifetime; props flow in below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setLook(look, performance.now());
    renderer.wake?.();
  }, [look]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !renderer.assets) return;
    const now = performance.now();
    if (power && !renderer.on) renderer.turnOn(now, { sweep: true });
    if (!power && renderer.on) renderer.turnOff(now);
    renderer.wake?.();
  }, [power]);

  if (failed) {
    return <img src={HOUSE_POSTER} alt="" className={`${className} object-cover`} />;
  }
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
