import React from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import themeConfig from "./config";

const theme = createTheme({
  palette: {
    primary: { main: themeConfig.primaryColor },
    secondary: { main: themeConfig.secondaryColor },
    background: { default: themeConfig.backgroundColor },
    text: { primary: themeConfig.textColor },
  },
  typography: {
    fontFamily: themeConfig.fontFamily,
  },
});

export default function ThemeProvider({ children }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
