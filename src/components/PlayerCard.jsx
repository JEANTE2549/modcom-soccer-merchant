import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PriceTicker from "./PriceTicker";

const FRAME_BY_POSITION = {
  FW: "/design/card-fw-template.png",
  MF: "/design/card-mf-template.png",
  DF: "/design/card-df-template.png",
  GK: "/design/card-gk-template.png",
};

// Design baseline: every internal overlay size below was tuned by eye at a
// 160px-wide card. `s` re-expresses that same baseline proportionally for
// whatever cardWidth SquadView's auto-fit picks, so overlays stay in
// proportion to the card itself instead of the root font-size (which is
// what the zoom control drives, and is a different, unrelated axis now).
const BASELINE_CARD_WIDTH = 160;

export default function PlayerCard({ player, price, flag, cardWidth = BASELINE_CARD_WIDTH, onBuy, onCancel }) {
  const frame = FRAME_BY_POSITION[player.position];
  const wasSold = useRef(player.sold);
  const [justSold, setJustSold] = useState(false);
  const s = cardWidth / BASELINE_CARD_WIDTH;

  useEffect(() => {
    const isNewSale = !wasSold.current && player.sold;
    wasSold.current = player.sold;
    if (!isNewSale) return;
    setJustSold(true);
    const t = setTimeout(() => setJustSold(false), 380);
    return () => clearTimeout(t);
  }, [player.sold]);

  return (
    <motion.div
      className="group relative select-none overflow-hidden rounded-2xl"
      style={{ width: cardWidth, aspectRatio: "500 / 707" }}
      whileHover={!player.sold ? { scale: 1.05, y: -4 } : undefined}
      animate={
        justSold
          ? { scale: [1, 1.08, 1], rotate: [0, -3, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{ duration: 0.35 }}
    >
      <img
        src={frame}
        alt={player.position}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        draggable={false}
      />

      {/* hover shine sweep */}
      {!player.sold && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
          <div
            className="absolute top-0 left-[-60%] h-full w-[40%] -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-[400ms] ease-out"
          />
        </div>
      )}

      {/* gold buy-flash */}
      <AnimatePresence>
        {justSold && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
            className="absolute inset-0 z-30 bg-gradient-to-br from-yellow-300/80 via-amber-200/50 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <span
        className={`fi fi-${flag} absolute z-10 rounded shadow ring-1 ring-black/10`}
        style={{ left: "19%", top: "45%", width: "22%", aspectRatio: "4 / 3" }}
      />

      {!player.sold && (
        <div
          className="absolute z-10 inset-x-[8%] top-[57%] flex flex-col items-center"
          style={{ gap: 4 * s }}
        >
          <span
            className="rounded-full bg-emerald-600 font-extrabold text-white shadow-sm"
            style={{ fontSize: 14 * s, padding: `${2 * s}px ${12 * s}px` }}
          >
            <PriceTicker value={price} />
          </span>
        </div>
      )}

      {player.sold ? (
        <motion.div
          initial={{ opacity: 0, scale: 1.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -10 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/10"
          style={{ gap: 8 * s }}
        >
          <span
            className="rounded border-white bg-red-600 font-extrabold tracking-wide text-white shadow-lg"
            style={{
              fontSize: 14 * s,
              padding: `${4 * s}px ${12 * s}px`,
              borderWidth: Math.max(1, 2 * s),
            }}
          >
            SOLD OUT
          </span>
          <button
            onClick={onCancel}
            className="rounded-full bg-white/90 font-bold text-red-600 shadow hover:bg-white active:scale-95 transition"
            style={{ fontSize: 12 * s, padding: `${4 * s}px ${12 * s}px` }}
          >
            ↺ ยกเลิก
          </button>
        </motion.div>
      ) : (
        <button
          onClick={onBuy}
          className="absolute z-10 bottom-[6%] left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 font-bold text-white shadow transition hover:bg-emerald-400 active:scale-95"
          style={{ fontSize: 12 * s, padding: `${6 * s}px ${16 * s}px` }}
        >
          BUY
        </button>
      )}
    </motion.div>
  );
}
