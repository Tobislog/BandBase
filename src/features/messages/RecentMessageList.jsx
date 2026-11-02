const formatMessageTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getAuthorName = (message) => {
    const author = message.author;
    if (!author) return 'Unbekannt';

    return [author.firstName, author.lastName].filter(Boolean).join(' ') || 'Unbekannt';
};

const getInitials = (message) => {
    const author = message.author;
    if (!author) return '?';

    return `${author.firstName?.charAt(0) ?? ''}${author.lastName?.charAt(0) ?? ''}`.toUpperCase() || '?';
};

export default function RecentMessageList ({ messages }) {
    return (
        <div className="flex flex-col divide-y divide-line">
            {messages.map((message) => (
                <div key={message.id} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                    <div
                        style={{ backgroundColor: message.author?.color }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-heading"
                    >
                        {getInitials(message)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                            <p className="text-xs font-semibold text-heading">
                                {getAuthorName(message)}
                            </p>
                            <span className="text-[11px] text-copy/60">
                                {formatMessageTime(message.createdAt)}
                            </span>
                        </div>

                        <p className="line-clamp-2 break-words text-sm text-copy">
                            {message.content}
                        </p>

                        <p className="mt-0.5 text-[11px] text-copy/60">
                            in {message.channelName}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
