import { useState } from "react";
import CountrySelect from "./pages/CountrySelect";
import SquadView from "./pages/SquadView";
import { useSoccerDashboard } from "./lib/useSoccerDashboard";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { state, buy, cancel, reset } = useSoccerDashboard();
  const [country, setCountry] = useState(null);

  if (!country) {
    return <CountrySelect state={state} onSelect={setCountry} />;
  }

  return (
    <SquadView
      country={country}
      roster={state[country]}
      onBuy={() => { console.log('Read-only: Data synced from Google Sheet'); }}
      onCancel={() => { console.log('Read-only: Data synced from Google Sheet'); }}
      onReset={() => { console.log('Read-only: Data synced from Google Sheet'); }}
      onBack={() => setCountry(null)}
    />
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
