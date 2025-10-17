import { useState, useEffect } from "react"
import { submitContactForm } from "../../services/contact"
import Spinner from '../Spinner/Spinner'
import { getCSRF } from "../../services/contact"

export default function Contact() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        subject: '',
        message: ''
    })

    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [showFailedPopup, setShowFailedPopup] = useState(false)

    useEffect(() => {
        getCSRF()
    }, [])

    function handleChange({ target: { name, value } }) {
        setFormData({ ...formData, [name]: value })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setError({})
        setShowSuccessPopup(false)
        setShowFailedPopup(false)

        const encodedData = new URLSearchParams(formData)

        try {
            await submitContactForm(encodedData)
            setShowSuccessPopup(true)
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                subject: '',
                message: ''
            })
        } catch (error) {
            setShowFailedPopup(true)
            setError(error.response?.data || { form: 'An error occurred. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            {/* Cover Photo */}
            <section style={{ marginBottom: '40px' }}>
                <img 
                    src="/Contact page.jpg" 
                    alt="Contact" 
                    style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block'
                    }} 
                />
            </section>

            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Contact</h1>

                    {error.form && <p>{error.form}</p>}

                    {/* First Name */}
                    <div>
                        <label htmlFor="first_name">First Name: </label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            placeholder="First Name"
                            onChange={handleChange}
                            value={formData.first_name}
                            required
                        />
                        {error.first_name && <p>{error.first_name}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="last_name">Last Name: </label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            placeholder="Last Name"
                            onChange={handleChange}
                            value={formData.last_name}
                            required
                        />
                        {error.last_name && <p>{error.last_name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email">Email: </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Your Email"
                            onChange={handleChange}
                            value={formData.email}
                            required
                        />
                        {error.email && <p>{error.email}</p>}
                    </div>

                    {/* Subject */}
                    <div>
                        <label htmlFor="subject">Subject: </label>
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            placeholder="Subject"
                            onChange={handleChange}
                            value={formData.subject}
                            required
                        />
                        {error.subject && <p>{error.subject}</p>}
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message">Message: </label>
                        <textarea
                            name="message"
                            id="message"
                            placeholder="Your message..."
                            onChange={handleChange}
                            value={formData.message}
                            required
                        />
                        {error.message && <p>{error.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button>
                        {isLoading ? <Spinner /> : 'Send Message'}
                    </button>
                </form>
            </section>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div style={{
                    position: 'fixed',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxWidth: '90%',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 10px 0', color: '#155724', fontWeight: 'bold' }}>
                        Thanks for reaching out! Your message has been sent to Marcus, and he'll get back to you as soon as possible.
                    </p>
                    <button
                        onClick={() => setShowSuccessPopup(false)}
                        style={{
                            backgroundColor: '#155724',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Failed Popup */}
            {showFailedPopup && (
                <div style={{
                    position: 'fixed',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxWidth: '90%',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 10px 0', color: '#721c24', fontWeight: 'bold' }}>
                        Message Failed.<br />
                        Something went wrong and your message couldn't be sent to Marcus. Please try again later, or contact him directly at marcus@swietlicki.eu.
                    </p>
                    <button
                        onClick={() => setShowFailedPopup(false)}
                        style={{
                            backgroundColor: '#721c24',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    )
}