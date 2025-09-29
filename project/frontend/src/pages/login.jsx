import Navbar from "../components/navbar.jsx";
import './login.css';
function Login() {
    return (
        <div className="Login">
            <Navbar />
            <div className="Cuerpo">
                <h1>Bienvenido a la página de inicio</h1>
                <p>Esta es la página principal de la aplicación.</p>
            </div>
        </div>
    );
}
export default Login;