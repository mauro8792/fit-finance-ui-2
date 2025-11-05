import React, { useState, useEffect, useRef } from "react";
import './RestTimerWidget.css';

const RestTimerWidget = ({ restTime = 90, onComplete, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            playNotification();
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, timeLeft, onComplete]);

  const playNotification = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const addTime = (seconds) => {
    setTimeLeft(prev => Math.max(0, prev + seconds));
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

