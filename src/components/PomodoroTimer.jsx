import { useState, useEffect, useRef } from 'react';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;
const PAUSE_FAIL_MS = 60 * 1000;

export default function PomodoroTimer({ activeEvent, onComplete, onFail }) {
  const [phase, setPhase] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC);
  const [isRunning, setIsRunning] = useState(false);
  const phaseRef = useRef(phase);
  const workStartedRef = useRef(false);
  const pausedAtRef = useRef(null);
  phaseRef.current = phase;

  // Tick countdown when running
  useEffect(() => {
    if (!isRunning) return;
    pausedAtRef.current = null;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : s));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Phase transitions: work→0 → break; break→0 or Skip → success, back to initial work
  useEffect(() => {
    if (secondsLeft !== 0) return;
    const p = phaseRef.current;
    if (p === 'work') {
      setPhase('break');
      setSecondsLeft(BREAK_SEC);
    } else {
      onComplete?.();
      workStartedRef.current = false;
      pausedAtRef.current = null;
      setPhase('work');
      setSecondsLeft(WORK_SEC);
    }
  }, [secondsLeft, onComplete]);

  // While paused in work: if paused > 1 min → fail once and auto-reset to 25:00
  useEffect(() => {
    if (phase !== 'work' || isRunning || !workStartedRef.current) return;
    const t0 = pausedAtRef.current;
    if (t0 == null) return;
    const id = setInterval(() => {
      if (Date.now() - t0 >= PAUSE_FAIL_MS) {
        clearInterval(id);
        onFail?.();
        pausedAtRef.current = null;
        workStartedRef.current = false;
        setSecondsLeft(WORK_SEC);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, isRunning, onFail]);

  const pause = () => {
    if (phase === 'work') {
      pausedAtRef.current = Date.now();
    }
    workStartedRef.current = phase === 'work' ? workStartedRef.current : false;
    setIsRunning(false);
  };

  const toggle = () => {
    if (phase === 'break') return;
    if (isRunning) {
      pause();
    } else {
      pausedAtRef.current = null;
      workStartedRef.current = true;
      setIsRunning(true);
    }
  };

  const skipBreak = () => {
    if (phase !== 'break') return;
    onComplete?.();
    workStartedRef.current = false;
    pausedAtRef.current = null;
    setPhase('work');
    setSecondsLeft(WORK_SEC);
  };

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const display = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const label = phase === 'work' ? 'Focus' : 'Break';

  return (
    <section className={`pomodoro ${isRunning ? 'pomodoro--running' : ''}`}>
      <div className="pomodoro-phase">{label}</div>
      {activeEvent && (
        <div className="pomodoro-for-event" title={activeEvent.title}>
          for: {activeEvent.title}
        </div>
      )}
      {phase === 'work' && workStartedRef.current && !isRunning && pausedAtRef.current != null && (
        <div className="pomodoro-pause-warn" role="status">
          Paused. Over 1 min = fail, auto-reset to 25:00.
        </div>
      )}
      <div className="pomodoro-time" aria-live="polite">
        {display}
      </div>
      <div className="pomodoro-actions">
        {phase === 'work' ? (
          <button type="button" onClick={toggle} className="btn btn-primary">
            {isRunning ? 'Pause' : 'Start'}
          </button>
        ) : (
          <button type="button" onClick={skipBreak} className="btn btn-primary">
            Skip
          </button>
        )}
      </div>
    </section>
  );
}
