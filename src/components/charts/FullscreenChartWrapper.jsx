import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const FullscreenChartWrapper = ({ children, title }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const containerRef = useRef(null);

  // Detectar cambios de orientación
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
      
      // Intentar bloquear en landscape
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (e) {
          // Algunos navegadores no soportan lock - usamos CSS fallback
          console.log('Orientation lock not supported, using CSS rotation');
        }
      }
      
      setIsFullscreen(true);
    } catch (e) {
      console.error('Fullscreen error:', e);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
      
      setIsFullscreen(false);
    } catch (e) {
      console.error('Exit fullscreen error:', e);
    }
  };

  // Escuchar cambios de fullscreen (por si el usuario sale con ESC o gesto)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Si está en fullscreen y portrait, rotar con CSS
  const needsCSSRotation = isFullscreen && isPortrait;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        ...(isFullscreen && {
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }),
      }}
    >
      {/* Contenedor rotado si es necesario */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...(needsCSSRotation && {
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            width: '100vh',
            height: '100vw',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-50vw',
            marginLeft: '-50vh',
          }),
        }}
      >
        {/* Botón de fullscreen */}
        <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}>
          <IconButton
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            sx={{
              position: 'absolute',
              top: isFullscreen ? 16 : 0,
              right: isFullscreen ? 16 : 0,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#ff9800',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
            size="small"
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>

        {/* Título en fullscreen */}
        {isFullscreen && title && (
          <Box
            sx={{
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2,
              pt: 2,
            }}
          >
            {title}
          </Box>
        )}

        {/* El gráfico */}
        <Box sx={{ 
          width: '100%', 
          flex: 1,
          minHeight: 0,
          padding: isFullscreen ? 2 : 0,
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default FullscreenChartWrapper;

