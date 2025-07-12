import { Box, IconButton, Typography, useTheme, Chip } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../hooks';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import { tokens } from '../../theme';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { startLogout, user, student, userType } = useAuthStore();
  
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      p={2}
      boxShadow={3}
      sx={{
        background: `linear-gradient(to right, ${colors.primary[900]},  ${colors.orangeAccent[500]})`, // Agrega un tono más negro al principio
      }}
    >
      <Box display='flex' alignItems='center'>
        <Typography variant='h4' style={{ paddingRight: '10px', color: 'white' }}>
          Round 22
        </Typography>
        <SportsMartialArtsIcon fontSize='large' style={{ color: 'white' }} />
        <SportsMmaIcon fontSize='large' style={{ color: 'white' }} />
      </Box>

      <Box display='flex' alignItems='center' gap={2}>
        {userType && (
          <Chip 
            label={userType === 'student' ? 'Estudiante' : 'Administrador'}
            color={userType === 'student' ? 'secondary' : 'primary'}
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
        
        <Typography 
          variant='body1' 
          style={{ color: 'white', fontWeight: 'bold' }}
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
