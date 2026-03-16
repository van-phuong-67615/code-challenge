import SwapCard from "./components/SwapCard";

function App() {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,180,160,0.12) 0%, transparent 70%), #0d1117",
      }}
    >
      {/* Heading */}
      <h1
        className="text-center font-bold tracking-tight mb-10 text-white"
        style={{
          fontSize: "clamp(2rem, 6vw, 3.75rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}
      >
        Fancy Swap
      </h1>

      {/* Swap Card */}
      <SwapCard />
    </div>
  );
}

export default App;
