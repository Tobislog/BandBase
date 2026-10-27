import { useState, useEffect } from "react";
import { CircleX, Save, SendHorizonal, Trash } from "lucide-react";
import BasicButton from "../../components/BasicButton";
import { toEventForm } from "../../utils/event";
import { addHoursToTime, isOvernightEvent } from "../../utils/date";
import { useChannels } from "../../context/ChannelProvider";

export default function EventModal ({ event, onClose, onSave, onDelete}) {

    const [form, setForm] = useState(() => toEventForm(event));
    const [messageContent, setMessageContent] = useState("");
    const [endTimeTouched, setEndTimeTouched] = useState(false);
    const [showMeetup, setShowMeetup] = useState(Boolean(event?.meetupTime));
    const {setActiveChannelId, messages, sendMessage } = useChannels();

    useEffect(() => {
        if (event?.channelId) {
            setActiveChannelId(event.channelId);
        }
    }, [event?.channelId, setActiveChannelId]);
    
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

    const handleMeetupToggle = (e) => {
        const isChecked = e.target.checked;
        setShowMeetup(isChecked);

        if (!isChecked) {
            setForm(prev => ({...prev, meetupTime: null}));
        }
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

    const handleInputChange = (e) => {
        setMessageContent(e.target.value);
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        if(!messageContent.trim()) return;
        sendMessage(event.channelId, messageContent);
        setMessageContent('');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-line overflow-hidden">
                <div className="flex justify-between items-center p-6 pb-4 border-b border-line bg-surface z-10">
                    <h3 className="text-lg font-semibold">{form.title}</h3>
                    <BasicButton icon={<CircleX />} onClick={onClose} />
                </div>
                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    <form className="flex flex-col gap-4 border-b border-line pb-4">
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={showMeetup}
                                        onChange={handleMeetupToggle}
                                        className="appearance-none w-3.5 h-3.5 bg-line rounded border-line accent-brand checked:bg-brand cursor-pointer transition-colors mr-1"
                                    />
                                    Meetup
                                    </label>
                            </div>
                            
                            {showMeetup && (
                                <input 
                                    type="time"
                                    name="meetupTime"
                                    value={form.meetupTime || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                {isOvernightEvent(form) && (<p className="text-xs text-brand pt-1">Ende am Folgetag</p>)}
                            </div>
                            
                        </div>
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
                    <div>
                        {messages.map((m) => (
                            <div key={m.id}>{m.content}</div>
                        ))}
                        <div className="flex flex-row items-center justify-between">
                            <input 
                                type="text" 
                                value={messageContent} 
                                onChange={handleInputChange}
                                placeholder="Nachricht schreiben..."
                                className="p-1 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                            <BasicButton icon={<SendHorizonal />} onClick={handleSendMessage}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
