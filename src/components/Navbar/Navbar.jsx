import { NavLink } from "react-router"
import { useContext, useState } from "react"
import { UserContext } from "../../contexts/UserContext"
import { removeToken } from "../../utils/auth"
import { HiMenu, HiX } from "react-icons/hi"

export default function Navbar() {
    const { user, setUser } = useContext(UserContext)
    const [isOpen, setIsOpen] = useState(false)

    const signOut = () => {
        removeToken()
        setUser(null)
        setIsOpen(false)
    }

    const closeMenu = () => setIsOpen(false)

    const linkClass = ({ isActive }) =>
        `text-gray-800 font-medium hover:text-[#C4A77D] transition-colors ${isActive ? 'text-[#C4A77D] underline' : ''}`

    return (
        <header className="bg-[#F5F1E8] shadow-md sticky top-0 z-50">
            <nav className="w-full flex justify-between items-center px-4 py-2 relative">

                {/* Hamburger Button - Mobile Only */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-gray-800 text-2xl p-1"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <HiX /> : <HiMenu />}
                </button>

                {/* Desktop Navigation - Left Side */}
                <div className="hidden md:flex gap-6">
                    <NavLink to='/' className={linkClass}>
                        Home
                    </NavLink>
                    <NavLink to='/media' className={linkClass}>
                        Media
                    </NavLink>
                    <NavLink to='/contact' className={linkClass}>
                        Contact
                    </NavLink>
                </div>

                {/* Desktop Navigation - Right Side (Admin) */}
                {user && (
                    <div className="hidden md:flex gap-6">
                        <NavLink to='/bioForm' className={linkClass}>
                            Bio Form
                        </NavLink>
                        <NavLink to='/events/create' className={linkClass}>
                            Event Create
                        </NavLink>
                        <NavLink to='/media/create' className={linkClass}>
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

                {/* Mobile Dropdown Menu */}
                {isOpen && (
                    <>
                        {/* Overlay to close menu when clicking outside */}
                        <div 
                            className="fixed inset-0 z-40 md:hidden"
                            onClick={closeMenu}
                        />

                        {/* Dropdown */}
                        <div className="absolute top-full left-0 mt-1 bg-[#F5F1E8] shadow-lg rounded-md z-50 md:hidden">
                            <div className="flex flex-col py-2">
                                <NavLink to='/' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                    Home
                                </NavLink>
                                <NavLink to='/media' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                    Media
                                </NavLink>
                                <NavLink to='/contact' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                    Contact
                                </NavLink>

                                {user && (
                                    <>
                                        <hr className="border-[#E0D5C7] my-2 mx-4" />
                                        <NavLink to='/bioForm' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                            Bio Form
                                        </NavLink>
                                        <NavLink to='/events/create' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                            Event Create
                                        </NavLink>
                                        <NavLink to='/media/create' className={`px-6 py-2 ${linkClass({ isActive: false })}`} onClick={closeMenu}>
                                            Media Form
                                        </NavLink>
                                        <NavLink
                                            to='/'
                                            onClick={signOut}
                                            className="px-6 py-2 text-gray-800 font-medium hover:text-[#8B7355] transition-colors"
                                        >
                                            Sign Out
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </header>
    )
}