export default function SongItemOption ({title, type, name, value, onChange}) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={title} className="text-xs">{title}</label>
            <input 
                type={type} 
                id={title}
                name={name}
                value={value}
                onChange={onChange} 
                className={`box-border border border-line bg-surface-accent rounded hover:border-line-accent ${(type === 'number') ? 'w-12' : 'w-full'}`}/>
        </div>
    )
}
