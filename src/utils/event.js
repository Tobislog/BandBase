export const DEFAULT_START_TIME = '19:00';
export const DEFAULT_END_TIME = '21:00';

export function createEvent(overrides = {}) {
    return {
        id: null,
        bandId: null,
        title: "",
        date: "",
        description: "",
        category: "other",
        meetupTime: "", // In Formular Strings, on Save null
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        setlistId: "",
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
