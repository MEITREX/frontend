'use client';

import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import ThreadItem from './ThreadItem';
import Link from 'next/link';
import { Typography } from "@mui/material";

export default function ThreadList({ threads }) {
  const pathname = usePathname();

  if(threads.length === 0){
    return (
      <Typography
        variant="caption"
        sx={{
          p: 2,
          fontStyle: 'italic',
          color: 'text.secondary',
        }}
      >
        There are currently no Threads
      </Typography>
    )
  }

  return (
    <Box sx={{ overflowY: 'auto', p: 1 }}>
      {threads.map((thread) => (
        <Link key={thread.id} href={`${pathname}/${thread.id}`} passHref>
          <ThreadItem thread={thread} />
        </Link>
      ))}
    </Box>
  );
}