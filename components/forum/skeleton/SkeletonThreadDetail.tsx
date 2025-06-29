'use client';

import { Box, Skeleton, Stack, Divider } from '@mui/material';

const PostItemSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
    <Skeleton variant="circular" width={40} height={40} animation="wave" />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="25%" sx={{ mb: 1 }} animation="wave" />
      <Skeleton variant="text" width="90%" animation="wave" />
      <Skeleton variant="text" width="70%" animation="wave" />
    </Box>
  </Box>
);

export default function ThreadDetailSkeleton() {
  return (
    <>
      <Skeleton variant="text" width={100} height={40} sx={{ mb: 2 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 1,
          pt: 1,
          backgroundColor: '#fff',
          borderRadius: 2,
        }}
      >
        <Stack sx={{ backgroundColor: '#f5f7fa', borderRadius: 2, p: 2 }} direction="row" spacing={2}>
          <Stack alignItems="center" spacing={0.5}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={20} height={20} />
            <Skeleton variant="circular" width={24} height={24} />
          </Stack>
          <Box flex={1}>
            <Skeleton variant="text" sx={{ fontSize: '2rem' }} width="70%" />
            <Box sx={{ my: 2 }}>
              <Skeleton variant="rectangular" height={60} />
            </Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="text" width={180} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
              </Stack>
            </Stack>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box>
          {Array.from({ length: 3 }).map((_, index) => (
            <PostItemSkeleton key={index} />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{py: 1}}>
          <Skeleton variant="text" width={100} height={40} />
        </Box>

      </Box>
    </>
  );
}