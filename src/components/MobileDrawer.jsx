import React from 'react';
import { useAuthStore } from '../hooks';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';

export default function MobileDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const menuItems = [
    { text: 'Cuotas', icon: <PaymentIcon />, to: '/student/fees' },
    { text: 'Rutina', icon: <FitnessCenterIcon />, to: '/student/routine' },
    { text: 'Info personal', icon: <PersonIcon />, to: '/student/profile' },
  ];

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
        {/* Nombre del alumno */}
        {user?.name && (
          <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.name}</span>
          </Box>
        )}
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.to)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          {/* Botón de salir */}
          <ListItem button onClick={logout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
