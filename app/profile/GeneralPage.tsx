import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Avatar, Box, Button, TextField } from "@mui/material";
import { useState } from "react";

interface GeneralPageProps {
  studentData: {
    firstName: string;
    lastName: string;
    email: string;
    nickname: string;
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
        <TextField
          label="Email"
          value={newStudentData.email}
          onChange={handleChange("email")}
          fullWidth
          disabled={!editMode}
        />
        <TextField
          label="Nickname"
          value={newStudentData.nickname}
          onChange={handleChange("nickname")}
          fullWidth
          disabled={!editMode}
        />
      </Box>
    </Box>
  );
}
