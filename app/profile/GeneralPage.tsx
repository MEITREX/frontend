import { GeneralPageSetNicknameMutation } from "@/__generated__/GeneralPageSetNicknameMutation.graphql";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Avatar, Box, Button, IconButton, TextField } from "@mui/material";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";

interface GeneralPageProps {
  studentData: {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    nickname: string;
  };
}

export default function GeneralPage({ studentData }: GeneralPageProps) {
  const [editMode, setEditMode] = useState(false);

  const [newStudentData, setStudentData] = useState(studentData);

  const [GeneralPageSetNicknameMutation] =
    useMutation<GeneralPageSetNicknameMutation>(graphql`
      mutation GeneralPageSetNicknameMutation($nickname: String!) {
        setNickname(nickname: $nickname) {
          nickname
        }
      }
    `);

  const handleChange =
    (field: keyof typeof studentData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStudentData({ ...newStudentData, [field]: e.target.value });
    };

  const toggleEditMode = () => {
    if (editMode) {
      // Optional: hier speichern (API call etc.)
      console.log(newStudentData);
      GeneralPageSetNicknameMutation({
        variables: {
          nickname: newStudentData.nickname,
        },
        onError() {
          console.log("Error setting nickname");
        },
        onCompleted() {
          console.log("Set nickname successfully");
        },
      });
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
      {/* Eingabefelder */}
      <Box flex={1} display="flex" flexDirection="column" gap={2}>
        <Button
          onClick={toggleEditMode}
          sx={{ mt: 2 }}
          variant={editMode ? "contained" : "outlined"}
          color={editMode ? "warning" : "primary"}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
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
          label="Username"
          value={newStudentData.userName}
          onChange={handleChange("userName")}
          fullWidth
          disabled={!editMode}
        />
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Nickname"
            value={newStudentData.nickname}
            onChange={handleChange("nickname")}
            fullWidth
            disabled={!editMode}
          />
          {editMode && (
            <IconButton
              onClick={() =>
                setStudentData((prev) => ({
                  ...prev,
                  nickname: generateRandomNickname(),
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
