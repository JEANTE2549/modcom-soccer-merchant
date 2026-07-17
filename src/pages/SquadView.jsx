import { useEffect, useRef, useState } from "react";
import { COUNTRY_META } from "../data/countryMeta";
import { currentPrice, isCountrySoldOut, BASE_PRICE } from "../lib/pricing";
import { useUiScale } from "../lib/useUiScale";
import ZoomControl from "../components/ZoomControl";
import PlayerCard from "../components/PlayerCard";

const ROW_ORDER = ["FW", "MF", "DF", "GK"];

// --- Auto-fit layout constants -------------------------------------------
// These are fixed px (NOT rem/Tailwind-scale) on purpose: the zoom control
// (useUiScale) drives root font-size, which would otherwise make these
// paddings/gaps grow with zoom and quietly re-introduce the 1080p overflow
// bug. Card size is the single knob that adapts; these stay constant so the
// math below is deterministic at every zoom level and viewport size.
const PAGE_TOP_PADDING = 12;
const PAGE_HORIZONTAL_PADDING = 24;
const HEADER_TO_FIELD_GAP = 12;
const ROW_GAP = 10;
const CARD_GAP = 14;
const FIELD_BOTTOM_PADDING = 8;
const CARD_ASPECT_H_OVER_W = 707 / 500; // matches the card frame art, do not change
const MIN_CARD_WIDTH = 90;
const MAX_CARD_WIDTH = 320;
// The white "MODCOM CUP" banner is baked into bg-main.png, ~84px tall at a
// 1080px-tall viewport. bg-cover scales the image with the viewport, so we
// scale the reserved space the same way instead of hardcoding 84.
const BOTTOM_BANNER_PX_AT_1080 = 84;

export default function SquadView({ country, roster, onBuy, onCancel, onReset, onBack }) {
  const meta = COUNTRY_META[country];
  const price = currentPrice(roster);
  const soldOut = isCountrySoldOut(roster);
  const uiScale = useUiScale();
  const headerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(160);
  const [bottomReserve, setBottomReserve] = useState(BOTTOM_BANNER_PX_AT_1080);

  const rows = ROW_ORDER.map((position) => ({
    position,
    players: roster.filter((p) => p.position === position),
  }));
  const widestRowCount = Math.max(...rows.map((r) => r.players.length));

  // Recompute the card size that lets all 4 rows fit the viewport with no
  // scroll. Driven by a ResizeObserver on the header (its height changes
  // with zoom, asynchronously, via useUiScale's own effect) plus a window
  // resize listener (covers F11 fullscreen / monitor changes) rather than
  // depending on uiScale.scale directly, since we can't rely on effect
  // ordering between this component and useUiScale's font-size effect.
  useEffect(() => {
    function recalc() {
      const headerHeight = headerRef.current
        ? headerRef.current.getBoundingClientRect().height
        : 0;
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const bannerReserve = (BOTTOM_BANNER_PX_AT_1080 / 1080) * viewportH;

      const availableHeight =
        viewportH -
        PAGE_TOP_PADDING -
        headerHeight -
        HEADER_TO_FIELD_GAP -
        ROW_GAP * (ROW_ORDER.length - 1) -
        FIELD_BOTTOM_PADDING -
        bannerReserve;
      const availableWidth =
        viewportW - PAGE_HORIZONTAL_PADDING * 2 - CARD_GAP * (widestRowCount - 1);
      const widthFromWidth = availableWidth / widestRowCount;

      // Now that we have a safe scrolling window, we no longer need to forcefully shrink
      // the cards to fit the vertical height. We can prioritize a "normal" comfortable size (180px).
      const idealBaseWidth = Math.min(180, widthFromWidth);
      setCardWidth(Math.max(MIN_CARD_WIDTH, idealBaseWidth) * uiScale.scale);
      setBottomReserve(bannerReserve);
    }

    recalc();
    const ro = new ResizeObserver(recalc);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [widestRowCount, uiScale.scale]); // Add uiScale.scale as a dependency

  function handleReset() {
    const confirmed = window.confirm(
      `รีเซ็ต ${meta.label}? การกระทำนี้จะล้างการขายทั้งหมดและคืนการ์ดทั้ง ${roster.length} ใบกลับไปที่ราคาเริ่มต้น ${BASE_PRICE}`
    );
    if (confirmed) onReset();
  }

  return (
    <div
      className="h-screen w-full overflow-hidden bg-cover bg-center flex flex-col items-center"
      style={{
        backgroundImage: "url(/design/bg-main.png)",
        paddingTop: PAGE_TOP_PADDING,
        paddingBottom: bottomReserve + FIELD_BOTTOM_PADDING,
      }}
    >
      <div className="w-full flex-1 overflow-y-auto flex flex-col items-center px-[24px]">
        <div ref={headerRef} className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4 pt-6 pb-2">
          <div className="w-full flex items-center justify-between px-4 sm:px-8">
            <button
              onClick={onBack}
              className="bg-white hover:bg-gray-100 active:scale-95 transition rounded-full px-5 py-2.5 font-bold shadow-xl flex items-center gap-2 text-gray-800"
            >
              <span className="text-xl leading-none">←</span> Back
            </button>

            <div className="flex items-center gap-3">
              <ZoomControl {...uiScale} />
              <button
                onClick={handleReset}
                className="bg-white hover:bg-red-50 active:scale-95 transition rounded-full px-5 py-2.5 font-bold shadow-xl text-red-600"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 bg-black/40 backdrop-blur-sm border border-white/10 px-8 py-3.5 rounded-full shadow-2xl">
            <span className={`fi fi-${meta.flag} text-4xl rounded-sm shadow-md`} />
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-wider">
              {meta.label}
            </h1>
            <div className="hidden sm:block w-1 h-8 bg-white/20 rounded-full mx-2" />
            <span className="bg-amber-500 text-white font-extrabold px-5 py-2 rounded-full shadow-lg text-xl tracking-wide">
              ราคาปัจจุบัน {price}
            </span>
            {soldOut && (
              <span className="bg-red-600 text-white font-extrabold px-4 py-2 rounded-full shadow-lg tracking-wider">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        <div
          className="flex flex-col items-center min-h-0"
          style={{ marginTop: HEADER_TO_FIELD_GAP, gap: ROW_GAP }}
        >
        {rows.map(({ position, players }) => (
          <div
            key={position}
            className="flex flex-wrap justify-center"
            style={{ gap: CARD_GAP }}
          >
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                price={price}
                flag={meta.flag}
                cardWidth={cardWidth}
                onBuy={() => onBuy(country, player.id)}
                onCancel={() => onCancel(player.id)}
              />
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
