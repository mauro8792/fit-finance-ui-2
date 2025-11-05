import React, { useState, useEffect, useRef } from "react";
import './RestTimer.css';

const RestTimer = ({ restTime = 90, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            playSound();
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
  }, [isActive, isPaused, timeLeft, onComplete]);

  const playSound = () => {
    // Vibración si está disponible
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    // Sonido simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const addTime = (seconds) => {
    setTimeLeft(prev => prev + seconds);
  };

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (onClose) onClose();
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
    <div className="rest-timer-overlay">
      <div className={`rest-timer-container ${isNearEnd ? 'near-end' : ''} ${isComplete ? 'complete' : ''}`}>
        
        {/* Progress Circle */}
        <div className="timer-circle">
          <svg viewBox="0 0 200 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#ffed4e" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="90"
              className="timer-circle-bg"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              className="timer-circle-progress"
              style={{
                strokeDasharray: `${2 * Math.PI * 90}`,
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`
              }}
            />
          </svg>
          
          <div className="timer-content">
            <div className="timer-label">Descanso</div>
            <div className="timer-display">{formatTime(timeLeft)}</div>
            {isComplete && <div className="timer-complete">¡Listo!</div>}
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button onClick={() => addTime(-15)} className="timer-btn timer-btn-small" disabled={timeLeft <= 0}>
            -15s
          </button>
          
          <button onClick={togglePause} className="timer-btn timer-btn-main" disabled={timeLeft <= 0}>
            {isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
          </button>
          
          <button onClick={() => addTime(15)} className="timer-btn timer-btn-small">
            +15s
          </button>
        </div>

        <button onClick={skip} className="timer-btn timer-btn-skip">
          {isComplete ? '✓ Continuar' : 'Saltar'}
        </button>
      </div>
    </div>
  );
};

export default RestTimer;

