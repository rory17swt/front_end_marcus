import axios from 'axios'
import { getToken } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Headers
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}`,
    },
})

// Index
export const getAllEvents = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/events/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Show - GET event ID
export const getSingleEvent = async (eventId) => {
    try {
        const response = await axios.get(`${BASE_URL}/events/${eventId}/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Create
export const createEvent = async (formData) => {
    try {
        const response = await axios.postForm(`${BASE_URL}/events/`, formData, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Update
export const updateEvent = async (eventId, formData) => {
    try {
        const response = await axios.putForm(`${BASE_URL}/events/${eventId}/`, formData, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Delete
export const deleteEvent = async (eventId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/events/${eventId}/`, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}