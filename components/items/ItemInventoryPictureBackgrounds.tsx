import { Box } from "@mui/material";

interface ItemInventoryPictureBackgroundsProps {
  url: string | null;
  backColor: string | null;
  foreColor: string | null;
}

// Picture in list card if background, so we have foreground color and background color or picture
export default function ItemInventoryPictureOnly({
  url,
  backColor,
  foreColor,
}: ItemInventoryPictureBackgroundsProps) {
  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          width: "171px",
          height: "171px",
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
            width: "130px",
            height: "130px",
          }}
        />
      </Box>
    </Box>
  );
}
