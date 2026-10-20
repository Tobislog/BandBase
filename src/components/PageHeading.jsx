export default function PageHeading ({title, subtitle, button }) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-heading">{title}</h1>
                <p className="mt-1 text-sm ">{subtitle}</p>
            </div>
            {button}
        </div>
    )
}
