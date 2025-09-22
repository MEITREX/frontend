import { Box, Stack } from "@mui/material";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";

type Properties = {
  postToReplyContent: string,
}

export default function PostReply({ postToReplyContent }: Properties) {

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "#2196f3",
        borderRadius: 2,
        p: 1.5,
        mb: 0.5,
        backgroundColor: "#e3f2fd",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <SubdirectoryArrowRightIcon fontSize="small" color="action" />
        <Box
          sx={{
            height: '1.5em',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            width: '100%',
          }}
        >
          <ContentViewer htmlContent={postToReplyContent} />
        </Box>
      </Stack>
    </Box>
  );
}