import { Routes, Route } from "react-router"

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


function App() {
  return (
    <>
    <h1 Marcus Portfolio></h1>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/media' element={<Media />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/adminLogin' element={<AdminLogin />} />
      <Route path='/bioForm' element={<BioForm />} />
      <Route path='/events/create' element={<EventCreate />} />
      <Route path='/events/:eventId/update' element={<EventUpdate />} />
      <Route path='/mediaForm' element={<MediaForm />} />
    </Routes>
    <Footer />
    </>
  )
}



export default App