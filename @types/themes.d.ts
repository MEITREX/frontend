import '@mui/material/styles';
import { PaletteMode as MuiPaletteMode } from '@mui/material'

type ExtendedPaletteMode = MuiPaletteMode | 'colorBlind';

declare module '@mui/material/styles' {
  interface Palette {
    mode: ExtendedPaletteMode;
  }

  interface PaletteOptions {
    mode?: ExtendedPaletteMode;
  }
}
