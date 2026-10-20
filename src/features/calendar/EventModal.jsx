import { useState } from "react";
import { CircleX, Save } from "lucide-react";
import BasicButton from "../../components/BasicButton";

export default function EventModal ({isOpen, onClose, onSave}) {

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !date) {
            alert("Please set Title and Date!");
            return;
        }

        onSave({
            id: crypto.randomUUID(),
            title,
            date, // Format: YYY-MM-DD
            description
        });

        setTitle('');
        setDate('');
        setDescription('');
        onClose();
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 border border-line">
                <div className="flex justify-between items-center mb-4 border-b border-line pb-2">
                    <h3>New Event</h3>
                    <BasicButton icon={<CircleX />} onClick={onClose}/>
                </div>
                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">*Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">*Date</label>
                        <input 
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional Details"
                            rows="3"
                            className="w-full p-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
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
