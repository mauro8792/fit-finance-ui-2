import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';

export const AuthLayout = ({ children, title = '' }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Grid 
      container 
      spacing={0} 
      direction='column' 
      alignItems='center' 
      justifyContent='center' 
      sx={{ 
        minHeight: '100vh',
        background: isMobile 
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2c2c2c 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: { xs: 2, sm: 4 }
      }}
    >
      {/* Logo Section - Solo en mobile */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
            animation: 'fadeInDown 0.6s ease-out'
          }}
        >
          <Box
            component="img"
            src="/WHITE.png"
            alt="Logo"
            sx={{
              width: 150,
              height: 150,
              mb: 3,
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}
          >
            FIT MANAGER
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              mt: 0.5
            }}
          >
            Gestiona tu gimnasio profesionalmente
          </Typography>
        </Box>
      )}

      <Grid
        item
        className='box-shadow'
        xs={3}
        sx={{
          width: { xs: '90%', sm: 450 },
          maxWidth: 400,
          backgroundColor: isMobile ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(15px)',
          padding: { xs: 3, sm: 4 }, 
          borderRadius: { xs: 3, sm: 2 },
          border: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
          boxShadow: isMobile 
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 16px 48px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.6s ease-out'
        }}
      >
        {!isMobile && (
          <Typography variant='h5' sx={{ mb: 3, color: '#ff9800', fontWeight: 600, textAlign: 'center' }}>
            {title}
          </Typography>
        )}

        {children}
      </Grid>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Grid>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};
