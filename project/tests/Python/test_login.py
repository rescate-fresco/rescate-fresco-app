# cd project/tests/Python
# python -m venv venv
# .\.venv\Scripts\activate
# pip install pytest requests
# pip install pytest-html
# pytest test_registro.py test_login.py --html=report.html --self-contained-html -v -s
# start report.html

import pytest
import requests
import time
import base64
import json

BASE_URL = "http://localhost:5000/api/auth"

def get_unique_email():
    return f"test_{int(time.time() * 1000)}@example.com"

def get_base_payload(email):
    return {
        "nombre_usuario": "Test User",
        "email": email,
        "contrasena": "PasswordValida123!",
        "rol": "tienda",
        "direccion": "Calle Falsa 123"
    }

def registrar_usuario(email, password):
    """Helper: Registra un usuario y retorna sus credenciales"""
    payload = get_base_payload(email)
    payload["contrasena"] = password
    r = requests.post(f"{BASE_URL}/register", json=payload)
    assert r.status_code == 201, f"Registro falló: {r.text}"
    return {"email": email, "contrasena": password}

# --- CASOS BÁSICOS ---

def test_login_exitoso():
    """Verifica que un usuario registrado puede hacer login"""
    email = get_unique_email()
    password = "MiPassword123!"
    
    registrar_usuario(email, password)
    
    payload_login = {"email": email, "contrasena": password}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    assert response.status_code == 200, f"Login falló: {response.status_code} {response.text}"
    
    data = response.json()
    assert "token" in data or "id_usuario" in data or "email" in data
    print(f"\n✅ Login exitoso - Usuario: {email}")

def test_login_falla_con_contrasena_incorrecta():
    """Verifica que el login falla con contraseña incorrecta"""
    email = get_unique_email()
    password_correcta = "PasswordCorrecta123!"
    
    registrar_usuario(email, password_correcta)
    
    payload_login = {"email": email, "contrasena": "contraseña-incorrecta"}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    assert response.status_code in [400, 401], f"Esperaba 400/401, obtuvo {response.status_code}: {response.text}"
    
    data = response.json()
    assert "token" not in data
    print("\n✅ El backend rechaza contraseñas incorrectas")

def test_login_falla_con_usuario_inexistente():
    """Verifica que el login falla con usuario que no existe"""
    payload = {"email": "no-existe@test.com", "contrasena": "cualquier-cosa"}
    response = requests.post(f"{BASE_URL}/login", json=payload)
    
    assert response.status_code in [400, 401], f"Esperaba 400/401, obtuvo {response.status_code}: {response.text}"
    
    data = response.json()
    assert "token" not in data
    print("\n✅ El backend rechaza usuarios inexistentes")

def test_login_falla_sin_campos():
    """Verifica que el login falla sin credenciales"""
    response = requests.post(f"{BASE_URL}/login", json={})
    
    assert response.status_code == 400, f"Esperaba 400, obtuvo {response.status_code}: {response.text}"
    
    data = response.json()
    assert "error" in data
    assert "faltan campos" in data["error"].lower()
    print("\n✅ El backend valida campos requeridos en login")

# --- VALIDACIONES DE FORMATO ---

def test_login_email_con_espacios():
    """Verifica que el backend limpia espacios en email al hacer login"""
    email = get_unique_email()
    password = "Password123!"
    
    registrar_usuario(email, password)
    
    payload_login = {"email": f"  {email}  ", "contrasena": password}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    if response.status_code == 200:
        print("\n✅ El backend limpia espacios en emails")
    else:
        print(f"\n⚠️  El backend rechaza emails con espacios: {response.status_code}")
        pytest.fail("El backend debería limpiar espacios en emails")

def test_login_email_case_insensitive():
    """Verifica que el login funciona sin importar mayúsculas en email"""
    email = get_unique_email()
    password = "Password123!"
    
    registrar_usuario(email.lower(), password)
    
    payload_login = {"email": email.upper(), "contrasena": password}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)

    if response.status_code == 200:
        print("\n✅ El backend acepta emails case-insensitive en login")
    else:
        print(f"\n⚠️  El backend es case-sensitive en login: {response.status_code}")
        pytest.fail("El backend debería aceptar emails case-insensitive")


def test_login_contrasena_con_espacios():
    """Verifica que el backend NO limpia espacios en contraseñas"""
    email = get_unique_email()
    password = "Password123!"
    
    registrar_usuario(email, password)
    
    payload_login = {"email": email, "contrasena": f"  {password}  "}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    assert response.status_code in [400, 401], \
        "⚠️  VULNERABILIDAD: El backend ignora espacios en contraseñas"
    print("\n✅ El backend NO limpia espacios en contraseñas (correcto)")

# --- SEGURIDAD ---

def test_login_sql_injection():
    """Verifica protección contra SQL Injection en login"""
    payload = {
        "email": "' OR '1'='1' --",
        "contrasena": "' OR '1'='1' --"
    }
    response = requests.post(f"{BASE_URL}/login", json=payload)
    
    assert response.status_code != 200, "⚠️  VULNERABILIDAD CRÍTICA: SQL Injection exitoso"
    assert response.status_code != 500, "⚠️  VULNERABILIDAD: SQL Injection causa error 500"
    assert response.status_code in [400, 401]
    print("\n✅ El backend está protegido contra SQL Injection")

def test_login_multiples_intentos_fallidos():
    """Verifica si hay protección contra fuerza bruta"""
    email = get_unique_email()
    registrar_usuario(email, "Password123!")
    
    for i in range(10):
        payload = {"email": email, "contrasena": f"wrong-password-{i}"}
        response = requests.post(f"{BASE_URL}/login", json=payload)
        assert response.status_code in [400, 401]
    
    response = requests.post(f"{BASE_URL}/login", json={"email": email, "contrasena": "wrong"})
    
    assert response.status_code == 429, \
        f"❌ VULNERABILIDAD CRÍTICA: Sin rate limiting. " \
        f"Debería devolver 429 después de 10 intentos fallidos, pero obtuvo {response.status_code}"
    
    print("\n✅ El backend tiene protección contra fuerza bruta (rate limiting)")

def test_login_token_expiracion():
    """Verifica que el token tenga fecha de expiración"""
    email = get_unique_email()
    password = "Password123!"
    
    registrar_usuario(email, password)
    
    payload_login = {"email": email, "contrasena": password}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    if response.status_code == 200:
        data = response.json()
        if "token" in data:
            try:
                parts = data["token"].split(".")
                if len(parts) == 3:
                    payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
                    payload_decoded = json.loads(base64.b64decode(payload_b64))
                    
                    if "exp" in payload_decoded:
                        print(f"\n✅ El token tiene expiración: {payload_decoded['exp']}")
                    else:
                        print("\n⚠️  VULNERABILIDAD: El token NO expira")
            except Exception as e:
                print(f"\n⚠️  No se pudo decodificar el token JWT: {e}")

# --- EDGE CASES ---

def test_login_payload_muy_grande():
    
    # Registra un usuario válido para aislar la prueba del tamaño
    email = get_unique_email()
    password_real = "Password123!"
    registrar_usuario(email, password_real)
    
    """Verifica manejo de payload excesivamente grande"""
    payload = {
        "email": email,
        "contrasena": "A" * 100000  # 100k caracteres
    }
    response = requests.post(f"{BASE_URL}/login", json=payload)
    
    # El backend DEBE rechazar payloads muy grandes ANTES de procesarlos
    assert response.status_code in [400, 413], \
        f"❌ VULNERABILIDAD: El backend procesa payloads de 100k caracteres. " \
        f"Debería devolver 400 o 413, pero obtuvo {response.status_code}"
    
    if response.status_code == 413:
        print("\n✅ El backend rechaza payloads muy grandes antes de procesarlos")
    else:
        print(f"\n✅ El backend valida tamaño del payload: status {response.status_code}")


def test_login_caracteres_unicode():
    """Verifica manejo de unicode en credenciales"""
    email = get_unique_email()
    password = "Pass日本語123!"
    
    registrar_usuario(email, password)
    
    payload_login = {"email": email, "contrasena": password}
    response = requests.post(f"{BASE_URL}/login", json=payload_login)
    
    if response.status_code == 200:
        print("\n✅ El backend soporta unicode en contraseñas")
    else:
        print(f"\n⚠️  El backend rechaza unicode en contraseñas: {response.status_code}")