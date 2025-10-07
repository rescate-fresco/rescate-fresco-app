import Navbar from "../components/navbar.jsx";
import './store.css';

function Store() {
    return (
        <div className="Store">
            <Navbar />
            <div className="Cuerpo">
                <h2>Tienda</h2>
                <p>Bienvenido a la tienda. Aquí podrás ver y comprar productos rescatados.</p>
            </div>
        </div>
    );
}
export default Store;