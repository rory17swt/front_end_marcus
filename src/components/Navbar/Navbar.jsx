import { NavLink } from "react-router"
import './Navbar.css'


export default function Navbar() {
    return (
        <header>
            <nav className="nav">
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/media'>Media</NavLink>
                <NavLink to='/contact'>Contact</NavLink>
                <NavLink to='/adminLogin'>Admin Login</NavLink>
                <NavLink to='/bioForm'>Bio Form</NavLink>
                <NavLink to='/events/create'>Event Create</NavLink>
                <NavLink to='/events/:eventId/update'>Event Update</NavLink>
                <NavLink to ='/mediaForm'>Media Form</NavLink>
            </nav>
        </header>
    )
}