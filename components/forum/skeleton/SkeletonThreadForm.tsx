'use client';

import { Box, Skeleton, Stack } from '@mui/material';

export default function SkeletonThreadForm() {
  return (
    <>
      <Skeleton variant="text" sx={{ width: 100, height: 40, mb: 2 }} />
      <Box
        sx={{
          backgroundColor: '#f5f7fa',
          borderRadius: 2,
          maxWidth: "800px",
          mx: "auto",
          px: 2,
          py: 2,
        }}
      >
        <Skeleton variant="text" sx={{ width: '60%', fontSize: '2rem', mb: 2 }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
        <Box mb={2}>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={120} height={32} />
          </Stack>
        </Box>
        <Stack spacing={3}>
          <Skeleton variant="rounded" animation="wave" height={56} />
          <Skeleton variant="rounded" animation="wave" height={200} />
          <Skeleton variant="rounded" animation="wave" height={48} sx={{ width: '150px' }} />
        </Stack>
      </Box>
    </>
  );
}