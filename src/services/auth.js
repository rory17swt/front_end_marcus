import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const logIn = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/login/`, formData)
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}