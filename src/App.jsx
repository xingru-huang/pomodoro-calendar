import { useState, useCallback, useEffect } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import Calendar from './components/Calendar';
import './App.css';

const STORAGE_KEY = 'pomo-calendar-data';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: [], eventStats: {} };
    const parsed = JSON.parse(raw);
    return {
      events: parsed.events || [],
      eventStats: parsed.eventStats || {},
    };
  } catch {
    return { events: [], eventStats: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [data, setData] = useState(loadData);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const recordCompletion = useCallback((eventId) => {
    if (!eventId) return;
    setData((d) => ({
      ...d,
      eventStats: {
        ...d.eventStats,
        [eventId]: {
          ...(d.eventStats[eventId] || { completed: 0, failures: 0 }),
          completed: (d.eventStats[eventId]?.completed ?? 0) + 1,
        },
      },
    }));
  }, []);

  const recordFailure = useCallback((eventId) => {
    if (!eventId) return;
    setData((d) => ({
      ...d,
      eventStats: {
        ...d.eventStats,
        [eventId]: {
          ...(d.eventStats[eventId] || { completed: 0, failures: 0 }),
          failures: (d.eventStats[eventId]?.failures ?? 0) + 1,
        },
      },
    }));
  }, []);

  const onComplete = useCallback(() => {
    recordCompletion(activeEventId);
  }, [activeEventId, recordCompletion]);

  const onFail = useCallback(() => {
    recordFailure(activeEventId);
  }, [activeEventId, recordFailure]);

  const onStartPomodoro = useCallback((event) => {
    setActiveEventId(event?.id ?? null);
    setActiveEvent(event ?? null);
  }, []);

  const onAddEvent = useCallback(({ date, title, startTime, endTime }) => {
    const id = Date.now().toString();
    setData((d) => ({
      ...d,
      events: [...d.events, { id, date, title, startTime, endTime }],
    }));
    setSelectedEventId(id);
  }, []);

  const onRemoveEvent = useCallback((id) => {
    setData((d) => ({
      ...d,
      events: d.events.filter((e) => e.id !== id),
      eventStats: (() => {
        const { [id]: _, ...rest } = d.eventStats;
        return rest;
      })(),
    }));
    if (selectedEventId === id) setSelectedEventId(null);
    if (activeEventId === id) {
      setActiveEventId(null);
      setActiveEvent(null);
    }
  }, [selectedEventId, activeEventId]);

  const selectedEvent = selectedEventId
    ? data.events.find((e) => e.id === selectedEventId) ?? null
    : null;

  return (
    <div className="app">
      <header className="app-hero">
        <div className="hero-inner">
          <h1 className="hero-title">Pomodoro Calendar</h1>
          <p className="hero-tagline">Reclaim your focus.</p>
          <div className="hero-story">
            <p>
              In the age of short-form video, our attention spans are shorter than ever. This app helps you build focus back: plan your day on the calendar, run Pomodoros on real tasks, and track success vs slip-ups—so you can improve over time.
            </p>
          </div>
          <div className="hero-howto">
            <p className="hero-howto-title">How to use</p>
            <ol className="hero-howto-steps">
              <li><strong>Calendar first</strong> — Pick a date, add events with time ranges.</li>
              <li><strong>Click an event</strong> — Open it to see stats and start a Pomodoro.</li>
              <li><strong>Start Pomodoro</strong> — 25 min focus, then 5 min break. Stay the course or it counts as a fail.</li>
              <li><strong>See success vs failed</strong> — Each event shows completed and failed Pomodoros so you know where you stand.</li>
            </ol>
          </div>
        </div>
      </header>
      <main className="app-main">
        <Calendar
          events={data.events}
          eventStats={data.eventStats}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setSelectedEventId(null);
          }}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          activeEventId={activeEventId}
          onStartPomodoro={onStartPomodoro}
          onAddEvent={onAddEvent}
          onRemoveEvent={onRemoveEvent}
          selectedEvent={selectedEvent}
          onBackFromEvent={() => setSelectedEventId(null)}
          renderEventDetail={
            selectedEvent ? (
              <div className="event-detail-panel">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setSelectedEventId(null)}
                >
                  ← Back to events
                </button>
                <div className="event-detail-header">
                  <h3>{selectedEvent.title}</h3>
                  <span className="event-detail-time">
                    {selectedEvent.startTime} – {selectedEvent.endTime}
                  </span>
                </div>
                <div className="event-detail-stats">
                  <div className="stat-box success">
                    <span className="stat-value">
                      {(data.eventStats[selectedEvent.id]?.completed ?? 0)}
                    </span>
                    <span className="stat-label">Successful Pomodoros</span>
                  </div>
                  <div className="stat-box fail">
                    <span className="stat-value">
                      {(data.eventStats[selectedEvent.id]?.failures ?? 0)}
                    </span>
                    <span className="stat-label">Failed Pomodoros</span>
                  </div>
                </div>
                {activeEventId === selectedEvent.id ? (
                  <PomodoroTimer
                    activeEvent={selectedEvent}
                    onComplete={onComplete}
                    onFail={onFail}
                  />
                ) : (
                  <div className="event-detail-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onStartPomodoro(selectedEvent)}
                    >
                      Start Pomodoro
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline"
                      onClick={() => onRemoveEvent(selectedEvent.id)}
                    >
                      Delete event
                    </button>
                  </div>
                )}
              </div>
            ) : null
          }
        />
      </main>
    </div>
  );
}

export default App;
