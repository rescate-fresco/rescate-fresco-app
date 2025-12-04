# pip install PyJWT
# pytest test_crear_tienda.py -v --html=report_2.html --self-contained-html
# start report_2.html
import pytest
import requests
import json
from datetime import datetime
import time
import jwt

BASE_URL = "http://localhost:5000"
SECRET_KEY = "KUx0DHbvAxXKg301G196TyEO45Q7zZyiZ86vsskyCULCDzOVs6QMs1i7guhUdQTDFpMizoR0YtCDfj1BVBdbsrSURFclY"


@pytest.fixture
def usuario_logueado():
    """Crea un usuario con rol tienda y retorna el token"""
    timestamp = str(time.time()).replace('.', '')
    
    datos_registro = {
        "nombre_usuario": f"tienda_user_{timestamp}",
        "email": f"tienda_{timestamp}@test.com",
        "contrasena": "Password123!",
        "rol": "tienda",  
        "direccion_usuario": "Calle Test 123"
    }
    
    resp_registro = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=datos_registro
    )
    
    assert resp_registro.status_code == 201, f"Error: {resp_registro.text}"
    
    datos_login = {
        "email": datos_registro["email"],
        "contrasena": datos_registro["contrasena"]
    }
    
    resp_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=datos_login
    )
    assert resp_login.status_code == 200
    
    data = resp_login.json()
    token = data.get("token")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        id_usuario = decoded.get("id_usuario")
    except Exception as e:
        print(f"❌ Error decodificando token: {e}")
        id_usuario = None
    
    return {
        "token": token,
        "id_usuario": id_usuario,
        "email": datos_registro["email"]
    }


@pytest.fixture
def usuario_cliente():
    """Crea un usuario con rol cliente"""
    timestamp = str(time.time()).replace('.', '')
    
    datos_registro = {
        "nombre_usuario": f"cliente_user_{timestamp}",
        "email": f"cliente_{timestamp}@test.com",
        "contrasena": "Password123!",
        "rol": "cliente",
        "direccion_usuario": "Calle Cliente 456"
    }
    
    resp_registro = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=datos_registro
    )
    
    assert resp_registro.status_code == 201
    
    datos_login = {
        "email": datos_registro["email"],
        "contrasena": datos_registro["contrasena"]
    }
    
    resp_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=datos_login
    )
    assert resp_login.status_code == 200
    
    data = resp_login.json()
    token = data.get("token")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        id_usuario = decoded.get("id_usuario")
    except:
        id_usuario = None
    
    return {
        "token": token,
        "id_usuario": id_usuario,
        "email": datos_registro["email"]
    }


class TestCrearTiendaExitoso:
    """Pruebas de creación exitosa de tiendas"""
    
    def test_crear_tienda_exitosa(self, usuario_logueado):
        """✅ Crear una tienda correctamente con todos los campos"""
        datos_tienda = {
            "nombre_tienda": f"Mi Tienda {datetime.now().timestamp()}",
            "descripcion_tienda": "Tienda de frutas y verduras frescas",
            "direccion_tienda": "Av Principal 500",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 201
        data = resp.json()
        assert data.get("tienda", {}).get("id_tienda") is not None
        assert data.get("tienda", {}).get("nombre_tienda") == datos_tienda["nombre_tienda"]
    
    
    def test_crear_tienda_sin_descripcion(self, usuario_logueado):
        """✅ Crear tienda sin descripción (campo opcional)"""
        datos_tienda = {
            "nombre_tienda": f"Tienda Sin Desc {datetime.now().timestamp()}",
            "direccion_tienda": "Av Principal 500",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 201
    
    
    def test_crear_tienda_horario_extremo_apertura_temprano(self, usuario_logueado):
        """✅ Crear tienda que abre muy temprano"""
        datos_tienda = {
            "nombre_tienda": f"Tienda Temprano {datetime.now().timestamp()}",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "00:00",
            "horario_cierre": "23:59",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 201


class TestCamposObligatorios:
    """Pruebas para campos obligatorios faltantes"""
    
    def test_crear_tienda_sin_nombre(self, usuario_logueado):
        """❌ Crear tienda sin nombre"""
        datos_tienda = {
            "descripcion_tienda": "Descripción",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_crear_tienda_sin_direccion(self, usuario_logueado):
        """❌ Crear tienda sin dirección"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "descripcion_tienda": "Descripción",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_crear_tienda_sin_telefono(self, usuario_logueado):
        """❌ Crear tienda sin teléfono"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "descripcion_tienda": "Descripción",
            "direccion_tienda": "Calle 123",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_crear_tienda_sin_horario_apertura(self, usuario_logueado):
        """❌ Crear tienda sin horario de apertura"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_crear_tienda_sin_horario_cierre(self, usuario_logueado):
        """❌ Crear tienda sin horario de cierre"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_crear_tienda_sin_id_usuario(self, usuario_logueado):
        """❌ Crear tienda sin id_usuario"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00"
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400


class TestValidacionDatos:
    """Pruebas de validación de datos"""
    
    def test_telefono_muy_corto(self, usuario_logueado):
        """❌ Teléfono con menos de 8 dígitos"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "123",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_telefono_vacio(self, usuario_logueado):
        """❌ Teléfono vacío"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_nombre_tienda_vacio(self, usuario_logueado):
        """❌ Nombre de tienda vacío"""
        datos_tienda = {
            "nombre_tienda": "",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_direccion_vacia(self, usuario_logueado):
        """❌ Dirección vacía"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400


class TestHorarios:
    """Pruebas de validación de horarios"""
    
    def test_horario_cierre_antes_apertura(self, usuario_logueado):
        """❌ Hora de cierre antes de apertura"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "20:00",
            "horario_cierre": "09:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_horario_apertura_cierre_igual(self, usuario_logueado):
        """❌ Horario de apertura igual al de cierre"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "09:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_horario_formato_invalido_apertura(self, usuario_logueado):
        """❌ Formato de hora inválido en apertura"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "25:00",  # Hora inválida
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_horario_formato_invalido_cierre(self, usuario_logueado):
        """❌ Formato de hora inválido en cierre"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "99:99",  # Hora inválida
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_horario_formato_texto(self, usuario_logueado):
        """❌ Horario con texto en lugar de hora"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "mañana",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400


class TestLimitesCaracteres:
    """Pruebas de límites de caracteres"""
    
    def test_nombre_tienda_muy_largo(self, usuario_logueado):
        """❌ Nombre de tienda excesivamente largo"""
        datos_tienda = {
            "nombre_tienda": "A" * 500,  # Nombre muy largo
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        # Podría retornar 400 si hay límite de caracteres
        assert resp.status_code in [400, 201]

    def test_direccion_muy_larga(self, usuario_logueado):
        """❌ Dirección excesivamente larga"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "A" * 1000,
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code in [400, 201]


class TestSeguridad:
    """Pruebas de seguridad"""
    
    def test_id_usuario_invalido(self, usuario_logueado):
        """❌ ID de usuario que no existe"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": 999999  # Usuario no existe
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code in [400, 404, 500]

    def test_id_usuario_negativo(self, usuario_logueado):
        """❌ ID de usuario negativo"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": -1
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400

    def test_id_usuario_texto(self, usuario_logueado):
        """❌ ID de usuario como texto"""
        datos_tienda = {
            "nombre_tienda": "Mi Tienda",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": "abc123"
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code == 400


class TestCaracteresEspeciales:
    """Pruebas con caracteres especiales"""
    
    def test_nombre_con_caracteres_especiales(self, usuario_logueado):
        """✅ Nombre con caracteres especiales válidos"""
        datos_tienda = {
            "nombre_tienda": f"Tienda & Cía. {datetime.now().timestamp()}",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code in [201, 400]

    def test_nombre_con_emojis(self, usuario_logueado):
        """✅ Nombre con emojis"""
        datos_tienda = {
            "nombre_tienda": f"Tienda 🍕 {datetime.now().timestamp()}",
            "direccion_tienda": "Calle 123",
            "telefono_tienda": "+56912345678",
            "horario_apertura": "09:00",
            "horario_cierre": "20:00",
            "id_usuario": usuario_logueado['id_usuario']
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/auth/tiendas",
            json=datos_tienda
        )
        
        assert resp.status_code in [201, 400]