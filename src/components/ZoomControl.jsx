export default function ZoomControl({ scale, zoomIn, zoomOut, minScale, maxScale }) {
  return (
    <div className="flex items-center gap-1 bg-white/90 rounded-full shadow-lg px-1 py-1">
      <button
        onClick={zoomOut}
        disabled={scale <= minScale}
        className="w-8 h-8 rounded-full font-bold text-gray-700 hover:bg-gray-100 active:scale-90 transition disabled:opacity-30 disabled:hover:bg-transparent"
      >
        −
      </button>
      <button
        onClick={zoomIn}
        disabled={scale >= maxScale}
        className="w-8 h-8 rounded-full font-bold text-gray-700 hover:bg-gray-100 active:scale-90 transition disabled:opacity-30 disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  );
}
