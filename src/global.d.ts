import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    colorBlind: boolean;

    backgroundSecondary: Palette["primary"];
    shade: Palette["primary"];

    assessment: {
      quiz: string;
      flashcardSet: string;
      media: string;
    };
  }

  interface PaletteOptions {
    colorBlind: boolean;

    backgroundSecondary: PaletteOptions["primary"];
    shade: PaletteOptions["primary"];

    assessment: {
      quiz: string;
      flashcardSet: string;
      media: string;
    };
  }
}
