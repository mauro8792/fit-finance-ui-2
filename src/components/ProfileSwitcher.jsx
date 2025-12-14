import { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckIcon from '@mui/icons-material/Check';
import { useAuthStore } from '../hooks/useAuthStore';

const ProfileSwitcher = () => {
  const { 
    hasMultipleProfiles, 
    activeProfile, 
    profiles,
    selectProfile,
    switchUserProfile,
  } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  // Check robusto: tiene perfil dual si hasMultipleProfiles O si tiene ambos profiles
  const hasDualProfile = hasMultipleProfiles || (profiles?.coach && profiles?.student);

  // Solo mostrar si tiene múltiples perfiles
  if (!hasDualProfile) {
    return null;
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectProfile = (profile) => {
    if (profile !== activeProfile) {
      selectProfile(profile, true); // Guardar preferencia
    }
    handleClose();
  };

  const currentProfileLabel = activeProfile === 'coach' ? 'Coach' : 'Alumno';
  const currentProfileIcon = activeProfile === 'coach' ? (
    <GroupsIcon sx={{ fontSize: 20 }} />
  ) : (
    <FitnessCenterIcon sx={{ fontSize: 20 }} />
  );

  return (
    <Box>
      <Tooltip title={`Perfil: ${currentProfileLabel} (click para cambiar)`}>
        <IconButton
          onClick={handleClick}
          sx={{
            bgcolor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 2,
            px: 1.5,
            gap: 1,
            '&:hover': {
              bgcolor: 'rgba(255, 152, 0, 0.2)',
            },
          }}
        >
          {currentProfileIcon}
          <Typography
            variant="caption"
            sx={{
              color: '#ff9800',
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {currentProfileLabel}
          </Typography>
          <SwapHorizIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Cambiar perfil
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Opción Coach */}
        <MenuItem
          onClick={() => handleSelectProfile('coach')}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(255, 152, 0, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <GroupsIcon sx={{ color: activeProfile === 'coach' ? '#ff9800' : 'rgba(255,255,255,0.7)' }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ color: activeProfile === 'coach' ? '#ff9800' : '#fff' }}>
                🏋️ Coach
              </Typography>
            }
            secondary={
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {profiles?.coach?.studentsCount || 0} alumnos
              </Typography>
            }
          />
          {activeProfile === 'coach' && (
            <CheckIcon sx={{ color: '#ff9800', ml: 1 }} />
          )}
        </MenuItem>

        {/* Opción Student */}
        <MenuItem
          onClick={() => handleSelectProfile('student')}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(76, 175, 80, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <FitnessCenterIcon sx={{ color: activeProfile === 'student' ? '#4caf50' : 'rgba(255,255,255,0.7)' }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ color: activeProfile === 'student' ? '#4caf50' : '#fff' }}>
                📱 Mi Entreno
              </Typography>
            }
            secondary={
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Perfil personal
              </Typography>
            }
          />
          {activeProfile === 'student' && (
            <CheckIcon sx={{ color: '#4caf50', ml: 1 }} />
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileSwitcher;


