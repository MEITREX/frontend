import { Box } from "@mui/material";

interface ItemInventoryPictureBackgroundsProps {
  url: string; // encoded URL deines Bildes
  backColor: string;
  foreColor: string;
}

export default function ItemInventoryPictureOnly({
  url,
  backColor,
  foreColor,
}: ItemInventoryPictureBackgroundsProps) {
  return (
    <Box sx={{ p: 1 }}>
      {/* Outer box mit backColor */}
      <Box
        sx={{
          width: "171px",
          height: "171px",
          borderRadius: 2,
          overflow: "hidden",
          backgroundImage: url ? `url(${decodeURIComponent(url)})` : undefined,
          backgroundColor: url ?  undefined : backColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto", // <-- zentriert im Eltern-Container
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
