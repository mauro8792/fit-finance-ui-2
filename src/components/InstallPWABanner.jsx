import { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import AppleIcon from '@mui/icons-material/Apple';

export const InstallPWABanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const isInstalled = localStorage.getItem('pwa-installed') === 'true';
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    
    if (isInstalled || bannerDismissed) {
      return;
    }

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    if (iOS) {
      // En iOS mostrar banner inmediatamente (no hay beforeinstallprompt)
      const isStandalone = window.navigator.standalone === true;
      if (!isStandalone) {
        setShowBanner(true);
      }
    } else {
      // En Android/Chrome, esperar el evento beforeinstallprompt
      const checkInstallable = setInterval(() => {
        const installable = localStorage.getItem('pwa-installable') === 'true';
        if (installable) {
          setShowBanner(true);
          clearInterval(checkInstallable);
        }
      }, 500);

      return () => clearInterval(checkInstallable);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // En iOS no se puede programar la instalación
      return;
    }

    // En Android/Chrome usar el prompt
    const installed = await window.showInstallPrompt();
    if (installed) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <Slide direction="down" in={showBanner} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          bgcolor: isIOS ? '#007AFF' : '#000',
          color: '#fff',
          p: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            📱 Instala BraCamp
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {isIOS 
              ? 'Toca el botón de compartir ⬆️ y luego "Agregar a pantalla de inicio"'
              : 'Instala la app para acceso rápido y mejor experiencia'}
          </Typography>
        </Box>
        
        {!isIOS && (
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon />}
            onClick={handleInstall}
            sx={{
              bgcolor: '#4caf50',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#45a049',
              },
            }}
          >
            Instalar
          </Button>
        )}

        {isIOS && (
          <AppleIcon sx={{ fontSize: 32, opacity: 0.8 }} />
        )}

        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{ color: '#fff', ml: -1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Slide>
  );
};

