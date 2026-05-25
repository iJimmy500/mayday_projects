import { useRef, useState, useEffect } from 'react';

export default function DatePicker({ month, day, year, onMonthChange, onDayChange, onYearChange, maxDay }) {
  // Internal display strings — parent receives parsed values via callbacks
  const [mStr, setMStr] = useState(month ? String(month).padStart(2, '0') : '');
  const [dStr, setDStr] = useState(day   ? String(day).padStart(2, '0')   : '');
  const [yStr, setYStr] = useState(year  ? String(year) : '');

  const monthRef = useRef(null);
  const dayRef   = useRef(null);
  const yearRef  = useRef(null);

  useEffect(() => {
    setMStr(month ? String(month).padStart(2, '0') : '');
  }, [month]);

  useEffect(() => {
    setDStr(day ? String(day).padStart(2, '0') : '');
  }, [day]);

  useEffect(() => {
    setYStr(year ? String(year) : '');
  }, [year]);

  function handleMonth(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setMStr(digits);
    const num = parseInt(digits, 10);
    if (!digits) { onMonthChange(0); return; }
    if (num >= 1 && num <= 12) {
      onMonthChange(num);
      // Auto-advance: if 2 digits, or first digit ≥ 2 (can't make a valid 2-digit month ≤ 12)
      if (digits.length === 2 || num >= 2) dayRef.current?.focus();
    }
  }

  function handleDay(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setDStr(digits);
    const num = parseInt(digits, 10);
    if (!digits) { onDayChange(0); return; }
    if (num >= 1 && num <= maxDay) {
      onDayChange(num);
      // Auto-advance: if 2 digits, or first digit makes a 2-digit value impossible within maxDay
      if (digits.length === 2 || num * 10 > maxDay) yearRef.current?.focus();
    }
  }

  function handleYear(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setYStr(digits);
    onYearChange(digits);
  }

  return (
    <div className="bday-datepicker">
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        className="bday-dp-seg"
        value={mStr}
        placeholder="MM"
        onChange={e => handleMonth(e.target.value)}
        onFocus={e => e.target.select()}
      />
      <span className="bday-dp-slash">/</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        className="bday-dp-seg"
        value={dStr}
        placeholder="DD"
        onChange={e => handleDay(e.target.value)}
        onFocus={e => e.target.select()}
        onKeyDown={e => e.key === 'Backspace' && !dStr && monthRef.current?.focus()}
      />
      <span className="bday-dp-slash">/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        className="bday-dp-seg bday-dp-seg--year"
        value={yStr}
        placeholder="YYYY"
        onChange={e => handleYear(e.target.value)}
        onFocus={e => e.target.select()}
        onKeyDown={e => e.key === 'Backspace' && !yStr && dayRef.current?.focus()}
      />
    </div>
  );
}
