import { Routes, Route, useLocation } from "react-router"
import { useState, useEffect } from 'react'

import Home from './components/Home/Home'
import Media from './components/Media/Media'
import Contact from './components/Contact/Contact'
import AdminLogin from './components/AdminLogin/AdminLogin'
import BioForm from './components/BioForm/BioForm'
import EventCreate from "./components/EventCreate/EventCreate"
import EventUpdate from "./components/EventUpdate/EventUpdate"
import MediaForm from './components/MediaForm/MediaForm'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Spinner from './components/Spinner/Spinner'


function App() {
  const [isPageReady, setIsPageReady] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Show loading when route changes
    setIsPageReady(false)
    
    // Small delay to ensure content loads smoothly
    const timer = setTimeout(() => {
      setIsPageReady(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <Navbar />
      
      {!isPageReady ? (
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      ) : (
        <>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/media' element={<Media />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/adminLogin' element={<AdminLogin />} />
            <Route path='/bioForm' element={<BioForm />} />
            <Route path='/events/create' element={<EventCreate />} />
            <Route path='/events/:eventId/update' element={<EventUpdate />} />
            <Route path='/media/create' element={<MediaForm />} />
          </Routes>
          <Footer />
        </>
      )}
    </>
  )
}

export default App