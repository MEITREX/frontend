import "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  export interface PaletteOptions {
    colorBlind: boolean;
    mode: 'light' | 'dark' | 'color-blind';
    backgroundSecondary: SimplePaletteColorOptions;
  }
}
