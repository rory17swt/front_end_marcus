import { useNavigate } from "react-router"
import { useState, useContext } from 'react'

import { logIn } from "../../services/auth"
import { setToken } from "../../utils/auth"
import { UserContext } from "../../contexts/UserContext"

export default function AdminLogin() {
    const { setUser } = useContext(UserContext)

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = ({ target: { name, value } }) => {
        setFormData({ ...formData, [name]: value })
        setError({ ...error, [name]: '' })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            const { data } = await logIn(formData)
            setToken(data.access)
            setUser(data.user)
            navigate('/')
        } catch (error) {
            setError(error.response?.data || {})
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#E8DCC8] flex items-center justify-center px-4 py-10">
            <section className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 md:p-10">

                <h1 className="text-3xl md:text-4xl font-serif text-center mb-8 text-gray-800">
                    Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 font-body">
                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Enter username"
                            required
                            onChange={handleChange}
                            value={formData.username}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.username && (
                            <p className="text-red-600 text-sm mt-1">{error.username}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter password"
                            required
                            onChange={handleChange}
                            value={formData.password}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.password && (
                            <p className="text-red-600 text-sm mt-1">{error.password}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md hover:bg-[#B59770] transition-colors font-medium disabled:opacity-60"
                    >
                        {isLoading ? "Logging In..." : "Login"}
                    </button>
                </form>

            </section>
        </div>
    )
}
