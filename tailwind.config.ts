import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          void: "#05060f",
          deep: "#0a0d1f",
          nebula1: "#3b1d6e",
          nebula2: "#1d3a8a",
          nebula3: "#0a1f4f"
        },
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff2bd6",
          gold: "#ffd166",
          violet: "#a855f7"
        }
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"]
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)",
        "neon-magenta":
          "0 0 20px rgba(255, 43, 214, 0.5), 0 0 40px rgba(255, 43, 214, 0.3)",
        "neon-gold":
          "0 0 20px rgba(255, 209, 102, 0.6), 0 0 40px rgba(255, 209, 102, 0.4)"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.3)" }
        },
        slowSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -10px)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        slowSpin: "slowSpin 60s linear infinite",
        drift: "drift 15s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
