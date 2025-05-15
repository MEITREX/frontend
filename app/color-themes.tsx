import { colors } from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    success: colors.green,
  },
  typography: {
    h1: {
      fontSize: "2rem",
      fontWeight: "400",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: "400",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    success: colors.green,
  }
})

export const colorBlidndTheme = createTheme({
  palette: {
    mode: "colorBlind"
  },
});
