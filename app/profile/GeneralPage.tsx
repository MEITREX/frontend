import AutorenewIcon from "@mui/icons-material/Autorenew";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Avatar, Box, Button, IconButton, TextField } from "@mui/material";
import { useState } from "react";

interface GeneralPageProps {
  studentData: {
    id: string;
    firstName: string;
    lastName: string;
    //email: string;
    userName: string;
  };
}

export default function GeneralPage({ studentData }: GeneralPageProps) {
  const [editMode, setEditMode] = useState(false);

  const [newStudentData, setStudentData] = useState(studentData);

  const handleChange =
    (field: keyof typeof studentData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStudentData({ ...newStudentData, [field]: e.target.value });
    };

  const toggleEditMode = () => {
    if (editMode) {
      // Optional: hier speichern (API call etc.)
      console.log(newStudentData);
    }
    setEditMode(!editMode);
  };

  const adjectives = [
    "Swift",
    "Brave",
    "Clever",
    "Fierce",
    "Tiny",
    "Giant",
    "Happy",
    "Wild",
    "Cunning",
    "Lazy",
  ];

  const dinos = [
    "T-Rex",
    "Velociraptor",
    "Triceratops",
    "Stegosaurus",
    "Spinosaurus",
    "Brachiosaurus",
    "Pachycephalosaurus",
    "Ankylosaurus",
  ];

  function generateRandomNickname() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const dino = dinos[Math.floor(Math.random() * dinos.length)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4-stellige Zahl

    return `${adj}${dino}${number}`;
  }

  return (
    <Box display="flex" gap={4} py={4}>
      {/* Profilbild-Platzhalter */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Avatar
          sx={{
            width: 120,
            height: 120,
            fontSize: 40,
          }}
        >
          {studentData.firstName.charAt(0)}
        </Avatar>
        <Box mt={1} color="text.secondary">
          Profile picture
        </Box>
        <Button
          onClick={toggleEditMode}
          sx={{ mt: 2 }}
          variant={editMode ? "contained" : "outlined"}
          color={editMode ? "warning" : "primary"}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
      </Box>

      {/* Eingabefelder */}
      <Box flex={1} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="First Name"
          value={newStudentData.firstName}
          onChange={handleChange("firstName")}
          fullWidth
          disabled={!editMode}
        />
        <TextField
          label="Last Name"
          value={newStudentData.lastName}
          onChange={handleChange("lastName")}
          fullWidth
          disabled={!editMode}
        />
        {/*
        <TextField
          label="Email"
          value={'N.A.'}
          onChange={handleChange("email")}
          fullWidth
          disabled={!editMode}
        />
         */}
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Nickname"
            value={newStudentData.userName}
            onChange={handleChange("userName")}
            fullWidth
            disabled={!editMode}
          />
          {editMode && (
            <IconButton
              onClick={() =>
                setStudentData((prev) => ({
                  ...prev,
                  userName: generateRandomNickname(),
                }))
              }
              size="large"
            >
              <AutorenewIcon sx={{ fontSize: 28, color: "#00a9d6" }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
