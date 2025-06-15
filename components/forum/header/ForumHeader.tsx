"use client"
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { usePathname } from 'next/navigation';


export default function ForumHeader() {
  const pathname = usePathname();
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f5f7fa",
        borderRadius: 2,
        mb: 3,
        gap: 2,
      }}
    >
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        alignItems="center"
        sx={{ flexGrow: 1, minWidth: 250 }}
      >
        <TextField
          size="small"
          placeholder="Search Threads"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <Select size="small" defaultValue="" displayEmpty sx={{ minWidth: 150 }}>
          <MenuItem value="Latest">
            <em>Latest</em>
          </MenuItem>
          <MenuItem value="Oldest">Oldest</MenuItem>
          <MenuItem value="Rating">Rating</MenuItem>
        </Select>

      </Stack>

        <Link href={`${pathname}/new`} passHref>
          <Button component="a" variant="contained" color="primary" size="medium">
            + Create Thread
          </Button>
        </Link>
    </Box>
  );
}
