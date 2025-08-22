import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import Lottery from "@/components/lottery/Lottery";

export default function ItemWidget() {

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 1,
        mb: 2,
        maxWidth: 450,
        maxHeight: 400,
        minHeight: 400,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography mt={1} ml={1} variant="h6">
          Lottery
        </Typography>
        <Link href="/items/lottery" passHref>
          <Button
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "#009bde",
              color: "white",
              "&:hover": {
                backgroundColor: "#3369ad",
              },
            }}
          >
            Items
          </Button>
        </Link>
      </Box>
      <Lottery/>
    </Box>
  );
}