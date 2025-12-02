import axios from 'axios'
import { getToken } from '../utils/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Headers
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
})

// ============ MEDIA ============

// Index (with optional production filter)
export const getAllMedia = async (productionSlug = null) => {
    try {
        const url = productionSlug 
            ? `${BASE_URL}/media/?production=${productionSlug}`
            : `${BASE_URL}/media/`
        const response = await axios.get(url)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Show
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

// Update
export const updateMedia = async (mediaId, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/media/${mediaId}/`, data, authHeaders())
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

// ============ PRODUCTIONS ============

// Index
export const getAllProductions = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/productions/`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Create
export const createProduction = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/productions/`, data, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Update
export const updateProduction = async (slug, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/productions/${slug}/`, data, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

// Delete
export const deleteProduction = async (slug) => {
    try {
        const response = await axios.delete(`${BASE_URL}/productions/${slug}/`, authHeaders())
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}