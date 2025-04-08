import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext"; // Import ThemeProvider

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}