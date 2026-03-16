import React from "react";
import SwapCard from "./components/SwapCard";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0d1117", paper: "#161b26" },
    primary: { main: "#7c3aed" },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1c2030",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "rgba(124,58,237,0.12)" },
          "&.Mui-selected": { backgroundColor: "rgba(124,58,237,0.2)" },
          "&.Mui-selected:hover": { backgroundColor: "rgba(124,58,237,0.28)" },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
          Swap anytime, anywhere.
        </h1>

        {/* Swap Card */}
        <SwapCard />
      </div>
    </ThemeProvider>
  );
}

export default App;
