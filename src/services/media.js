import axios from 'axios'
import { getToken } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Headers
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}`,
    },
})

// Index
export const getAllMedia = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/media/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Show - GET Media Id
export const getSingleMedia = async (mediaId) => {
    try {
        const response = await axios.get(`${BASE_URL}/media/${mediaId}/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Create
export const createMedia = async (formData) => {
    try {
        const response = await axios.postForm(`${BASE_URL}/media/`, formData, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Delete
export const deleteMedia = async (mediaId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/media/${mediaId}/`, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}