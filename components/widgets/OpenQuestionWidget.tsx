import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import Link from "next/link";



export default function OpenQuestionWidget(){

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 4,
        maxWidth: 450,
        maxHeight: 400,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Open Question</Typography>
        <Link href="/profile" passHref>
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
            Forum
          </Button>
        </Link>
      </Box>
      <Grid container spacing={2}>
      </Grid>
    </Box>
  );
}
