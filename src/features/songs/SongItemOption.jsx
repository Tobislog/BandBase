export default function SongItemOption ({
    title, 
    type, 
    name, 
    value, 
    onChange,
    onBlur,
    disabled = false,
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs">{title}</label>
            <input 
                type={type} 
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`box-border border border-line bg-surface-accent rounded hover:border-line-accent ${(type === 'number') ? 'w-12' : 'w-full'}`}/>
        </div>
    );
}
