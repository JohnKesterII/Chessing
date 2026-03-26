export const BOARD_THEMES = {
  midnight: {
    name: "Midnight",
    light: "#2a3d54",
    dark: "#132233",
    border: "#1d3145"
  },
  ember: {
    name: "Ember",
    light: "#68493d",
    dark: "#2b1d1a",
    border: "#472f29"
  },
  slate: {
    name: "Slate",
    light: "#72859a",
    dark: "#233140",
    border: "#324557"
  }
} as const;

export const PIECE_THEMES = {
  classic: "Classic",
  neon: "Neon"
} as const;
