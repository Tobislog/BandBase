import { useState } from "react";
import { CircleX, Save, Trash } from "lucide-react";
import BasicButton from "../../components/BasicButton";
import { toEventForm } from "../../utils/event";
import { addHoursToTime, isOvernightEvent } from "../../utils/date";

export default function EventModal ({ event, onClose, onSave, onDelete}) {

    const [form, setForm] = useState(() => toEventForm(event));
    const [endTimeTouched, setEndTimeTouched] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'endTime') setEndTimeTouched(true);

        setForm(prev => {
            const next = { ...prev, [name]: value };

            if (name === 'startTime' && !endTimeTouched) {
                next.endTime = addHoursToTime(value, 2);
            }
            return next;
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.date || !form.startTime) {
            alert("Please set Title, Date and Start time!");
            return;
        }
        onSave(form);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 border border-line">
                <div className="flex justify-between items-center mb-4 border-b border-line pb-2">
                    <h3>Event</h3>
                    <BasicButton icon={<CircleX />} onClick={onClose} />
                </div>
                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">*Title</label>
                        <input 
                            type="text"
                            name="title" 
                            value={form.title}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Title"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">*Date</label>
                        <input 
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Meetup</label>
                        <input 
                            type="time"
                            name="meetupTime"
                            value={form.meetupTime}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">*Start</label>
                        <input 
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End</label>
                        <input 
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    {isOvernightEvent(form) && (<p className="text-xs text-brand">Ende am Folgetag</p>)}
                    <div>
                        <label className="block text-sm font-medium mb-1"> Category</label>
                        <select 
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                        >
                            <option value="Rehearsal">Rehearsal</option>
                            <option value="Gig">Gig</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Optional Details"
                            rows="3"
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        {event?.id && (
                            <BasicButton 
                                icon={<Trash />}
                                onClick={onDelete}
                                isDelete
                            />
                        )}
                        <BasicButton 
                            icon={<Save />}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}
