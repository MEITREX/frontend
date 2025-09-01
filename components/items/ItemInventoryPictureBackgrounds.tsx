import { Box } from "@mui/material";

interface ItemInventoryPictureBackgroundsProps {
  url: string | null;
  backColor: string | null;
  foreColor: string | null;
  ratio?: string;
}

// Picture in list card if background, so we have foreground color and background color or picture
export default function ItemInventoryPictureOnly({
  url,
  backColor,
  foreColor,
  ratio = "1 / 1",
}: ItemInventoryPictureBackgroundsProps) {
  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          aspectRatio: ratio,
          borderRadius: 2,
          overflow: "hidden",
          backgroundImage: url ? `url(${decodeURIComponent(url)})` : undefined,
          backgroundColor: url ? undefined : backColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
        }}
      >
        <Box
          sx={{
            backgroundColor: foreColor,
            borderRadius: 2,
            width: "70%",
            height: "70%",
          }}
        />
      </Box>
    </Box>
  );
}
