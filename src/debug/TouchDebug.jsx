// Debug component para testear eventos táctiles
import React from 'react';
import { Box, Typography } from '@mui/material';

const TouchDebug = () => {
  const [lastEvent, setLastEvent] = React.useState('');
  const [touchCount, setTouchCount] = React.useState(0);

  const logEvent = (eventType, e) => {
    const timestamp = new Date().toLocaleTimeString();
    setLastEvent(`${timestamp}: ${eventType}`);
    setTouchCount(prev => prev + 1);
    console.log(`🔍 TouchDebug - ${eventType}:`, e);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: 2,
        borderRadius: 1,
        zIndex: 9999,
        fontSize: '0.75rem',
        maxWidth: 250,
        wordWrap: 'break-word'
      }}
    >
      <Typography variant="caption" display="block">
        Touch Debug Info
      </Typography>
      <Typography variant="caption" display="block">
        Events: {touchCount}
      </Typography>
      <Typography variant="caption" display="block">
        Last: {lastEvent}
      </Typography>
      <Box
        sx={{
          mt: 1,
          p: 1,
          border: '1px solid white',
          borderRadius: 1,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'rgba(255,255,255,0.1)',
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => logEvent('CLICK', e)}
        onTouchStart={(e) => logEvent('TOUCH_START', e)}
        onTouchEnd={(e) => logEvent('TOUCH_END', e)}
        onTouchCancel={(e) => logEvent('TOUCH_CANCEL', e)}
      >
        Test Touch Area
      </Box>
    </Box>
  );
};

export default TouchDebug;
