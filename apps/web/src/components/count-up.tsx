"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

export function CountUp({
  value,
  duration = 0.6,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const sessionKey = `countup_${value}`;
    const already = window.sessionStorage.getItem(sessionKey) === "1";

    if (reduced || already || !inView) {
      if (ref.current) ref.current.textContent = String(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = String(Math.round(latest));
        }
      },
      onComplete: () => {
        if (ref.current) ref.current.textContent = String(value);
        window.sessionStorage.setItem(sessionKey, "1");
      },
    });
    return () => controls.stop();
  }, [value, duration, inView, reduced, motionValue]);

  return <span ref={ref}>{value}</span>;
}
