import { Box } from "@mui/material";

interface ItemInventoryPictureOnlyProps {
  url: string; // encoded URL deines Bildes
  id: string; // ID des Items
}

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
          src={decodeURIComponent(url)}
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
