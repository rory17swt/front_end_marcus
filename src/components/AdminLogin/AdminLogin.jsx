import { useNavigate } from "react-router"
import { useState, useContext } from 'react'

import { logIn } from "../../services/auth"
import { setToken, getUserFromToken } from "../../utils/auth"
import { UserContext } from "../../contexts/UserContext"


export default function AdminLogin() {
    const { user, setUser } = useContext(UserContext)

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
            setUser(getUserFromToken())
            navigate('/')
        } catch (error) {
            setError(error.response.data)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div>
            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Admin Login</h1>

                    {/* Username */}
                    <div>
                        <label htmlFor="username">Username: </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Username"
                            required
                            onChange={handleChange}
                            value={formData.username}
                        />
                        {error.username && <p>{error.username}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password">Password: </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            required
                            onChange={handleChange}
                            value={formData.password}
                        />
                        {error.password && <p>{error.password}</p>}
                    </div>

                    {/* Submit Button */}
                    <button disabled={isLoading}>
                        {isLoading ? "Loging In..." : "Login"}
                    </button>
                </form>
            </section>
        </div>
    )
}