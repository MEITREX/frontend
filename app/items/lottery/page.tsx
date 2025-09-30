import Lottery from "@/components/lottery/Lottery";
import { Box } from "@mui/material";

export default function LotteryPage() {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 3,
        backgroundColor: "background.paper",
        boxShadow: 1,
        padding: 4,
      }}
    >
      <Lottery />
    </Box>
  );
}
