# pip install Pillow
# pytest test_crear_producto.py -v --html=report_3.html --self-contained-html
# start report_3.html

import pytest
import requests
from datetime import datetime, timedelta
import time
import jwt
from io import BytesIO
from PIL import Image
import json
import string
import random

BASE_URL = "http://localhost:5000"
SECRET_KEY = "KUx0DHbvAxXKg301G196TyEO45Q7zZyiZ86vsskyCULCDzOVs6QMs1i7guhUdQTDFpMizoR0YtCDfj1BVBdbsrSURFclY"


def crear_imagen_prueba(color='red', tamaño=(100, 100)):
    """Crea una imagen de prueba en memoria"""
    img = Image.new('RGB', tamaño, color=color)
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io


def generar_string_aleatorio(longitud=10):
    """Genera un string aleatorio"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=longitud))


@pytest.fixture
def usuario_tienda_con_producto():
    """Crea usuario tienda, crea tienda y retorna datos"""
    timestamp = str(time.time()).replace('.', '')
    
    datos_registro = {
        "nombre_usuario": f"tienda_prod_{timestamp}",
        "email": f"tienda_prod_{timestamp}@test.com",
        "contrasena": "Password123!",
        "rol": "tienda",
        "direccion_usuario": "Calle Test 123"
    }
    
    resp_registro = requests.post(f"{BASE_URL}/api/auth/register", json=datos_registro)
    assert resp_registro.status_code == 201
    
    datos_login = {
        "email": datos_registro["email"],
        "contrasena": datos_registro["contrasena"]
    }
    
    resp_login = requests.post(f"{BASE_URL}/api/auth/login", json=datos_login)
    assert resp_login.status_code == 200
    
    data = resp_login.json()
    token = data.get("token")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        id_usuario = decoded.get("id_usuario")
    except:
        id_usuario = None
    
    datos_tienda = {
        "nombre_tienda": f"Tienda Productos {timestamp}",
        "direccion_tienda": "Av Principal 500",
        "telefono_tienda": "+56912345678",
        "horario_apertura": "09:00",
        "horario_cierre": "20:00",
        "id_usuario": id_usuario
    }
    
    resp_tienda = requests.post(f"{BASE_URL}/api/auth/tiendas", json=datos_tienda)
    assert resp_tienda.status_code == 201
    
    id_tienda = resp_tienda.json().get("tienda", {}).get("id_tienda")
    
    return {
        "token": token,
        "id_usuario": id_usuario,
        "id_tienda": id_tienda,
        "email": datos_registro["email"]
    }


class TestCrearLoteExitoso:
    """✅ Pruebas de casos exitosos (7 tests)"""
    
    def test_1_crear_lote_basico_exitoso(self, usuario_tienda_con_producto):
        """✅ Test 1: Crear lote básico correctamente"""
        print("\n✅ Test 1: Lote básico exitoso...")
        
        datos_lote = {
            "nombre_lote": f"Lote Test {datetime.now().timestamp()}",
            "descripcion": "Descripción del lote",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
        assert "id_lote" in resp.json()
    
    
    def test_2_crear_lote_con_peso_decimal(self, usuario_tienda_con_producto):
        """✅ Test 2: Lote con peso decimal"""
        print("\n✅ Test 2: Peso decimal...")
        
        datos_lote = {
            "nombre_lote": f"Lote Decimal {datetime.now().timestamp()}",
            "descripcion": "Con peso decimal",
            "precio_original": "75000",
            "precio_rescate": "35000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "peso_qty": "25.5",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["verduras"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('green'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_3_crear_lote_precio_rescate_alto(self, usuario_tienda_con_producto):
        """✅ Test 3: Lote con precio rescate alto"""
        print("\n✅ Test 3: Precio rescate alto...")
        
        datos_lote = {
            "nombre_lote": f"Lote Premium {datetime.now().timestamp()}",
            "descripcion": "Producto premium",
            "precio_original": "999999",
            "precio_rescate": "500000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            "peso_qty": "100.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=3)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["bebidas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('blue'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_4_crear_lote_multiples_categorias(self, usuario_tienda_con_producto):
        """✅ Test 4: Lote con múltiples categorías nuevas"""
        print("\n✅ Test 4: Múltiples categorías...")
        
        datos_lote = {
            "nombre_lote": f"Lote Multi {datetime.now().timestamp()}",
            "descripcion": "Con múltiples categorías",
            "precio_original": "60000",
            "precio_rescate": "30000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d"),
            "peso_qty": "40.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas", "verduras", "orgánicos"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('yellow'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_5_crear_lote_peso_bajo(self, usuario_tienda_con_producto):
        """✅ Test 5: Lote con peso muy bajo (0.1 kg)"""
        print("\n✅ Test 5: Peso muy bajo...")
        
        datos_lote = {
            "nombre_lote": f"Lote Bajo {datetime.now().timestamp()}",
            "descripcion": "Peso muy bajo",
            "precio_original": "5000",
            "precio_rescate": "2000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "peso_qty": "0.1",  # Muy bajo
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('red'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_6_crear_lote_peso_alto(self, usuario_tienda_con_producto):
        """✅ Test 6: Lote con peso muy alto (1000 kg)"""
        print("\n✅ Test 6: Peso muy alto...")
        
        datos_lote = {
            "nombre_lote": f"Lote Alto {datetime.now().timestamp()}",
            "descripcion": "Peso muy alto",
            "precio_original": "500000",
            "precio_rescate": "250000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "1000.0",  # Muy alto
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('purple'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_7_crear_lote_ventana_retiro_1dia(self, usuario_tienda_con_producto):
        """✅ Test 7: Ventana de retiro de 1 día"""
        print("\n✅ Test 7: Ventana retiro 1 día...")
        
        ahora = datetime.now()
        datos_lote = {
            "nombre_lote": f"Lote 1Día {datetime.now().timestamp()}",
            "descripcion": "Ventana 1 día",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (ahora + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (ahora + timedelta(days=1, hours=23, minutes=59)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba('orange'), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201


class TestCrearLoteFallasValidacion:
    """❌ Pruebas de validación - casos que deberían fallar (10 tests)"""
    
    def test_8_sin_nombre_lote(self, usuario_tienda_con_producto):
        """❌ Test 8: Sin nombre_lote retorna 500 (BUG)"""
        print("\n❌ Test 8: Sin nombre...")
        
        datos_lote = {
            "descripcion": "Sin nombre",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [400, 500], f"Status: {resp.status_code}"
    
    
    def test_9_precio_negativo(self, usuario_tienda_con_producto):
        """❌ Test 9: Precio negativo es ACEPTADO (BUG)"""
        print("\n❌ Test 9: Precio negativo...")
        
        datos_lote = {
            "nombre_lote": f"Lote Negativo {datetime.now().timestamp()}",
            "descripcion": "Precio negativo",
            "precio_original": "50000",
            "precio_rescate": "-25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400, f"BUG: Precio negativo aceptado - {resp.status_code}"
    
    
    def test_10_peso_negativo(self, usuario_tienda_con_producto):
        """❌ Test 10: Peso negativo"""
        print("\n❌ Test 10: Peso negativo...")
        
        datos_lote = {
            "nombre_lote": f"Lote Peso Neg {datetime.now().timestamp()}",
            "descripcion": "Peso negativo",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "-50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400, f"Peso negativo aceptado - {resp.status_code}"
    
    
    def test_11_peso_cero(self, usuario_tienda_con_producto):
        """❌ Test 11: Peso cero"""
        print("\n❌ Test 11: Peso cero...")
        
        datos_lote = {
            "nombre_lote": f"Lote Peso 0 {datetime.now().timestamp()}",
            "descripcion": "Peso cero",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400, f"Peso cero aceptado - {resp.status_code}"
    
    
    def test_12_fecha_vencimiento_pasada(self, usuario_tienda_con_producto):
        """❌ Test 12: Fecha vencimiento en el pasado"""
        print("\n❌ Test 12: Fecha vencimiento pasada...")
        
        datos_lote = {
            "nombre_lote": f"Lote Fecha Pasada {datetime.now().timestamp()}",
            "descripcion": "Fecha en el pasado",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400, f"Fecha pasada aceptada - {resp.status_code}"
    
    
    def test_13_ventana_retiro_invalida(self, usuario_tienda_con_producto):
        """❌ Test 13: Ventana retiro con fin antes de inicio"""
        print("\n❌ Test 13: Ventana retiro inválida...")
        
        ahora = datetime.now()
        datos_lote = {
            "nombre_lote": f"Lote Ventana Inv {datetime.now().timestamp()}",
            "descripcion": "Ventana inválida",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (ahora + timedelta(days=2)).isoformat(),
            "ventana_retiro_fin": (ahora + timedelta(days=1)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400, f"Ventana inválida aceptada - {resp.status_code}"
    
    
    def test_14_sin_imagen(self, usuario_tienda_con_producto):
        """❌ Test 14: Sin imagen retorna 500 (BUG)"""
        print("\n❌ Test 14: Sin imagen...")
        
        datos_lote = {
            "nombre_lote": f"Lote Sin Img {datetime.now().timestamp()}",
            "descripcion": "Sin imagen",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [400, 500]
    
    
    def test_15_id_tienda_inexistente(self, usuario_tienda_con_producto):
        """❌ Test 15: ID tienda inexistente"""
        print("\n❌ Test 15: Tienda inexistente...")
        
        datos_lote = {
            "nombre_lote": f"Lote Tienda Inv {datetime.now().timestamp()}",
            "descripcion": "Tienda inexistente",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": "999999",
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [400, 404, 500]
    
    
    def test_16_precio_original_cero(self, usuario_tienda_con_producto):
        """❌ Test 16: Precio original cero"""
        print("\n❌ Test 16: Precio original cero...")
        
        datos_lote = {
            "nombre_lote": f"Lote Precio 0 {datetime.now().timestamp()}",
            "descripcion": "Precio original cero",
            "precio_original": "0",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400
    
    
    def test_17_precio_original_negativo(self, usuario_tienda_con_producto):
        """❌ Test 17: Precio original negativo"""
        print("\n❌ Test 17: Precio original negativo...")
        
        datos_lote = {
            "nombre_lote": f"Lote Precio Neg {datetime.now().timestamp()}",
            "descripcion": "Precio original negativo",
            "precio_original": "-50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400


class TestCrearLoteImagenes:
    """🖼️ Pruebas relacionadas con imágenes (4 tests)"""
    
    def test_18_multiples_imagenes(self, usuario_tienda_con_producto):
        """✅ Test 18: Lote con múltiples imágenes"""
        print("\n✅ Test 18: Múltiples imágenes...")
        
        datos_lote = {
            "nombre_lote": f"Lote Multi Img {datetime.now().timestamp()}",
            "descripcion": "Con múltiples imágenes",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = [
            ("imagenes", ("test1.png", crear_imagen_prueba('red'), "image/png")),
            ("imagenes", ("test2.png", crear_imagen_prueba('blue'), "image/png")),
            ("imagenes", ("test3.png", crear_imagen_prueba('green'), "image/png"))
        ]
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_19_imagen_muy_grande(self, usuario_tienda_con_producto):
        """✅ Test 19: Imagen muy grande (2000x2000)"""
        print("\n✅ Test 19: Imagen muy grande...")
        
        datos_lote = {
            "nombre_lote": f"Lote Img Grande {datetime.now().timestamp()}",
            "descripcion": "Imagen muy grande",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test_large.png", crear_imagen_prueba('red', (2000, 2000)), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [201, 413]  # 413 si hay límite de tamaño
    
    
    def test_20_imagen_muy_pequena(self, usuario_tienda_con_producto):
        """✅ Test 20: Imagen muy pequeña (10x10)"""
        print("\n✅ Test 20: Imagen muy pequeña...")
        
        datos_lote = {
            "nombre_lote": f"Lote Img Pequeña {datetime.now().timestamp()}",
            "descripcion": "Imagen muy pequeña",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test_small.png", crear_imagen_prueba('red', (10, 10)), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_21_imagen_colores_diferentes(self, usuario_tienda_con_producto):
        """✅ Test 21: Múltiples imágenes con colores diferentes"""
        print("\n✅ Test 21: Imágenes colores diferentes...")
        
        datos_lote = {
            "nombre_lote": f"Lote Colores {datetime.now().timestamp()}",
            "descripcion": "Colores diversos",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        colores = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
        files = [
            ("imagenes", (f"test_{i}.png", crear_imagen_prueba(col), "image/png"))
            for i, col in enumerate(colores)
        ]
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201


class TestCrearLoteAutenticacion:
    """🔐 Pruebas de autenticación (3 tests)"""
    
    def test_22_sin_token(self, usuario_tienda_con_producto):
        """❌ Test 22: Sin token de autenticación"""
        print("\n❌ Test 22: Sin token...")
        
        datos_lote = {
            "nombre_lote": f"Lote Sin Token {datetime.now().timestamp()}",
            "descripcion": "Sin autenticación",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files
        )
        
        assert resp.status_code == 401
    
    
    def test_23_token_invalido(self, usuario_tienda_con_producto):
        """❌ Test 23: Token inválido"""
        print("\n❌ Test 23: Token inválido...")
        
        datos_lote = {
            "nombre_lote": f"Lote Token Inv {datetime.now().timestamp()}",
            "descripcion": "Token inválido",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": "Bearer token_invalido_xyz"}
        )
        
        assert resp.status_code == 401
    
    
    def test_24_token_vacio(self, usuario_tienda_con_producto):
        """❌ Test 24: Token vacío"""
        print("\n❌ Test 24: Token vacío...")
        
        datos_lote = {
            "nombre_lote": f"Lote Token Vacio {datetime.now().timestamp()}",
            "descripcion": "Token vacío",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": "Bearer "}
        )
        
        assert resp.status_code == 401


class TestCrearLoteDatos:
    """📊 Pruebas con datos extremos (6 tests)"""
    
    def test_25_nombre_muy_largo(self, usuario_tienda_con_producto):
        """✅ Test 25: Nombre muy largo"""
        print("\n✅ Test 25: Nombre muy largo...")
        
        datos_lote = {
            "nombre_lote": generar_string_aleatorio(200),
            "descripcion": "Nombre muy largo",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [201, 400]
    
    
    def test_26_descripcion_especial(self, usuario_tienda_con_producto):
        """✅ Test 26: Descripción con caracteres especiales"""
        print("\n✅ Test 26: Descripción especial...")
        
        datos_lote = {
            "nombre_lote": f"Lote Especial {datetime.now().timestamp()}",
            "descripcion": "Desc con 👍 emojis & caracteres <especiales> \"comillas\"",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 201
    
    
    def test_27_precio_rescate_mayor_original(self, usuario_tienda_con_producto):
        """⚠️  Test 27: Precio rescate mayor que original"""
        print("\n⚠️  Test 27: Precio rescate > original...")
        
        datos_lote = {
            "nombre_lote": f"Lote Ilógico {datetime.now().timestamp()}",
            "descripcion": "Precio rescate mayor",
            "precio_original": "25000",
            "precio_rescate": "50000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [201, 400]
    
    
    def test_28_ventana_retiro_pasada(self, usuario_tienda_con_producto):
        """❌ Test 28: Ventana retiro en el pasado"""
        print("\n❌ Test 28: Ventana retiro pasada...")
        
        datos_lote = {
            "nombre_lote": f"Lote Retiro Pasado {datetime.now().timestamp()}",
            "descripcion": "Retiro en pasado",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() - timedelta(days=2)).isoformat(),
            "ventana_retiro_fin": (datetime.now() - timedelta(days=1)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps(["frutas"])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code == 400
    
    
    def test_29_categorias_vacia_y_nueva_vacia(self, usuario_tienda_con_producto):
        """⚠️  Test 29: Sin categorías (ambas vacías)"""
        print("\n⚠️  Test 29: Sin categorías...")
        
        datos_lote = {
            "nombre_lote": f"Lote Sin Cat {datetime.now().timestamp()}",
            "descripcion": "Sin categorías",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps([])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [201, 400]
    
    
    def test_30_categoria_nombre_muy_largo(self, usuario_tienda_con_producto):
        """✅ Test 30: Categoría con nombre muy largo"""
        print("\n✅ Test 30: Categoría nombre muy largo...")
        
        datos_lote = {
            "nombre_lote": f"Lote Cat Largo {datetime.now().timestamp()}",
            "descripcion": "Categoría con nombre muy largo",
            "precio_original": "50000",
            "precio_rescate": "25000",
            "fecha_vencimiento": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "peso_qty": "50.0",
            "id_tienda": str(usuario_tienda_con_producto['id_tienda']),
            "ventana_retiro_inicio": (datetime.now() + timedelta(days=1)).isoformat(),
            "ventana_retiro_fin": (datetime.now() + timedelta(days=2)).isoformat(),
            "categorias": json.dumps([]),
            "categorias_nuevas": json.dumps([generar_string_aleatorio(100)])
        }
        
        files = {"imagenes": ("test.png", crear_imagen_prueba(), "image/png")}
        
        resp = requests.post(
            f"{BASE_URL}/api/lotes",
            data=datos_lote,
            files=files,
            headers={"Authorization": f"Bearer {usuario_tienda_con_producto['token']}"}
        )
        
        assert resp.status_code in [201, 400]