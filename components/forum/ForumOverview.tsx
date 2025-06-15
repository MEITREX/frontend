import ThreadList from "@/components/forum/thread/ThreadList";
import ForumHeader from "@/components/forum/header/ForumHeader";
import { Box } from "@mui/material";

export default function ForumOverview() {

  return (
    <>
      <Box
          sx={{
            height: '78vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        <ForumHeader></ForumHeader>
        <ThreadList></ThreadList>
      </Box>
    </>
  );
}
