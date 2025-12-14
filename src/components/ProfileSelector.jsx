import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Fade,
  Avatar,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuthStore } from '../hooks/useAuthStore';

const ProfileSelector = () => {
  const { user, profiles, selectProfile } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    // Pequeño delay para mostrar la animación de selección
    setTimeout(() => {
      selectProfile(profile, true); // Siempre guardar
    }, 300);
  };

  const firstName = user?.fullName?.split(' ')[0] || user?.fullName || 'Usuario';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
        p: 2,
      }}
    >
      <Fade in timeout={500}>
        <Box
          sx={{
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#ff9800',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#fff',
                mb: 1,
              }}
            >
              👋 Hola {firstName}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
              }}
            >
              ¿Cómo querés ingresar hoy?
            </Typography>
          </Box>

          {/* Profile Cards */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 4,
            }}
          >
            {/* Coach Card */}
            <Card
              sx={{
                width: 200,
                bgcolor: selectedProfile === 'coach' 
                  ? 'rgba(255, 152, 0, 0.2)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedProfile === 'coach'
                  ? '2px solid #ff9800'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                transform: selectedProfile === 'coach' ? 'scale(1.05)' : 'scale(1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: 'rgba(255, 152, 0, 0.5)',
                  transform: 'scale(1.03)',
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectProfile('coach')}
                sx={{ p: 3, textAlign: 'center' }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 35, color: '#ff9800' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#fff', mb: 1 }}
                >
                  🏋️ COACH
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Gestionar alumnos
                </Typography>
                {profiles?.coach && (
                  <Typography
                    variant="caption"
                    sx={{ 
                      display: 'block',
                      mt: 1,
                      color: '#ff9800',
                    }}
                  >
                    {profiles.coach.studentsCount} alumnos
                  </Typography>
                )}
              </CardActionArea>
            </Card>

            {/* Student Card */}
            <Card
              sx={{
                width: 200,
                bgcolor: selectedProfile === 'student' 
                  ? 'rgba(76, 175, 80, 0.2)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedProfile === 'student'
                  ? '2px solid #4caf50'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                transform: selectedProfile === 'student' ? 'scale(1.05)' : 'scale(1)',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                  transform: 'scale(1.03)',
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectProfile('student')}
                sx={{ p: 3, textAlign: 'center' }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <FitnessCenterIcon sx={{ fontSize: 35, color: '#4caf50' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#fff', mb: 1 }}
                >
                  📱 ALUMNO
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Mi entreno personal
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    display: 'block',
                    mt: 1,
                    color: '#4caf50',
                  }}
                >
                  Rutina, nutrición, cardio
                </Typography>
              </CardActionArea>
            </Card>
          </Box>

          {/* Footer info */}
          <Typography
            variant="body2"
            sx={{
              display: 'block',
              mt: 2,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            💡 Podés cambiar de perfil desde el botón en el header
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default ProfileSelector;


