import { Component } from "react";
import { STORAGE_KEY } from "../lib/useSoccerDashboard";

// Catches render/lifecycle errors anywhere below it (e.g. a corrupted
// localStorage save that slips past validation, or an unrelated bug) and
// shows a themed, recoverable fallback instead of a blank white screen.
// This matters at the live event: whoever is running the kiosk needs a
// button that gets them back to a working app without touching devtools.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep this — it's the only trace of what broke once the fallback UI
    // is showing, useful if the organizer needs to report the bug later.
    console.error("Soccer Merchant crashed:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable — reload alone still gets us to a fresh state
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/95 rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center gap-5 text-center">
          <span className="text-5xl">⚠️</span>
          <h1 className="text-2xl font-extrabold text-gray-800">
            เกิดข้อผิดพลาดบางอย่าง
          </h1>
          <p className="text-base text-gray-600">
            แอปเจอปัญหาที่ทำให้แสดงผลต่อไม่ได้ ลองโหลดหน้าใหม่ก่อน — ข้อมูล
            การซื้อขายที่บันทึกไว้จะยังอยู่เหมือนเดิม
          </p>

          <button
            onClick={this.handleReload}
            className="w-full text-lg font-bold text-white bg-amber-500 hover:bg-amber-600 transition rounded-full px-6 py-3 shadow"
          >
            โหลดใหม่
          </button>

          <button
            onClick={this.handleResetData}
            className="w-full text-sm font-semibold text-gray-500 hover:text-red-600 transition underline underline-offset-2"
          >
            ถ้าโหลดใหม่แล้วยังไม่หาย — ล้างข้อมูลแล้วเริ่มใหม่
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
