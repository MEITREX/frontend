import { Box } from "@mui/material";

interface ItemInventoryPictureOnlyProps {
  url: string | null; // encoded URL deines Bildes
  id: string; // ID des Items
}

// Picture in list card if tutor, profile picture of frame
export default function ItemInventoryPictureOnly({
  url,
  id,
}: ItemInventoryPictureOnlyProps) {
  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          border: "3px solid #000",
          borderRadius: 2,
          overflow: "hidden",
          aspectRatio: "1 / 1",
          backgroundColor: "#fff",
        }}
      >
        <img
          src={decodeURIComponent(url ? url : id)}
          alt={id}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
}
