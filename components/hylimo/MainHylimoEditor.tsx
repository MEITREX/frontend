"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

const HylimoEditor = dynamic(() => import('../../components/hylimo/HylimoEditor'), {
  ssr: false,
  loading: () =>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '450px'
      }}
    >
      <CircularProgress />
    </Box>
});


export default function MainHylimoEditor ()  {


  return (
    <HylimoEditor/>
  );
};

