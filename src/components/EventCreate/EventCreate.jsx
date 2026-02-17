import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createEvent } from "../../services/events"

export default function EventCreate() {
    const { user } = useContext(UserContext)

    const [mode, setMode] = useState('single') // 'single' or 'multi'

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        event_url: '',
        image: ''
    })

    // Multi-date entries: array of { date, time, location }
    const [dateEntries, setDateEntries] = useState([
        { date: '', time: '', location: '' }
    ])

    const [previewImage, setPreviewImage] = useState(null)
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })

    const navigate = useNavigate()

    function handleChange({ target: { name, value, type, files } }) {
        if (type === 'file') {
            const file = files[0]
            if (file) {
                setPreviewImage(URL.createObjectURL(file))
                setFormData({ ...formData, [name]: file })
            }
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    function handleDateEntryChange(index, field, value) {
        setDateEntries(prev => prev.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry
        ))
    }

    function addDateEntry() {
        setDateEntries(prev => [...prev, { date: '', time: '', location: '' }])
    }

    function removeDateEntry(index) {
        if (dateEntries.length <= 1) return
        setDateEntries(prev => prev.filter((_, i) => i !== index))
    }

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage)
        }
    }, [previewImage])

    // Single event submit (unchanged logic)
    async function handleSingleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const submitData = {
                ...formData,
                datetime: `${formData.date}T${formData.time}`
            }
            delete submitData.date
            delete submitData.time
            await createEvent(submitData)
            navigate('/')
        } catch (error) {
            setError(error.response?.data || {})
        } finally {
            setIsLoading(false)
        }
    }

    // Multi-date submit — loops existing endpoint
    async function handleMultiSubmit(event) {
        event.preventDefault()

        // Validate all date entries have date and time
        const invalidEntries = dateEntries.filter(e => !e.date || !e.time)
        if (invalidEntries.length > 0) {
            setError({ dates: 'All date entries must have a date and time.' })
            return
        }

        setIsLoading(true)
        setSubmitProgress({ current: 0, total: dateEntries.length })
        const errors = []

        for (let i = 0; i < dateEntries.length; i++) {
            const entry = dateEntries[i]
            try {
                const submitData = {
                    title: formData.title,
                    event_url: formData.event_url,
                    image: formData.image,
                    location: entry.location || formData.location,
                    datetime: `${entry.date}T${entry.time}`
                }
                await createEvent(submitData)
                setSubmitProgress({ current: i + 1, total: dateEntries.length })
            } catch (err) {
                errors.push(`Date ${i + 1} (${entry.date}): ${err.response?.data?.detail || 'Failed'}`)
            }
        }

        setIsLoading(false)
        setSubmitProgress({ current: 0, total: 0 })

        if (errors.length > 0) {
            setError({ multi: errors })
        } else {
            navigate('/')
        }
    }

    // Time dropdown options (shared)
    const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
        const hours = Math.floor(i / 4).toString().padStart(2, '0')
        const minutes = ((i % 4) * 15).toString().padStart(2, '0')
        return { value: `${hours}:${minutes}`, label: `${hours}:${minutes}` }
    })

    return (
        <div className="min-h-screen bg-[#E8DCC8] flex justify-center px-4 py-10">
            <section className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 md:p-10">

                <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-6">
                    Add an Upcoming Event
                </h1>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setMode('single')}
                            className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'single'
                                    ? 'bg-[#C4A77D] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Single Date
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('multi')}
                            className={`px-5 py-2 text-sm font-medium transition-colors ${mode === 'multi'
                                    ? 'bg-[#C4A77D] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Multiple Dates
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={mode === 'single' ? handleSingleSubmit : handleMultiSubmit}
                    className="space-y-6 font-body"
                >
                    {/* ── Shared Fields ── */}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block mb-1 text-gray-700 font-medium">
                            Event Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                                focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.title && <p className="text-red-600 text-sm">{error.title}</p>}
                    </div>

                    {/* ── Single Mode: Date & Time ── */}
                    {mode === 'single' && (
                        <>
                            <div>
                                <label htmlFor="date" className="block mb-1 text-gray-700 font-medium">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 
                                        focus:outline-none focus:border-[#C4A77D] transition-colors"
                                />
                                {error.date && <p className="text-red-600 text-sm">{error.date}</p>}
                            </div>

                            <div>
                                <label htmlFor="time" className="block mb-1 text-gray-700 font-medium">
                                    Time
                                </label>
                                <select
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 
                                        focus:outline-none focus:border-[#C4A77D] transition-colors"
                                >
                                    <option value="">Select time</option>
                                    {timeOptions.map((opt, i) => (
                                        <option key={i} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {error.time && <p className="text-red-600 text-sm">{error.time}</p>}
                            </div>
                        </>
                    )}

                    {/* Location (shared — default for all dates in multi mode) */}
                    <div>
                        <label htmlFor="location" className="block mb-1 text-gray-700 font-medium">
                            {mode === 'multi' ? 'Default Location' : 'Location'}
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder={mode === 'multi' ? 'Main venue (can override per date below)' : ''}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                                focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.location && <p className="text-red-600 text-sm">{error.location}</p>}
                    </div>

                    {/* Event URL */}
                    <div>
                        <label htmlFor="event_url" className="block mb-1 text-gray-700 font-medium">
                            Event URL
                        </label>
                        <input
                            type="url"
                            id="event_url"
                            name="event_url"
                            value={formData.event_url}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                                focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.event_url && <p className="text-red-600 text-sm">{error.event_url}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <label htmlFor="image" className="block mb-2 text-gray-700 font-medium">
                            Event Image
                        </label>
                        {(previewImage || formData.image) && (
                            <img
                                src={previewImage || formData.image}
                                alt="Event Preview"
                                className="w-full h-64 object-cover rounded-lg border border-gray-300 mb-3 shadow-sm"
                            />
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                        {error.image && <p className="text-red-600 text-sm">{error.image}</p>}
                    </div>

                    {/* ── Multi Mode: Date Entries ── */}
                    {mode === 'multi' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-serif text-gray-800">
                                    Dates & Times
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {dateEntries.length} date{dateEntries.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {error.dates && (
                                <p className="text-red-600 text-sm">{error.dates}</p>
                            )}

                            {error.multi && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-red-700 text-sm font-medium mb-1">
                                        Some events failed to create:
                                    </p>
                                    {error.multi.map((err, i) => (
                                        <p key={i} className="text-red-600 text-sm">{err}</p>
                                    ))}
                                </div>
                            )}

                            {dateEntries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Date {index + 1}
                                        </span>
                                        {dateEntries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDateEntry(index)}
                                                className="text-red-400 hover:text-red-600 text-sm transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Date */}
                                        <div>
                                            <label className="block mb-1 text-gray-600 text-sm">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={entry.date}
                                                onChange={(e) => handleDateEntryChange(index, 'date', e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                                    focus:outline-none focus:border-[#C4A77D] transition-colors"
                                            />
                                        </div>

                                        {/* Time */}
                                        <div>
                                            <label className="block mb-1 text-gray-600 text-sm">
                                                Time
                                            </label>
                                            <select
                                                value={entry.time}
                                                onChange={(e) => handleDateEntryChange(index, 'time', e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                                    focus:outline-none focus:border-[#C4A77D] transition-colors"
                                            >
                                                <option value="">Select time</option>
                                                {timeOptions.map((opt, i) => (
                                                    <option key={i} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Location Override */}
                                    <div>
                                        <label className="block mb-1 text-gray-600 text-sm">
                                            Location override <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={entry.location}
                                            onChange={(e) => handleDateEntryChange(index, 'location', e.target.value)}
                                            placeholder={formData.location || 'Uses default location'}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                                focus:outline-none focus:border-[#C4A77D] transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Add Another Date Button */}
                            <button
                                type="button"
                                onClick={addDateEntry}
                                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 
                                    text-gray-500 hover:border-[#C4A77D] hover:text-[#C4A77D] 
                                    transition-colors text-sm font-medium"
                            >
                                + Add Another Date
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md 
                            hover:bg-[#B59770] transition disabled:opacity-60 flex justify-center items-center"
                    >
                        {isLoading
                            ? mode === 'multi'
                                ? `Adding Event ${submitProgress.current}/${submitProgress.total}...`
                                : "Adding Event..."
                            : mode === 'multi'
                                ? `Add ${dateEntries.length} Event${dateEntries.length !== 1 ? 's' : ''}!`
                                : "Add Event!"
                        }
                    </button>
                </form>
            </section>
        </div>
    )
}