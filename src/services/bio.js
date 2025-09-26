import axios from 'axios'
import { getToken } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Headers
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}`,
    },
})

// Auth GET
export const getAuthBio = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/bio/`, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Update - PATCH
export const updateBio = async (formData) => {
    try {
        const response = await axios.patchForm(`${BASE_URL}/bio/`, formData, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
} 

// Public GET
export const getPublicBio = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/bio/public/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}