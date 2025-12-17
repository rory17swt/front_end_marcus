import { Routes, Route, useLocation } from "react-router"
import { useState, useEffect } from 'react'

import Home from './components/Home/Home'
import Media from './components/Media/Media'
import MediaEdit from "./components/MediaEdit/MediaEdit"
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
    setIsPageReady(false)
    const timer = setTimeout(() => {
      setIsPageReady(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {!isPageReady ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex-1">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path="/media/:id/edit" element={<MediaEdit />} />
              <Route path='/media/create' element={<MediaForm />} />
              <Route path='/media' element={<Media />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/adminLogin' element={<AdminLogin />} />
              <Route path='/bioForm' element={<BioForm />} />
              <Route path='/events/create' element={<EventCreate />} />
              <Route path='/events/:eventId/update' element={<EventUpdate />} />
            </Routes>
          </div>
          <Footer />
        </>
      )}
    </div>
  )
}

export default App