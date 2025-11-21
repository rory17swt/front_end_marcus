import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { submitContactForm } from "../../services/contact";
import { getCSRF } from "../../services/contact";

export default function Contact() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showFailedPopup, setShowFailedPopup] = useState(false);

    const navigate = useNavigate()

    useEffect(() => {
        getCSRF();
    }, []);

    function handleChange({ target: { name, value } }) {
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        setError({});
        setShowSuccessPopup(false);
        setShowFailedPopup(false);

        const encodedData = new URLSearchParams(formData);

        try {
            await submitContactForm(encodedData);
            setShowSuccessPopup(true);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setShowFailedPopup(true);
            setError(error.response?.data || { form: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full bg-gray-50 flex flex-col items-center py-12">
            {/* Form Section */}
            <section className="flex flex-col lg:flex-row w-full max-w-6xl px-6 lg:px-0 gap-10">
                {/* Left Image */}
                <div className="lg:w-1/2">
                    <img
                        src="/Contact page.jpg"
                        alt="Contact Illustration"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Right Form */}
                <div className="lg:w-1/2 p-8 rounded-lg">
                    {error.form && <p className="text-red-600 mb-4">{error.form}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700" htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    placeholder="First Name"
                                    onChange={handleChange}
                                    value={formData.first_name}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                                />
                                {error.first_name && <p className="text-red-500 text-sm">{error.first_name}</p>}
                            </div>

                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700" htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    placeholder="Last Name"
                                    onChange={handleChange}
                                    value={formData.last_name}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                                />
                                {error.last_name && <p className="text-red-500 text-sm">{error.last_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-gray-700" htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Your Email"
                                onChange={handleChange}
                                value={formData.email}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                            {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-gray-700" htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                placeholder="Subject"
                                onChange={handleChange}
                                value={formData.subject}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                            />
                            {error.subject && <p className="text-red-500 text-sm">{error.subject}</p>}
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-gray-700" htmlFor="message">Message</label>
                            <textarea
                                name="message"
                                id="message"
                                placeholder="Your message..."
                                onChange={handleChange}
                                value={formData.message}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-2 focus:ring-gold focus:outline-none resize-none"
                            />
                            {error.message && <p className="text-red-500 text-sm">{error.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#C4A77D] text-white py-2 rounded-md hover:bg-[#B59770] transition-colors font-medium disabled:opacity-60"
                        >
                            {isLoading ? 'Sending Message...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </section>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F5EFE7] border border-[#C4A77D] p-6 rounded-lg shadow-lg z-50 max-w-xl text-center">
                    <p className="text-gray-800 font-semibold mb-4">
                        Thanks for reaching out! Your message has been sent and Marcus will get back to you soon.
                    </p>
                    <button
                        onClick={() => {
                            setShowSuccessPopup(false);
                            navigate('/');
                        }}
                        className="bg-[#C4A77D] text-white px-4 py-2 rounded-md hover:bg-[#B59770]"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Failed Popup */}
            {showFailedPopup && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 p-6 rounded-lg shadow-lg z-50 max-w-xl text-center">
                    <p className="text-red-800 font-semibold mb-4">
                        Message Failed. Something went wrong and your message wasn't sent. Please try again later or email Marcus at marcus@swietlicki.eu.
                    </p>
                    <button
                        onClick={() => setShowFailedPopup(false)}
                        className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
