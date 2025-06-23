'use client';

import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import ThreadItem from './ThreadItem';
import Link from 'next/link';

export default function ThreadList({ threads }) {
  const pathname = usePathname();


  return (
    <Box sx={{ overflowY: 'scroll', p: 1 }}>
      {threads.map((thread) => (
        <Link key={thread.id} href={`${pathname}/${thread.id}`} passHref>
          <ThreadItem thread={thread} />
        </Link>
      ))}
    </Box>
  );
}