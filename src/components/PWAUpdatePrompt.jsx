import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState, useEffect } from 'react';
import { Snackbar, Button, Box, Typography } from '@mui/material';

const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('✅ Service Worker registrado:', swUrl);
      
      // Verificar actualizaciones cada 1 hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ Error registrando Service Worker:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 80, sm: 24 } }} // Más arriba en mobile por si hay nav
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: '#1a1a2e',
          color: '#fff',
          px: 3,
          py: 2,
          borderRadius: 2,
          border: '2px solid #ffd700',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
        }}
      >
        <Typography fontSize={20}>🚀</Typography>
        <Box>
          <Typography fontWeight={600} fontSize={14}>
            ¡Nueva versión disponible!
          </Typography>
          <Typography fontSize={12} color="rgba(255,255,255,0.7)">
            Actualizá para ver las mejoras
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleUpdate}
          sx={{
            bgcolor: '#ffd700',
            color: '#000',
            fontWeight: 700,
            '&:hover': { bgcolor: '#ffed4a' },
            ml: 1,
          }}
        >
          Actualizar
        </Button>
        <Button
          size="small"
          onClick={handleClose}
          sx={{ color: '#888', minWidth: 'auto', p: 0.5 }}
        >
          ✕
        </Button>
      </Box>
    </Snackbar>
  );
};

export default PWAUpdatePrompt;

