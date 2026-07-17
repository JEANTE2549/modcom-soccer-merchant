import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PriceTicker({ value }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value === display) return;
    const start = display;
    const end = value;
    const duration = 350;
    const startTime = performance.now();

    let frame;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.round(start + (end - start) * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1.15, 1] }}
      transition={{ duration: 0.25 }}
      className="tabular-nums font-bold"
    >
      ${display}
    </motion.span>
  );
}
