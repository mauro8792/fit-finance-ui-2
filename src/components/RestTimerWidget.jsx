import React, { useState, useEffect, useRef, useCallback } from "react";
import './RestTimerWidget.css';

const RestTimerWidget = ({ restTime = 90, onComplete, onDismiss }) => {
  // Usar timestamp de finalización en lugar de contar segundos
  const [endTime, setEndTime] = useState(() => Date.now() + restTime * 1000);
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeLeft, setPausedTimeLeft] = useState(null);
  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);

  // Calcular tiempo restante basado en timestamp real
  const calculateTimeLeft = useCallback(() => {
    if (isPaused && pausedTimeLeft !== null) {
      return pausedTimeLeft;
    }
    const remaining = Math.ceil((endTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  }, [endTime, isPaused, pausedTimeLeft]);

  // Actualizar el timer cada 100ms para mayor precisión
  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // Verificar si terminó
      if (remaining <= 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        playNotification();
        if (onComplete) onComplete();
        // Limpiar el intervalo cuando termina
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    // Actualizar inmediatamente cuando la app vuelve a primer plano
    updateTimer();

    // Solo iniciar intervalo si no está pausado y el timer no ha terminado
    if (!isPaused && !hasCompletedRef.current) {
      // Usar intervalo corto para detectar cambios rápido
      intervalRef.current = setInterval(updateTimer, 100);
    }

    // Listener para cuando la app vuelve a primer plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused, endTime, calculateTimeLeft, onComplete]);

  const playNotification = () => {
    // Vibración
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Intentar reproducir sonido
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 300);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Reanudar: establecer nuevo endTime basado en tiempo pausado
      setEndTime(Date.now() + pausedTimeLeft * 1000);
      setPausedTimeLeft(null);
      hasCompletedRef.current = false;
    } else {
      // Pausar: guardar tiempo restante actual
      setPausedTimeLeft(calculateTimeLeft());
    }
    setIsPaused(!isPaused);
  };

  const addTime = (seconds) => {
    if (isPaused && pausedTimeLeft !== null) {
      setPausedTimeLeft(prev => Math.max(0, prev + seconds));
    } else {
      setEndTime(prev => prev + seconds * 1000);
    }
    hasCompletedRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / restTime) * 100;
  const isNearEnd = timeLeft <= 10 && timeLeft > 0;
  const isComplete = timeLeft === 0;

  return (
    <div className={`rest-timer-widget ${isNearEnd ? 'near-end' : ''} ${isComplete ? 'complete' : ''} ${isPaused ? 'paused' : ''}`}>
      {/* Progress bar */}
      <div className="widget-progress-bar">
        <div 
          className="widget-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="widget-content">
        {/* Left side - Timer display */}
        <div className="widget-left">
          <div className="widget-icon">
            {isComplete ? '✓' : isPaused ? '⏸️' : '⏱️'}
          </div>
          <div className="widget-info">
            <div className="widget-label">
              {isComplete ? '¡Descanso completo!' : isPaused ? 'Pausado' : 'Descanso'}
            </div>
            <div className="widget-time">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="widget-controls">
          <button 
            onClick={() => addTime(-15)} 
            className="widget-btn widget-btn-time"
            disabled={timeLeft <= 0}
            title="Restar 15 segundos"
          >
            -15s
          </button>
          
          <button 
            onClick={togglePause} 
            className="widget-btn widget-btn-play"
            disabled={timeLeft <= 0}
            title={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          
          <button 
            onClick={() => addTime(15)} 
            className="widget-btn widget-btn-time"
            title="Agregar 15 segundos"
          >
            +15s
          </button>

          <button 
            onClick={onDismiss} 
            className="widget-btn widget-btn-close"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimerWidget;

