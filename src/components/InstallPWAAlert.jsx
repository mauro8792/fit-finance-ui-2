import { useEffect, useState } from 'react';
import { Box, Button, Typography, Slide, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const InstallPWAAlert = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar si ya se descartó
    const dismissed = localStorage.getItem('pwa-alert-dismissed') === 'true';
    if (dismissed) return;

    if (!isMobileDevice()) return;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    });
    // Si ya está instalada, no mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShow(false);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-alert-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Box sx={{
        position: 'fixed',
        bottom: 16,
        left: 0,
        right: 0,
        mx: 'auto',
        maxWidth: 360,
        bgcolor: '#222',
        color: '#fff',
        borderRadius: 3,
        boxShadow: 6,
        p: 2,
        zIndex: 9999,
        textAlign: 'center',
      }}>
        {/* Botón X para cerrar */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            color: '#fff',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          ¿Querés instalar la app en tu celular?
        </Typography>
        <Button variant="contained" color="primary" onClick={handleInstall}>
          Instalar App
        </Button>
      </Box>
    </Slide>
  );
};
