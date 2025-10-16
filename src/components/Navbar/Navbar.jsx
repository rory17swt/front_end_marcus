import { NavLink } from "react-router"
import { useContext } from "react"
import { UserContext } from "../../contexts/UserContext"
import { removeToken } from "../../utils/auth"
import './Navbar.css'


export default function Navbar() {
    const { user, setUser } = useContext(UserContext)

    const signOut = () => {
        removeToken()
        setUser(null)
    }

    return (
        <header>
            <nav className="nav">
                {/* Public Links - Always visible */}
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/media'>Media</NavLink>
                <NavLink to='/contact'>Contact</NavLink>

                {user && (
                    // Admin Links - Only visible when signed in
                    <>
                        <NavLink to='/bioForm'>Bio Form</NavLink>
                        <NavLink to='/events/create'>Event Create</NavLink>
                        <NavLink to='/media/create'>Media Form</NavLink>
                        <NavLink to='/' onClick={signOut}>Sign Out</NavLink>
                    </>
                )}
            </nav>
        </header>
    )
}