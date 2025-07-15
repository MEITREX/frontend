import "@mui/material/styles";

// Had to use the `~A` suffixes since overwriting the types doesn't seem to be possible...
declare module "@mui/material/styles" {
  interface Palette {
    colorBlind: boolean;

    primaryA: {
      0: string;
      10: string;
      20: string;
      30: string;
      40: string;
      50: string;
    };
    secondaryA: string,
    surfaceA: {
      0: string;
      10: string;
      20: string;
      30: string;
      40: string;
      50: string;
    };

    assessment: {
      quiz: string;
      flashcardSet: string;
      media: string;
    };
  }

  interface PaletteOptions {
    colorBlind: boolean;

    primaryA: {
      0: string;
      10: string;
      20: string;
      30: string;
      40: string;
      50: string;
    };
    secondaryA: string,
    surfaceA: {
      0: string;
      10: string;
      20: string;
      30: string;
      40: string;
      50: string;
    };

    assessment: {
      quiz: string;
      flashcardSet: string;
      media: string;
    };
  }
}
