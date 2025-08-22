import Lottery from "@/components/lottery/Lottery";
import { Box } from "@mui/material";

export default function LotteryWidget() {
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
        <Lottery/>
      </Box>
  );
}