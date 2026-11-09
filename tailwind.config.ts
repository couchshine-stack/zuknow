import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        zk: {
          blue: "#163A8C",
          navy: "#0B1F4A",
          ink: "#10233F",
          orange: "#FF6A1A",
          ember: "#F05A12",
          sand: "#FFF6EE",
          mist: "#F3F6FF",
          line: "#E6EAF4",
        },
      },
      boxShadow: {
        lift: "0 18px 50px -24px rgba(11, 31, 74, 0.35)",
        glass: "0 10px 40px -18px rgba(22, 58, 140, 0.28)",
        "apple-card": "0 2px 10px -2px rgba(15, 23, 42, 0.04), 0 10px 24px -4px rgba(15, 23, 42, 0.06)",
        "apple-hover": "0 12px 32px -4px rgba(15, 23, 42, 0.10), 0 20px 48px -8px rgba(15, 23, 42, 0.08)",
        "apple-glass": "0 8px 32px 0 rgba(15, 23, 42, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
        "apple-subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 4px 12px 0 rgba(0, 0, 0, 0.03)",
      },
      backgroundImage: {
        "zk-hero":
          "radial-gradient(1200px 420px at 10% -10%, rgba(255,106,26,0.18), transparent 50%), radial-gradient(900px 380px at 90% 0%, rgba(22,58,140,0.16), transparent 55%)",
        "zk-hero-navy":
          "radial-gradient(900px 520px at 92% -18%, rgba(255,106,26,0.38), transparent 52%), radial-gradient(700px 420px at -8% 110%, rgba(56,189,248,0.18), transparent 55%), linear-gradient(165deg, #0B1F4A 0%, #163A8C 72%)",
      },
      keyframes: {
        streak: {
          "0%": { transform: "translateX(-12%)", opacity: "0.15" },
          "50%": { opacity: "0.55" },
          "100%": { transform: "translateX(12%)", opacity: "0.15" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        streak: "streak 2.8s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
