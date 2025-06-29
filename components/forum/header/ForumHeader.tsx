"use client"
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ToggleButton, ToggleButtonGroup, Typography, alpha } from '@mui/material';
import Link from "next/link";
import { usePathname } from 'next/navigation';

type ForumHeaderProps = {
  sortBy: string;
  setSortBy: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  createThread?: () => void;
};

export default function ForumHeader({
                                      sortBy,
                                      setSortBy,
                                      categoryFilter,
                                      setCategoryFilter,
                                      createThread
                                    }: ForumHeaderProps) {
  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setCategoryFilter(newCategory);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', gap: 2 }}>

        <ToggleButtonGroup
          value={categoryFilter}
          exclusive
          onChange={handleCategoryChange}
          aria-label="thread type filter"
          size="small"
        >
          <ToggleButton value="ALL" aria-label="all threads">All</ToggleButton>
          <ToggleButton value="QUESTION" aria-label="question threads">Questions</ToggleButton>
          <ToggleButton value="INFO" aria-label="info threads">Infos</ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary"></Typography>
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              minWidth: 120,
              backgroundColor: 'background.paper'
            }}
          >
            <MenuItem value="Latest">Latest</MenuItem>
            <MenuItem value="Oldest">Oldest</MenuItem>
          </Select>
        </Stack>

      </Stack>


        <Button
          variant="contained"
          color="primary"
          onClick={createThread}
        >
          +
        </Button>
    </Box>
  );
}