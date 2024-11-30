import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import './PomodoroTimer.css'
const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState('pomodoro'); 
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchTimerState();
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          
          saveTimerState(newTime, isRunning, timerType);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      
      new Audio('./notification.mp3').play().catch(() => {});
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const fetchTimerState = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/timer-state/');
      const data = await response.json();
      setTimeLeft(data.time_left);
      setIsRunning(data.is_running);
      setTimerType(data.timer_type);
    } catch (error) {
      console.error('Error fetching timer state:', error);
    }
  };

  const saveTimerState = async (time, running, type) => {
    try {
      await fetch('http://127.0.0.1:8000/timer-state/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time_left: time,
          is_running: running,
          timer_type: type,
        }),
      });
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    saveTimerState(timeLeft, !isRunning, timerType);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const newTime = settings[timerType] * 60;
    setTimeLeft(newTime);
    saveTimerState(newTime, false, timerType);
  };

  const switchTimerType = (type) => {
    setTimerType(type);
    setTimeLeft(settings[type] * 60);
    setIsRunning(false);
    saveTimerState(settings[type] * 60, false, type);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <div className="timer-types">
          <button
            className={`timer-type-btn ${timerType === 'pomodoro' ? 'active' : ''}`}
            onClick={() => switchTimerType('pomodoro')}
          >
            Pomodoro
          </button>
          <button
            className={`timer-type-btn ${timerType === 'shortBreak' ? 'active' : ''}`}
            onClick={() => switchTimerType('shortBreak')}
          >
            Short Break
          </button>
          <button
            className={`timer-type-btn ${timerType === 'longBreak' ? 'active' : ''}`}
            onClick={() => switchTimerType('longBreak')}
          >
            Long Break
          </button>
        </div>

        <div className="timer-display">
          <h1 className="time">{formatTime(timeLeft)}</h1>
        </div>

        <div className="timer-controls">
          <button className="control-btn reset" onClick={resetTimer}>
            <RotateCcw className="w-6 h-6" />
          </button>
          <button className="control-btn play-pause" onClick={toggleTimer}>
            {isRunning ? 
              <Pause className="w-8 h-8" /> : 
              <Play className="w-8 h-8" />
            }
          </button>
          <button className="control-btn settings" onClick={() => setShowSettings(true)}>
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <h2>Timer Settings</h2>
              <div className="settings-form">
                <div className="setting-item">
                  <label>Pomodoro (minutes)</label>
                  <input
                    type="number"
                    value={settings.pomodoro}
                    min = "0"
                    onChange={(e) => setSettings({ ...settings, pomodoro: parseInt(e.target.value) })}
                  />
                </div>
                <div className="setting-item">
                  <label>Short Break (minutes)</label>
                  <input
                    type="number"
                    value={settings.shortBreak}
                    min = "0"
                    onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
                  />
                </div>
                <div className="setting-item">
                  <label>Long Break (minutes)</label>
                  <input
                    type="number"
                    value={settings.longBreak}
                    min = "0"
                    onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <button className="save-btn" onClick={() => setShowSettings(false)}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;