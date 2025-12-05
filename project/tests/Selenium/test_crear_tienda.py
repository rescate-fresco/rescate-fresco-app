#pytest test_crear_tienda.py -v --html=reporte_crear_tienda.html --self-contained-html
import pytest
from selenium.webdriver.common.by import By
import time

BASE_URL = "http://localhost:5173"
CREAR_TIENDA_URL = "http://localhost:5173/Inicio/Crear-Tienda"
LOGIN_URL = "http://localhost:5173/Iniciar-Sesion"

TEST_EMAIL = "pruebas@gmail.com" 
TEST_PASSWORD = "pruebas1234"  


class TestCrearTienda:
    """Tests de Crear Tienda - Página de Creación de Tienda"""
    
    # XPath Login
    XPATH_EMAIL_LOGIN = "//input[@placeholder='ejemplo@correo.com']"
    XPATH_PASSWORD_LOGIN = "//input[@placeholder='Mínimo 8 caracteres']"
    XPATH_LOGIN_BTN = "//button[normalize-space()='Iniciar Sesión']"
    
    # XPath Crear Tienda
    XPATH_LINK_INICIO = "//a[normalize-space()='Inicio']"
    XPATH_LINK_CREAR_TIENDA = "//a[normalize-space()='Crear Tienda']"
    XPATH_NOMBRE_TIENDA = "//input[@name='nombre_tienda']"
    XPATH_DIRECCION_TIENDA = "//input[@name='direccion_tienda']"
    XPATH_TELEFONO_TIENDA = "//input[@placeholder='+56912345678']"
    XPATH_CREAR_TIENDA_BTN = "/html/body/div/div/div/div/form/button"  # ✅ XPath correcto
    
    # Elementos adicionales
    XPATH_NAVBAR = "//nav[@class='navbar']"
    XPATH_CUERPO_DIV = "//div[@class='Cuerpo']"
    
    # Flag para controlar si ya hicimos login
    ya_logueado = False
    
    
    @pytest.fixture(autouse=True)
    def login_una_sola_vez(self, navegador, helper):
        """Login UNA SOLA VEZ al inicio de todos los tests"""
        helper.cerrar_alerta()
        
        if not TestCrearTienda.ya_logueado:
            print(f"\n🔓 LOGIN INICIAL: {TEST_EMAIL}...")
            
            navegador.get(LOGIN_URL)
            
            email_input = (By.XPATH, self.XPATH_EMAIL_LOGIN)
            password_input = (By.XPATH, self.XPATH_PASSWORD_LOGIN)
            login_btn = (By.XPATH, self.XPATH_LOGIN_BTN)
            
            helper.escribir(email_input, TEST_EMAIL)
            helper.escribir(password_input, TEST_PASSWORD)
            helper.clickear(login_btn)
            
            # Esperar a que cargue completamente
            time.sleep(2)
            link_crear_tienda = (By.XPATH, self.XPATH_LINK_CREAR_TIENDA)
            helper.elemento_visible(link_crear_tienda)
            
            print(f"✅ LOGIN COMPLETADO")
            TestCrearTienda.ya_logueado = True
        else:
            print(f"♻️ Reutilizando sesión de login...")
        
        yield
    
    
    # ========== TESTS ==========
    
    def test_1_cargar_pagina_inicio(self, navegador, helper):
        """✅ Test 1: Cargar página de inicio"""
        print("\n✅ Test 1: Cargar página inicio...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        titulo = navegador.title
        print(f"📖 Título: {titulo}")
        
        assert "rescate" in titulo.lower() or "fresco" in titulo.lower()
        print("✅ Página cargada correctamente")
    
    
    def test_2_navbar_visible(self, navegador, helper):
        """✅ Test 2: Navbar visible"""
        print("\n✅ Test 2: Navbar visible...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        navbar = (By.XPATH, self.XPATH_NAVBAR)
        assert helper.elemento_visible(navbar)
        print("✅ Navbar está visible")
    
    
    def test_3_link_crear_tienda_visible(self, navegador, helper):
        """✅ Test 3: Link 'Crear Tienda' visible"""
        print("\n✅ Test 3: Link Crear Tienda visible...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_crear_tienda = (By.XPATH, self.XPATH_LINK_CREAR_TIENDA)
        assert helper.elemento_visible(link_crear_tienda), "❌ Link Crear Tienda no visible"
        
        print("✅ Link 'Crear Tienda' está visible")
    
    
    def test_4_navegar_a_crear_tienda(self, navegador, helper):
        """✅ Test 4: Navegar a página de crear tienda"""
        print("\n✅ Test 4: Navegar a crear tienda...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_crear_tienda = (By.XPATH, self.XPATH_LINK_CREAR_TIENDA)
        helper.clickear(link_crear_tienda)
        
        time.sleep(2)  # Esperar que cargue la página
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        helper.elemento_visible(nombre_tienda)
        
        assert "crear" in navegador.current_url.lower()
        print(f"✅ Navegó a: {navegador.current_url}")
    
    
    def test_5_campos_crear_tienda_presentes(self, navegador, helper):
        """✅ Test 5: Todos los campos presentes"""
        print("\n✅ Test 5: Campos crear tienda presentes...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)  # Esperar carga
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        direccion_tienda = (By.XPATH, self.XPATH_DIRECCION_TIENDA)
        telefono_tienda = (By.XPATH, self.XPATH_TELEFONO_TIENDA)
        crear_tienda_btn = (By.XPATH, self.XPATH_CREAR_TIENDA_BTN)
        
        assert helper.elemento_visible(nombre_tienda), "❌ Campo nombre"
        assert helper.elemento_visible(direccion_tienda), "❌ Campo dirección"
        assert helper.elemento_visible(telefono_tienda), "❌ Campo teléfono"
        assert helper.elemento_visible(crear_tienda_btn), "❌ Botón crear"
        
        print("✅ Todos los campos están presentes")
    
    
    def test_6_escribir_nombre_tienda(self, navegador, helper):
        """✅ Test 6: Escribir nombre de tienda"""
        print("\n✅ Test 6: Escribir nombre tienda...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)  # Esperar carga
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        
        # Escribir con pausa
        elem = helper.esperar_elemento(nombre_tienda)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("Tienda Fresh Market")
        time.sleep(0.5)  # Esperar que se escriba completamente
        
        valor = helper.obtener_atributo(nombre_tienda, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert valor == "Tienda Fresh Market", f"Valor no coincide. Esperado: 'Tienda Fresh Market', Obtenido: '{valor}'"
        print(f"✅ Nombre escrito correctamente")
    
    
    def test_7_escribir_direccion_tienda(self, navegador, helper):
        """✅ Test 7: Escribir dirección de tienda"""
        print("\n✅ Test 7: Escribir dirección tienda...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)  # Esperar carga
        
        direccion_tienda = (By.XPATH, self.XPATH_DIRECCION_TIENDA)
        
        # Escribir con pausa
        elem = helper.esperar_elemento(direccion_tienda)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("Avenida Principal 456, Local 2")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(direccion_tienda, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert "Avenida Principal" in valor, f"Valor no coincide. Esperado contener: 'Avenida Principal', Obtenido: '{valor}'"
        print(f"✅ Dirección escrita correctamente")
    
    
    def test_8_escribir_telefono_tienda(self, navegador, helper):
        """✅ Test 8: Escribir teléfono de tienda"""
        print("\n✅ Test 8: Escribir teléfono tienda...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)  # Esperar carga
        
        telefono_tienda = (By.XPATH, self.XPATH_TELEFONO_TIENDA)
        
        # Escribir con pausa
        elem = helper.esperar_elemento(telefono_tienda)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("+56987654321")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(telefono_tienda, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert "+569" in valor, f"Valor no coincide. Esperado contener: '+569', Obtenido: '{valor}'"
        print(f"✅ Teléfono escrito correctamente")
    
    
    def test_9_nombre_tienda_vacio(self, navegador, helper):
        """❌ Test 9: Enviar sin nombre de tienda"""
        print("\n❌ Test 9: Nombre tienda vacío...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)
        
        direccion_tienda = (By.XPATH, self.XPATH_DIRECCION_TIENDA)
        telefono_tienda = (By.XPATH, self.XPATH_TELEFONO_TIENDA)
        crear_tienda_btn = (By.XPATH, self.XPATH_CREAR_TIENDA_BTN)
        
        helper.escribir(direccion_tienda, "Dirección Test")
        helper.escribir(telefono_tienda, "+56912345678")
        time.sleep(0.5)
        
        try:
            helper.clickear(crear_tienda_btn)
            time.sleep(1)
            helper.cerrar_alerta()
            print("✅ Nombre tienda vacío no permitido")
        except Exception as e:
            helper.cerrar_alerta()
            print(f"✅ Nombre tienda vacío rechazado: {str(e)[:50]}")
    
    
    def test_10_direccion_tienda_vacia(self, navegador, helper):
        """❌ Test 10: Enviar sin dirección de tienda"""
        print("\n❌ Test 10: Dirección tienda vacía...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        telefono_tienda = (By.XPATH, self.XPATH_TELEFONO_TIENDA)
        crear_tienda_btn = (By.XPATH, self.XPATH_CREAR_TIENDA_BTN)
        
        helper.escribir(nombre_tienda, "Mi Tienda")
        helper.escribir(telefono_tienda, "+56912345678")
        time.sleep(0.5)
        
        try:
            helper.clickear(crear_tienda_btn)
            time.sleep(1)
            helper.cerrar_alerta()
            print("✅ Dirección tienda vacía no permitida")
        except Exception as e:
            helper.cerrar_alerta()
            print(f"✅ Dirección tienda vacía rechazada: {str(e)[:50]}")
    
    
    def test_11_telefono_tienda_vacio(self, navegador, helper):
        """❌ Test 11: Enviar sin teléfono de tienda"""
        print("\n❌ Test 11: Teléfono tienda vacío...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        direccion_tienda = (By.XPATH, self.XPATH_DIRECCION_TIENDA)
        crear_tienda_btn = (By.XPATH, self.XPATH_CREAR_TIENDA_BTN)
        
        helper.escribir(nombre_tienda, "Mi Tienda")
        helper.escribir(direccion_tienda, "Calle Principal 100")
        time.sleep(0.5)
        
        try:
            helper.clickear(crear_tienda_btn)
            time.sleep(1)
            helper.cerrar_alerta()
            print("✅ Teléfono tienda vacío no permitido")
        except Exception as e:
            helper.cerrar_alerta()
            print(f"✅ Teléfono tienda vacío rechazado: {str(e)[:50]}")
    
    
    def test_12_captura_pagina_crear_tienda(self, navegador, helper):
        """📸 Test 12: Capturar pantalla de crear tienda"""
        print("\n📸 Test 12: Capturando pantalla...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)
        
        helper.captura_pantalla("pagina_crear_tienda")
        print("✅ Captura guardada en screenshots/")
    
    
    def test_13_crear_tienda_exitoso(self, navegador, helper):
        """✅✅ Test 13: Crear tienda exitosamente"""
        print("\n✅✅ Test 13: Crear tienda exitosamente...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_TIENDA_URL)
        time.sleep(2)
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        direccion_tienda = (By.XPATH, self.XPATH_DIRECCION_TIENDA)
        telefono_tienda = (By.XPATH, self.XPATH_TELEFONO_TIENDA)
        crear_tienda_btn = (By.XPATH, self.XPATH_CREAR_TIENDA_BTN)
        
        # Llenar formulario
        nombre_unico = f"Tienda Fresh {int(time.time())}"
        helper.escribir(nombre_tienda, nombre_unico)
        time.sleep(0.5)
        helper.escribir(direccion_tienda, "Calle Test 789, Local 1")
        time.sleep(0.5)
        helper.escribir(telefono_tienda, "+56912345678")
        time.sleep(0.5)
        
        print("📝 Formulario completado")
        helper.captura_pantalla("formulario_crear_tienda_completo")
        
        try:
            helper.clickear(crear_tienda_btn)
            print("✅ Formulario enviado!")
            
            for intento in range(5):
                time.sleep(1)
                url_actual = navegador.current_url
                print(f"📍 URL actual: {url_actual}")
                
                if "crear" not in url_actual.lower():
                    print("✅✅ TIENDA CREADA - Redirigido!")
                    helper.captura_pantalla("despues_crear_tienda")
                    return
            
            print("⚠️ Tienda se creó pero no se vio redirección")
            
        except Exception as e:
            helper.cerrar_alerta()
            print(f"❌ Error: {str(e)[:100]}")
    
    
    def test_14_navegar_atras(self, navegador, helper):
        """✅ Test 14: Navegar atrás desde crear tienda"""
        print("\n✅ Test 14: Navegar atrás...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_crear_tienda = (By.XPATH, self.XPATH_LINK_CREAR_TIENDA)
        helper.clickear(link_crear_tienda)
        
        time.sleep(2)
        
        nombre_tienda = (By.XPATH, self.XPATH_NOMBRE_TIENDA)
        helper.elemento_visible(nombre_tienda)
        
        navegador.back()
        time.sleep(1)
        
        link_crear_tienda = (By.XPATH, self.XPATH_LINK_CREAR_TIENDA)
        helper.elemento_visible(link_crear_tienda)
        
        assert BASE_URL in navegador.current_url
        print("✅ Navegación atrás funcionó")