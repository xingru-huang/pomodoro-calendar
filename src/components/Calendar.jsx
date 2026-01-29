import { useState, useMemo } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const defaultStart = '09:00';
const defaultEnd = '10:00';

function timeToMinutes(t) {
  if (!t || typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  const a1 = timeToMinutes(aStart);
  const a2 = timeToMinutes(aEnd);
  const b1 = timeToMinutes(bStart);
  const b2 = timeToMinutes(bEnd);
  return a1 < b2 && b1 < a2;
}

export default function Calendar({
  events = [],
  eventStats = {},
  selectedDate,
  onSelectDate,
  selectedEventId,
  onSelectEvent,
  onAddEvent,
  onRemoveEvent,
  renderEventDetail,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState(defaultStart);
  const [newEnd, setNewEnd] = useState(defaultEnd);
  const [addError, setAddError] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const totalDays = last.getDate();
  const weeks = useMemo(() => {
    const cells = [...Array(startPad).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    if (rows.length && rows[rows.length - 1].length < 7) {
      const lastRow = rows[rows.length - 1];
      while (lastRow.length < 7) lastRow.push(null);
    }
    return rows;
  }, [startPad, totalDays]);

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  const dayKey = (day) =>
    day == null ? '' : `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayEvents = (day) => {
    const key = dayKey(day);
    return key ? events.filter((e) => e.date === key) : [];
  };

  const today = todayStr();
  const currentDate = selectedDate || today;
  const dayEventList = events.filter((e) => e.date === currentDate);

  const addEvent = () => {
    setAddError(null);
    const title = (newTitle || '').trim();
    if (!title) {
      setAddError('Please enter a title.');
      return;
    }
    if (timeToMinutes(newStart) >= timeToMinutes(newEnd)) {
      setAddError('End time must be after start time.');
      return;
    }
    const conflict = dayEventList.some(
      (e) => rangesOverlap(newStart, newEnd, e.startTime, e.endTime)
    );
    if (conflict) {
      setAddError('This time conflicts with an existing event on this day.');
      return;
    }
    onAddEvent?.({ date: currentDate, title, startTime: newStart, endTime: newEnd });
    setNewTitle('');
    setNewStart(defaultStart);
    setNewEnd(defaultEnd);
  };

  return (
    <div className="calendar-layout">
      <section className="calendar-section">
        <header className="calendar-header">
          <button type="button" className="btn-icon" onClick={prevMonth} aria-label="Previous month">
            ‹
          </button>
          <h2 className="calendar-title">{monthLabel}</h2>
          <button type="button" className="btn-icon" onClick={nextMonth} aria-label="Next month">
            ›
          </button>
        </header>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w} className="weekday">{w}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {weeks.flatMap((row, wi) =>
            row.map((day, di) => {
              const key = dayKey(day);
              const isToday = key === today;
              const isSelected = key === selectedDate;
              const evs = dayEvents(day);
              return (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  className={`cell ${day == null ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  disabled={day == null}
                  onClick={() => day != null && onSelectDate?.(key)}
                >
                  {day != null && (
                    <>
                      <span className="cell-day">{day}</span>
                      {evs.length > 0 && (
                        <span className="cell-events">
                          {evs.slice(0, 2).map((e) => e.title).join(', ')}
                          {evs.length > 2 ? '…' : ''}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>

      <aside className="events-aside">
        <div className="events-aside-inner">
          <h3 className="events-aside-title">Events on {currentDate}</h3>
          <div className="add-event-form">
            <input
              type="text"
              placeholder="Event title"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setAddError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && addEvent()}
            />
            <label className="time-range">
              <span>From</span>
              <input type="time" value={newStart} onChange={(e) => { setNewStart(e.target.value); setAddError(null); }} />
            </label>
            <label className="time-range">
              <span>To</span>
              <input type="time" value={newEnd} onChange={(e) => { setNewEnd(e.target.value); setAddError(null); }} />
            </label>
            <button type="button" className="btn btn-primary" onClick={addEvent}>
              Add event
            </button>
            {addError && <p className="add-event-error" role="alert">{addError}</p>}
          </div>

          {renderEventDetail ? (
            renderEventDetail
          ) : (
            <ul className="event-list">
              {dayEventList.map((e) => {
                const stats = eventStats[e.id] || { completed: 0, failures: 0 };
                const isSelected = selectedEventId === e.id;
                return (
                  <li
                    key={e.id}
                    className={`event-item ${isSelected ? 'selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectEvent?.(isSelected ? null : e.id)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        onSelectEvent?.(isSelected ? null : e.id);
                      }
                    }}
                  >
                    <div className="event-list-info">
                      <span className="event-title">{e.title}</span>
                      <span className="event-time">{e.startTime} – {e.endTime}</span>
                      <span className="event-list-stats">
                        <em>✓ {stats.completed}</em> success · <em>✗ {stats.failures}</em> failed
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={(ev) => { ev.stopPropagation(); onRemoveEvent?.(e.id); }}
                      title="Delete"
                      aria-label="Delete event"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
              {dayEventList.length === 0 && (
                <li className="event-list-empty">No events. Add one above.</li>
              )}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
