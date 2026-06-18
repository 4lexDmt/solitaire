import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        baize: {
          center: "var(--baize-center)",
          edge: "var(--baize-edge)",
        },
        card: {
          face: "var(--card-face)",
          "face-edge": "var(--card-face-edge)",
          "back-base": "var(--card-back-base)",
          "back-accent": "var(--card-back-accent)",
          border: "var(--card-border)",
        },
        ink: {
          red: "var(--ink-red)",
          black: "var(--ink-black)",
        },
        placeholder: {
          stroke: "var(--placeholder-stroke)",
          fill: "var(--placeholder-fill)",
        },
        foundation: {
          watermark: "var(--foundation-watermark)",
        },
        highlight: {
          valid: "var(--highlight-valid)",
          invalid: "var(--highlight-invalid)",
        },
        hint: {
          pulse: "var(--hint-pulse)",
        },
        ui: {
          surface: "var(--ui-surface)",
          "surface-2": "var(--ui-surface-2)",
          text: "var(--ui-text)",
          "text-muted": "var(--ui-text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          text: "var(--accent-text)",
        },
      },
      fontFamily: {
        ui: "var(--font-ui)",
        index: "var(--font-index)",
        court: "var(--font-court)",
      },
      fontSize: {
        hud: "var(--text-hud)",
        title: "var(--text-title)",
        button: [
          "var(--text-button-size)",
          { fontWeight: "var(--text-button-weight)" },
        ],
      },
      borderRadius: {
        ui: "var(--ui-radius)",
        card: "var(--card-radius)",
      },
      boxShadow: {
        "card-resting": "var(--elev-card-resting)",
        "card-lifted": "var(--elev-card-lifted)",
        "card-dragging": "var(--elev-card-dragging)",
        modal: "var(--elev-modal)",
      },
      spacing: {
        unit: "var(--space-unit)",
        "board-pad": "var(--board-pad)",
        "gap-x": "var(--gap-x)",
        "row-gap": "var(--row-gap)",
      },
      width: {
        card: "var(--card-w)",
      },
      height: {
        card: "var(--card-h)",
      },
      zIndex: {
        baize: "var(--z-baize)",
        "pile-placeholder": "var(--z-pile-placeholder)",
        "card-base": "var(--z-card-base)",
        "card-lifted": "var(--z-card-lifted)",
        "card-dragging": "var(--z-card-dragging)",
        cascade: "var(--z-cascade)",
        hud: "var(--z-hud)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        decel: "var(--ease-decel)",
        accel: "var(--ease-accel)",
      },
      transitionDuration: {
        flip: "var(--dur-flip)",
        snap: "var(--dur-snap)",
        "deal-card": "var(--dur-deal-card)",
        "hover-lift": "var(--dur-hover-lift)",
        press: "var(--dur-press)",
        "invalid-shake": "var(--dur-invalid-shake)",
        "autocomplete-card": "var(--dur-autocomplete-card)",
      },
    },
  },
  plugins: [],
};

export default config;
