import { useEffect, useState } from "react";
import { COUNTRY_META } from "../data/countryMeta";
import { currentPrice, remainingCount } from "../lib/pricing";
import { useUiScale } from "../lib/useUiScale";
import ZoomControl from "../components/ZoomControl";

export default function CountrySelect({ state, onSelect }) {
  const uiScale = useUiScale();
  const [bottomReserve, setBottomReserve] = useState(84);

  useEffect(() => {
    function recalc() {
      // The white "MODCOM CUP" banner is baked into bg-main.png, ~84px tall at a 1080px-tall viewport.
      const reserve = (84 / 1080) * window.innerHeight;
      setBottomReserve(reserve);
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  return (
    <div
      className="h-screen w-full overflow-hidden bg-cover bg-center flex flex-col items-center"
      style={{ 
        backgroundImage: "url(/design/bg-main.png)",
        paddingTop: "100px", // Reserve space for the top-left KMUTT logo
        paddingBottom: bottomReserve // Reserve space for the bottom banner
      }}
    >
      <div className="fixed top-6 right-6 z-50">
        <ZoomControl {...uiScale} />
      </div>

      {/* This inner container scrolls safely between the top and bottom graphics */}
      <div className="w-full flex-1 overflow-y-auto flex flex-col items-center">
        <div 
          className="my-auto w-full flex flex-col items-center gap-16 py-12"
          style={{ zoom: uiScale.scale }}
        >
          <h1 className="text-8xl font-extrabold text-white drop-shadow-lg tracking-wide text-center">
            Soccer Merchant
          </h1>

          <div className="grid grid-cols-5 gap-10 px-8">
        {Object.entries(COUNTRY_META).map(([code, meta]) => {
          const roster = state[code];
          const remaining = remainingCount(roster);
          const sold = roster.length - remaining;
          const price = currentPrice(roster);

          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="flex flex-col items-center gap-4 bg-white/90 hover:bg-white hover:scale-105 transition rounded-2xl px-10 py-8 shadow-lg"
            >
              <span
                className={`fi fi-${meta.flag} rounded shadow`}
                style={{ width: "7rem", aspectRatio: "4 / 3" }}
              />
              <span className="text-3xl font-semibold text-gray-800">{meta.label}</span>

              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className="text-2xl font-extrabold text-white bg-amber-500 rounded-full px-5 py-1 shadow">
                  ราคา {price}
                </span>
                <span className="text-lg font-semibold text-emerald-700">
                  ซื้อได้ {remaining} คน
                </span>
                <span className="text-base font-medium text-gray-500">
                  ขายไปแล้ว {sold} คน
                </span>
              </div>
            </button>
          );
        })}
      </div>
      </div>
      </div>
    </div>
  );
}
