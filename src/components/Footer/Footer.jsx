import { useState, useEffect } from 'react'
import { NavLink } from 'react-router'
import { FaInstagram, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <footer className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 px-6 md:px-10 py-6 md:py-5 bg-[#F5F1E8] border-t border-[#E0D5C7]">
      {/* Left - Name & Admin Login */}
      <div className="text-center md:text-left">
        <h3 className="m-0 text-lg text-gray-800 font-semibold">Marcus Swietlicki</h3>
        <NavLink 
          to='/adminLogin' 
          className="text-xs text-gray-600 no-underline block mt-1 hover:text-[#C4A77D] transition-colors"
        >
          Admin Login
        </NavLink>
      </div>

      {/* Middle - Social Icons */}
      <div className="flex gap-5 order-first md:order-none">
        <a
          href="https://www.instagram.com/marcusswietlicki_tenor/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 text-3xl hover:text-[#C4A77D] transition-colors"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.youtube.com/@marcusmacleodswietlicki959/featured"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 text-3xl hover:text-[#C4A77D] transition-colors"
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>
      </div>

      {/* Right - Copyright Info */}
      <div className="text-center md:text-right text-[10px] md:text-xs leading-relaxed text-gray-800">
        <p className="m-0">MARCUS SWIETLICKI © 2025. ALL RIGHTS RESERVED.</p>
        <p className="m-0">PHOTOGRAPHY BY KIM HARDY PHOTOGRAPHY.</p>
        <p className="m-0">WEBSITE CREATED BY RORY'S DEVELOPMENT STUDIOS.</p>
      </div>
    </footer>
  )
}