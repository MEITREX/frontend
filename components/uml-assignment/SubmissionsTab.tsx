import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import StudentRow from "./StudentRow";

export default function SubmissionsTab({ exercise }: any) {
  const submissions = exercise?.studentSubmissions || [];

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell width={50} align="center" />
            <TableCell align="center">
              <strong>Student</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Last Submission</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Attempts</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Latest Score</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((sub: any) => (
            <StudentRow key={sub.studentId} sub={sub} exercise={exercise} />
          ))}
          {submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">
                  No activity recorded yet.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
