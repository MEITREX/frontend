import React from 'react';
import { Box, Skeleton } from '@mui/material';

const SingleWidgetSkeleton = () => {
  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 1,
        width: 450,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" sx={{ mt: 1, ml: 1, fontSize: '1.25rem' }} width="45%" />
        <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
      </Box>

      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    </Box>
  );
};

const WidgetsSkeleton = () => {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 3,
        position: 'relative'
      }}
    >
      <Skeleton
        variant="circular"
        width={24}
        height={24}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 450px)",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        <SingleWidgetSkeleton />
        <SingleWidgetSkeleton />
      </Box>
    </Box>
  );
};

export default WidgetsSkeleton;