import { getStoredEvents } from "../services/storageService";
import { addHoursToTime } from "./date";

export const DEFAULT_START_TIME = '19:00';
export const DEFAULT_END_TIME = '21:00';

export function createEvent(overrides = {}) {
    const allEvents = getStoredEvents();
    const nextId = allEvents.length === 0 ? 1 : Math.max(...allEvents.map(e => Number(e.id)) +1)
    return {
        id: nextId,
        title: "",
        date: "",
        description: "",
        category: "Other",
        meetupTime: "", // In Formular Strings, on Save null
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        setlistId: "",
        eventId: null,
        ...overrides,
    }
}

export function toEventForm(event) {
    return createEvent({
        ...event,
        meetupTime: event?.meetupTime ?? "",
        setlistId: event?.setlistId ?? "",
    })
}

export function normalizeEvent(event) {
    return {
        ...event,
        meetupTime: event.meetupTime || null,
        setlistId: event.setlistId || null,
        endTime: event.endTime || addHoursToTime(event.startTime, 2),
    }
}
