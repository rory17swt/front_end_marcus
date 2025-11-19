import { NavLink } from "react-router"
import { useContext } from "react"
import { UserContext } from "../../contexts/UserContext"
import { removeToken } from "../../utils/auth"


export default function Navbar() {
    const { user, setUser } = useContext(UserContext)

    const signOut = () => {
        removeToken()
        setUser(null)
    }

    return (
        <header className="bg-[#F5F1E8] shadow-md sticky top-0 z-50">
            <nav className="w-full flex justify-between items-center px-4 py-2">

                {/* Left Side */}
                <div className="flex gap-6">
                    <NavLink
                        to='/'
                        className={({ isActive }) =>
                            `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to='/media'
                        className={({ isActive }) =>
                            `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                        }
                    >
                        Media
                    </NavLink>
                    <NavLink
                        to='/contact'
                        className={({ isActive }) =>
                            `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                        }
                    >
                        Contact
                    </NavLink>
                </div>

                {/* Right Side */}
                {user && (
                    <div className="flex gap-6">
                        <NavLink
                            to='/bioForm'
                            className={({ isActive }) =>
                                `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                            }
                        >
                            Bio Form
                        </NavLink>
                        <NavLink
                            to='/events/create'
                            className={({ isActive }) =>
                                `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                            }
                        >
                            Event Create
                        </NavLink>
                        <NavLink
                            to='/media/create'
                            className={({ isActive }) =>
                                `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`
                            }
                        >
                            Media Form
                        </NavLink>
                        <NavLink
                            to='/'
                            onClick={signOut}
                            className="text-gray-800 font-medium hover:text-[#8B7355] transition-colors"
                        >
                            Sign Out
                        </NavLink>
                    </div>
                )}
            </nav>
        </header>
    )
}