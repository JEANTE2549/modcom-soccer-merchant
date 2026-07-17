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
      const cardHeightMax = availableHeight / ROW_ORDER.length;
      const widthFromHeight = cardHeightMax / CARD_ASPECT_H_OVER_W;

      const availableWidth =
        viewportW - PAGE_HORIZONTAL_PADDING * 2 - CARD_GAP * (widestRowCount - 1);
      const widthFromWidth = availableWidth / widestRowCount;

      const next = Math.floor(Math.min(widthFromHeight, widthFromWidth, MAX_CARD_WIDTH));
      setCardWidth(Math.max(MIN_CARD_WIDTH, next));
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
  }, [widestRowCount]);

  function handleReset() {
    const confirmed = window.confirm(
      `รีเซ็ต ${meta.label}? การกระทำนี้จะล้างการขายทั้งหมดและคืนการ์ดทั้ง ${roster.length} ใบกลับไปที่ราคาเริ่มต้น ${BASE_PRICE}`
    );
    if (confirmed) onReset();
  }

  return (
    <div
      className="h-screen w-full overflow-hidden bg-cover bg-center bg-fixed flex flex-col items-center"
      style={{
        backgroundImage: "url(/design/bg-main.png)",
        paddingTop: PAGE_TOP_PADDING,
        paddingLeft: PAGE_HORIZONTAL_PADDING,
        paddingRight: PAGE_HORIZONTAL_PADDING,
        paddingBottom: bottomReserve + FIELD_BOTTOM_PADDING,
      }}
    >
      <div ref={headerRef} className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-100 active:scale-95 transition rounded-full px-4 py-2 font-semibold shadow-lg"
          >
            ← Back
          </button>
          <span className={`fi fi-${meta.flag} text-2xl rounded shadow`} />
          <h1 className="text-2xl font-extrabold text-white drop-shadow-lg">
            {meta.label}
          </h1>
          {soldOut && (
            <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full shadow">
              SQUAD SOLD OUT
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ZoomControl {...uiScale} />
          <span className="bg-amber-500 text-white font-extrabold px-4 py-2 rounded-full shadow-lg text-base">
            ราคาปัจจุบัน {price}
          </span>
          <button
            onClick={handleReset}
            className="bg-white hover:bg-gray-100 active:scale-95 transition rounded-full px-4 py-2 font-semibold shadow-lg text-red-600"
          >
            ↺ Reset country
          </button>
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
  );
}
