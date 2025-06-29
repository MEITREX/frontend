'use client';

import { Box, Skeleton, Stack } from '@mui/material';

export default function ThreadItemSkeleton() {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 1,
        backgroundColor: '#fff',
      }}
    >
      <Stack direction="row" spacing={2}>
        <Stack alignItems="center" spacing={0.5} sx={{ color: 'grey.400' }}>
          <Skeleton variant="circular" width={24} height={24} animation="wave" />
          <Skeleton variant="text" width={20} height={20} animation="wave" />
          <Skeleton variant="circular" width={24} height={24} animation="wave" />
        </Stack>

        <Stack sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '70%' }} animation="wave" />

          <Skeleton variant="text" sx={{ width: '90%', mt: 0.5 }} animation="wave" />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Skeleton variant="text" width={180} height={20} animation="wave" />

            <Stack direction="row" spacing={1}>
              <Skeleton variant="circular" width={22} height={22} animation="wave" />
              <Skeleton variant="circular" width={22} height={22} animation="wave" />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}