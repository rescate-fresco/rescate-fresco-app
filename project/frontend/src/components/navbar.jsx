import { Link } from 'react-router-dom';
import './navbar.css';
function Navbar() {
  return(
    <nav className="navbar">
        <div className='nav-izq'>
            <div className="logo">
                <Link to="/Inicio">RescateFresco</Link>
            </div>
            <ul className="nav-links">
                <li><Link to="/Inicio">Inicio</Link></li>
                <li><Link to="/Inicio/Publicar">Publicar Producto</Link></li>
            </ul>
        </div>
        <div className='nav-der'>
            <form className="search-form" role="search">
                <input type="search" placeholder="Search" aria-label="Search"/>
                <button className='button_search' type="submit">Search</button>
            </form>
            <div className="auth-buttons">
                <Link to="/Iniciar-Sesion" className="btn-login">Iniciar Sesión</Link>
                <Link to="/Registrarse" className="btn-register">Registrarse</Link>
            </div>
        </div>            
    </nav>
  );
}
export default Navbar;