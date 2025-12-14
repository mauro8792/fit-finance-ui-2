import { Box, IconButton, Typography, useTheme, Chip } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../hooks';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import { tokens } from '../../theme';
import ProfileSwitcher from '../../components/ProfileSwitcher';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { startLogout, user, student, userType, hasMultipleProfiles, profiles } = useAuthStore();
  
  // Check robusto: tiene perfil dual si hasMultipleProfiles O si tiene ambos profiles
  const showProfileSwitcher = hasMultipleProfiles || (profiles?.coach && profiles?.student);
  
  console.log('🎨 Topbar render:', { 
    hasMultipleProfiles, 
    profiles, 
    showProfileSwitcher,
    userType 
  });
  
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      p={{ xs: 1, sm: 2 }} // Padding responsivo
      boxShadow={3}
      sx={{
        background: `linear-gradient(to right, ${colors.primary[900]},  ${colors.orangeAccent[500]})`,
      }}
    >
      <Box display='flex' alignItems='center'>
        <Typography 
          variant='h4' 
          sx={{ 
            pr: { xs: 1, sm: 2 }, 
            color: 'white',
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
          }}
        >
          Round 22
        </Typography>
        <SportsMartialArtsIcon 
          sx={{ 
            color: 'white',
            fontSize: { xs: 'medium', sm: 'large' }
          }} 
        />
        <SportsMmaIcon 
          sx={{ 
            color: 'white',
            fontSize: { xs: 'medium', sm: 'large' }
          }} 
        />
      </Box>

      <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 2 }}>
        {/* ProfileSwitcher para usuarios con perfil dual */}
        {showProfileSwitcher ? (
          <ProfileSwitcher />
        ) : userType && (
          <Chip 
            label={
              userType === 'student'
                ? 'Estudiante'
                : userType === 'coach'
                  ? 'Coach'
                  : 'Administrador'
            }
            color={
              userType === 'student'
                ? 'secondary'
                : userType === 'coach'
                  ? 'success'
                  : 'primary'
            }
            variant="outlined"
            size={window.innerWidth < 600 ? 'small' : 'medium'} // Tamaño responsivo
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '0.7rem', sm: '0.8rem' }
            }}
          />
        )}
        
        <Typography 
          variant='body1' 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: { xs: '0.8rem', sm: '1rem' },
            display: { xs: 'none', sm: 'block' } // Ocultar en mobile muy pequeño
          }}
        >
          {userType === 'student' && student ? 
            `${student.firstName} ${student.lastName}` : 
            user?.fullName || user?.email
          }
        </Typography>
        
        <IconButton color='inherit'>
          <PersonOutlinedIcon />
        </IconButton>
        <IconButton color='inherit' onClick={startLogout}>
          <LogoutOutlined />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
