import Navbar from './components/navbar'
import { Outlet } from 'react-router-dom'


function App() {
  return(
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App
