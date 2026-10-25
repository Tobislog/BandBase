export function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`;
}

export function toTimeKey(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function parseDateKey(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year,month - 1, day);
}
export function formatDateKey(dateKey) {
    return parseDateKey(dateKey).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
export function addHoursToTime(time, hours) {
    if (!time) return "";

    const [hour, minute] = time.split(":").map(Number);
    if(Number.isNaN(hour) || Number.isNaN(minute)) return "";

    const minutesPerDay = 24 * 60;
    const totalMinutes = (((hour * 60 + minute + hours * 60) % minutesPerDay) + minutesPerDay) % minutesPerDay;
    const nextHour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const nextMinute = String(totalMinutes % 60).padStart(2, '0');
    
    return `${nextHour}:${nextMinute}`;
}
export function isOvernightEvent(event) {
    if(!event.startTime || !event.endTime) return false;
    return event.endTime <= event.startTime;
}
export function getEventDurationMinutes(event) {
    if (!event.startTime || !event.endTime) return 0;
    
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const start = startHour * 60 + startMinute;
    let end = endHour * 60 + endMinute;

    if (end <= start) end += 24 * 60;

    return end - start;
}
export function compareEvents(a, b) {
    const byDate = a.date.localeCompare(b.date);
    if(byDate !== 0) return byDate;

    return (a.startTime || "").localeCompare(b.startTime || '');
}
export function formatEventTimeRange(event) {
    if(!event.startTime) return '';

    const end = event.endTime ? `-${event.endTime}`: '';
    const overnight = isOvernightEvent(event) ? ' (+1)' : '';

    return `${event.startTime}${end}${overnight}`;
}
export function daysUntil(dateKey, from = new Date()) {
    const today = new Date(from);
    today.setHours(0, 0, 0, 0);

    const target = parseDateKey(dateKey);
    target.setHours(0, 0, 0, 0);

    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}
