import { useState, useEffect } from 'react'
import { NavLink } from 'react-router'
import { FaInstagram, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delay footer appearance by 1 second
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #ddd',
      marginTop: '40px',
      color: '#000'
    }}>
      {/* Left - Name & Admin Login */}
      <div>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#000' }}>Marcus Swietlicki</h3>
        <NavLink 
          to='/adminLogin' 
          style={{ 
            fontSize: '12px', 
            color: '#666', 
            textDecoration: 'none',
            display: 'block',
            marginTop: '5px'
          }}
        >
          Admin Login
        </NavLink>
      </div>

      {/* Middle - Social Icons */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <a
          href="https://www.instagram.com/marcusswietlicki_tenor/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#000', fontSize: '28px' }}
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.youtube.com/@marcusmacleodswietlicki959/featured"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#000', fontSize: '28px' }}
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>
      </div>

      {/* Right - Copyright Info */}
      <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.6', color: '#000' }}>
        <p style={{ margin: 0, color: '#000' }}>MARCUS SWIETLICKI © 2025. ALL RIGHTS RESERVED.</p>
        <p style={{ margin: 0, color: '#000' }}>PHOTOGRAPHY BY [PHOTOGRAPHER NAME].</p>
        <p style={{ margin: 0, color: '#000' }}>WEBSITE CREATED BY RORY SWIETLICKI.</p>
      </div>
    </footer>
  )
}