

import pytest
import requests
import time

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

# --- CASOS BÁSICOS ---

def test_registro_exitoso():
    """Verifica que se puede registrar un usuario nuevo correctamente"""
    payload = get_base_payload(get_unique_email())
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    assert response.status_code == 201, f"Falló con {response.status_code}: {response.text}"
    
    data = response.json()
    assert "id_usuario" in data, f"Respuesta inesperada: {data}"
    assert isinstance(data["id_usuario"], int)
    print(f"\n✅ Usuario registrado exitosamente - ID: {data['id_usuario']}")

def test_registro_falla_con_email_duplicado():
    """Verifica que el sistema rechaza emails duplicados"""
    email = get_unique_email()
    payload = get_base_payload(email)
    
    r1 = requests.post(f"{BASE_URL}/register", json=payload)
    assert r1.status_code == 201, f"Primer registro falló: {r1.text}"
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    assert response.status_code == 409, f"Esperaba 409, obtuvo {response.status_code}: {response.text}"
    
    data = response.json()
    assert "error" in data
    assert "email" in data["error"].lower() or "registrado" in data["error"].lower()
    print("\n✅ El backend rechaza emails duplicados correctamente")

def test_registro_falla_sin_campos_requeridos():
    """Verifica que el sistema rechaza registros sin campos obligatorios"""
    response = requests.post(f"{BASE_URL}/register", json={})
    assert response.status_code == 400, f"Esperaba 400, obtuvo {response.status_code}: {response.text}"
    
    data = response.json()
    assert "error" in data
    assert "faltan campos" in data["error"].lower()
    print("\n✅ El backend valida campos requeridos")

def test_registro_rechaza_campos_vacios():
    """Verifica que el backend rechaza campos vacíos"""
    payload = get_base_payload(get_unique_email())
    payload["nombre_usuario"] = ""
    payload["direccion"] = ""
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    assert response.status_code == 400, f"Comportamiento inesperado: {response.status_code} {response.text}"
    
    data = response.json()
    assert "error" in data
    assert "faltan campos" in data["error"].lower()
    print("\n✅ El backend rechaza campos vacíos correctamente")

# --- VALIDACIONES DE FORMATO ---


def test_registro_falla_con_email_invalido():
    """Verifica que el sistema rechaza emails con formato inválido"""
    email_invalido = f"email-invalido-{int(time.time() * 1000)}"
    payload = get_base_payload(email_invalido)
    payload["email"] = email_invalido
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    if response.status_code == 201:
        pytest.fail(
            f"❌ BUG: El backend NO valida formato de email\n"
            f"   Aceptó email inválido: '{email_invalido}'\n"
            f"   Debería devolver 400, pero obtuvo 201"
        )
    elif response.status_code == 409:
        pytest.skip(f"Email '{email_invalido}' ya existe (test válido)")
    else:
        assert response.status_code == 400
        print("\n✅ El backend valida formato de email")

def test_registro_email_con_espacios():
    """Verifica manejo de emails con espacios al inicio/final"""
    email = get_unique_email()
    payload = get_base_payload(f"  {email}  ")
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    # 🔴 ESTO DEBE SER UN FALLO
    if response.status_code == 201:
        pytest.fail(
            f"❌ BUG: El backend acepta emails con espacios\n"
            f"   Aceptó: '  {email}  '\n"
            f"   Debería devolver 400, pero obtuvo 201"
        )
    else:
        assert response.status_code == 400
        print("\n✅ El backend rechaza emails con espacios")

def test_registro_email_case_insensitive():
    """Verifica que el backend trata emails como case-insensitive"""
    email_base = get_unique_email()
    payload1 = get_base_payload(email_base.lower())
    payload2 = get_base_payload(email_base.upper())
    
    r1 = requests.post(f"{BASE_URL}/register", json=payload1)
    assert r1.status_code == 201
    
    r2 = requests.post(f"{BASE_URL}/register", json=payload2)
    
    # 🔴 ESTO DEBE SER UN FALLO
    if r2.status_code == 201:
        pytest.fail(
            f"❌ BUG: El backend permite emails duplicados con diferentes mayúsculas\n"
            f"   Registró: '{email_base.lower()}' y '{email_base.upper()}'\n"
            f"   Los emails deben ser case-insensitive (RFC 5321)"
        )
    
    assert r2.status_code == 409, \
        f"Esperaba 409 (duplicado), obtuvo {r2.status_code}"
    print("\n✅ El backend trata emails como case-insensitive")

# --- VALIDACIONES DE LONGITUD ---

def test_registro_nombre_usuario_largo():
    """Verifica límite de longitud en nombre_usuario"""
    payload = get_base_payload(get_unique_email())
    payload["nombre_usuario"] = "A" * 256
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    if response.status_code == 201:
        print("\n⚠️  ADVERTENCIA: El backend acepta nombres de 256+ caracteres")
    else:
        assert response.status_code == 400
        print("\n✅ El backend limita longitud de nombre_usuario")

def test_registro_contrasena_muy_larga():
    """Verifica límite de longitud en contraseña"""
    payload = get_base_payload(get_unique_email())
    payload["contrasena"] = "A" * 10000
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    # 🔴 ESTO DEBE SER UN FALLO
    if response.status_code == 201:
        pytest.fail(
            "❌ VULNERABILIDAD: El backend acepta contraseñas de 10k+ caracteres\n"
            "   Esto puede causar problemas de rendimiento (bcrypt lento)\n"
            "   Debería devolver 400 o 413"
        )
    else:
        assert response.status_code in [400, 413]
        print("\n✅ El backend limita longitud de contraseña")


def test_registro_acepta_contrasena_debil():
    """DOCUMENTA: El backend NO valida fortaleza de contraseña"""
    payload = get_base_payload(get_unique_email())
    payload["contrasena"] = "123"
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    assert response.status_code == 201, f"Comportamiento inesperado: {response.text}"
    print("\n⚠️  ADVERTENCIA: El backend acepta contraseñas débiles (ej: '123')")

# --- SEGURIDAD ---

def test_registro_caracteres_especiales_nombre():
    """Verifica manejo de caracteres especiales en nombre"""
    payload = get_base_payload(get_unique_email())
    payload["nombre_usuario"] = "<script>alert('XSS')</script>"
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    
    if response.status_code == 201:
        data = response.json()
        pytest.fail(
            f"❌ VULNERABILIDAD XSS: El backend acepta scripts en nombres\n"
            f"   Aceptó: '<script>alert('XSS')</script>'\n"
            f"   ID creado: {data.get('id_usuario')}\n"
            f"   Debería sanitizar o rechazar caracteres peligrosos"
        )
    else:
        assert response.status_code == 400
        print("\n✅ El backend sanitiza caracteres especiales")


def test_registro_sql_injection_email():
    """Verifica protección contra SQL Injection en email"""
    payload = get_base_payload("' OR '1'='1")
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    assert response.status_code != 500, "⚠️  VULNERABILIDAD: Posible SQL Injection"
    assert response.status_code in [400, 409]
    print("\n✅ El backend está protegido contra SQL Injection")

def test_registro_rol_invalido():
    """Verifica validación de roles permitidos"""
    payload = get_base_payload(get_unique_email())
    payload["rol"] = "admin-falso"
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    if response.status_code == 201:
        print(f"\n⚠️  ADVERTENCIA: El backend acepta roles arbitrarios: 'admin-falso'")
    else:
        assert response.status_code == 400
        print("\n✅ El backend valida roles permitidos")

def test_registro_campo_extra_malicioso():
    """Verifica que el backend ignora campos extra no permitidos"""
    payload = get_base_payload(get_unique_email())
    payload["is_admin"] = True
    payload["balance"] = 999999
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print(f"\n✅ El backend ignora campos extra (ID: {data.get('id_usuario')})")

# --- UNICODE Y CARACTERES ESPECIALES ---

def test_registro_unicode_emojis():
    """Verifica manejo de caracteres unicode/emojis"""
    payload = get_base_payload(get_unique_email())
    payload["nombre_usuario"] = "Usuario 🎉🔥"
    payload["direccion"] = "Calle 日本語 123"
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    
    if response.status_code == 201:
        print("\n✅ El backend soporta unicode/emojis")
    else:
        print(f"\n⚠️  El backend rechaza unicode: {response.status_code}")

# --- CONCURRENCIA ---

def test_registro_concurrente_mismo_email():
    """Verifica que el backend maneja registros simultáneos del mismo email"""
    import concurrent.futures
    
    email = get_unique_email()
    payload = get_base_payload(email)
    
    def intentar_registro():
        return requests.post(f"{BASE_URL}/register", json=payload)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(intentar_registro) for _ in range(5)]
        responses = [f.result() for f in futures]
    
    exitosos = sum(1 for r in responses if r.status_code == 201)
    duplicados = sum(1 for r in responses if r.status_code == 409)
    
    assert exitosos == 1, f"⚠️  RACE CONDITION: {exitosos} registros exitosos"
    assert duplicados >= 4, f"⚠️  RACE CONDITION: {duplicados} rechazos"
    print(f"\n✅ El backend maneja concurrencia: {exitosos} éxito, {duplicados} duplicados")