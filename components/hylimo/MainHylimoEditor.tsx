"use client";

import { Box, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

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


export default function MainHylimoEditor({
  initialValue,
  onChange,
  readOnly = false
}: {
  initialValue: string;
  onChange(value: string): void;
  readOnly?: boolean;
}) {
  return (
    <HylimoEditor
      initialValue={initialValue}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};