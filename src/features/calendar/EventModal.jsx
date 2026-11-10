import { useState, useEffect } from "react";
import { CircleX, Save, SendHorizonal, Trash } from "lucide-react";
import BasicButton from "../../components/BasicButton";
import ChatMessage from "../../components/ChatMessage";
import { toEventForm } from "../../utils/event";
import { addHoursToTime, isOvernightEvent } from "../../utils/date";
import { useChannels } from "../../context/ChannelProvider";
import { useBand } from "../../context/BandProvider";
import MessageWidget from "../messages/MessageWidget";

export default function EventModal ({ event, onClose, onSave, onDelete}) {
    const { canManage } = useBand();
    const {setActiveChannelId, messages, sendMessage, messagesLoading, error: channelError,} = useChannels();

    const [form, setForm] = useState(() => toEventForm(event));
    const [messageContent, setMessageContent] = useState("");
    const [endTimeTouched, setEndTimeTouched] = useState(false);
    const [showMeetup, setShowMeetup] = useState(Boolean(event?.meetupTime));
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setActiveChannelId(event?.channelId ?? null)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canManage) return;

        if (!form.title || !form.date || !form.startTime) {
            setError('Bitte Titel, Datum und Anfangszeit setzen.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.message || 'Event konnte nicht gespeichert werden.');
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!event?.id || !canManage) return;

        setDeleting(true);
        setError('');

        try {
            await onDelete(event.id);
            onClose();
        } catch (err) {
            setError(err.message || 'Event konnte nicht gelöscht werden.');
            setDeleting(false);
        }
    }

    const handleInputChange = (e) => {
        setMessageContent(e.target.value);
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!event?.channelId) return;
        if(!messageContent.trim()) return;

        try {
            await sendMessage(event.channelId, messageContent);
            setMessageContent('');
        } catch (err) {
            setError(err.message || 'Nachricht konnte nicht gesendet werden.');
        }
    };

    const disabled = !canManage || saving || deleting;
    const visibleError = error || channelError;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-line overflow-hidden">
                <div className="flex justify-between items-center p-6 pb-4 border-b border-line bg-surface z-10">
                    <h3 className="text-lg font-semibold">{form.title}</h3>
                    <BasicButton icon={<CircleX />} onClick={onClose} />
                </div>
                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    {visibleError && (
                        <div className="rounded-md border border-red-500/40 bg-red-400/10 px-3 py-2 text-sm text-red-500">
                            {visibleError}
                        </div>
                    )}
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
                                disabled={!canManage}
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
                                disabled={!canManage}
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
                                        disabled={!canManage}
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
                                    disabled={!canManage}
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
                                    disabled={!canManage}
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
                                    disabled={!canManage}
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
                                disabled={!canManage}
                            >
                                <option value="rehearsal">Rehearsal</option>
                                <option value="gig">Gig</option>
                                <option value="other">Other</option>
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
                                disabled={!canManage}
                            />
                        </div>
                        {canManage && (
                            <div className="flex justify-end gap-4">
                                {event?.id && (
                                    <BasicButton 
                                        icon={<Trash />}
                                        onClick={handleDelete}
                                        isDelete
                                        disabled={disabled}
                                    />
                                )}
                                <BasicButton 
                                    icon={<Save />}
                                    onClick={handleSubmit}
                                    disabled={disabled}
                                />
                            </div>
                        )}
                    </form>
                    {event?.channelId ? (
                        <MessageWidget onError={(msg) => setError(msg)}/>
                    ) : (
                        <p className="text-sm text-copy/60">
                            Nachrichten sind nach dem Speichern des Events verfügbar.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
