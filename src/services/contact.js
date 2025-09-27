import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = import.meta.env.VITE_API_BASE_URL


// GET CSRF token from cookie
const getCSRFToken = () => Cookies.get('csrftoken')


// Fetch CSRF cookie
export const getCSRF = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/contact/csrf/`, {
            withCredentials: true
        })
        return response
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
        throw error
    }
}

// Contact Form Submission
export const submitContactForm = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/contact/submit/`, formData, {
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
        })
        return response
    } catch (error) {
        console.error('Failed to submit contact form:', error.response.data || error)
        throw error
    }
}