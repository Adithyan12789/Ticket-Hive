import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography,
} from '@mui/material';
import { Block, LockOpen } from '@mui/icons-material';
import './UserTable.css'; // Custom CSS

// Define the type for the user object
interface User {
  _id: string;
  name: string;
  email: string;
  phone: number;
  blocked: boolean; // Added blocked status field
}

// Define the props for the UserTable component
interface UserTableProps {
  users: User[]; // Expecting an array of users
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  // Local state to manage block/unblock for each user
  const [userStatus, setUserStatus] = useState(users);

  // Toggle block/unblock status
  const handleBlockToggle = (id: string) => {
    setUserStatus((prevStatus) =>
      prevStatus.map((user) =>
        user._id === id ? { ...user, blocked: !user.blocked } : user
      )
    );
  };

  return (
    <TableContainer component={Paper} className="table-container">
      <Table>
        <TableHead className="table-header">
          <TableRow>
            <TableCell className="table-header-cell">Name</TableCell>
            <TableCell className="table-header-cell">Email</TableCell>
            <TableCell className="table-header-cell">Phone</TableCell>
            <TableCell align="center" className="table-header-cell">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userStatus.map((user) => (
            <TableRow key={user._id} className="table-row ">
              <TableCell className="table-cell">{user.name}</TableCell>
              <TableCell className="table-cell">{user.email}</TableCell>
              <TableCell className="table-cell">{user.phone}</TableCell>
              <TableCell align="center" className="actions-cell">
                <Button
                  variant="contained"
                  color={user.blocked ? "success" : "error"} // Green for unblock, red for block
                  className="action-button"
                  onClick={() => handleBlockToggle(user._id)}
                  sx={{
                    borderRadius: '4px', // Box shape
                    padding: '6px 12px', // Adjust padding for better button size
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.blocked ? <LockOpen sx={{ mr: 1 }} /> : <Block sx={{ mr: 1 }} />}
                  <Typography variant="button" sx={{ ml: 1 }}>
                    {user.blocked ? 'Unblock' : 'Block'}
                  </Typography>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
