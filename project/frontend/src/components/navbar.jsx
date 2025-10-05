// ...existing code...
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <Link to="/">Inicio |</Link>
            <Link to="/ofertas"> Ofertas</Link>
            {/* Agrega más enlaces si lo deseas */}
        </nav>
    );
}

export default Navbar;
// ...existing code...