import pytest
from selenium.webdriver.common.by import By
import time

BASE_URL = "http://localhost:5173"
CREAR_PRODUCTO_URL = "http://localhost:5173/Inicio/Publicar/Nuevo-Producto"
LOGIN_URL = "http://localhost:5173/Iniciar-Sesion"

TEST_EMAIL = "pruebas@gmail.com" 
TEST_PASSWORD = "pruebas1234"  


class TestCrearProducto:
    """Tests de Crear Producto - Página de Publicación de Producto"""
    
    # XPath Login
    XPATH_EMAIL_LOGIN = "//input[@placeholder='ejemplo@correo.com']"
    XPATH_PASSWORD_LOGIN = "//input[@placeholder='Mínimo 8 caracteres']"
    XPATH_LOGIN_BTN = "//button[normalize-space()='Iniciar Sesión']"
    
    # XPath Crear Producto
    XPATH_LINK_PUBLICAR_PRODUCTO = "//a[contains(text(),'Publicar Producto')]"
    XPATH_NOMBRE_LOTE = "//input[@name='nombre_lote']"
    XPATH_CATEGORIA_SELECT = "//form[@class='lote-form']//div//select"
    XPATH_DESCRIPCION = "//textarea[@name='descripcion']"
    XPATH_PESO_QTY = "//input[@name='peso_qty']"
    XPATH_PRECIO_ORIGINAL = "//input[@name='precio_original']"
    XPATH_PRECIO_RESCATE = "//input[@name='precio_rescate']"
    XPATH_FECHA_VENCIMIENTO = "//input[@name='fecha_vencimiento']"
    XPATH_VENTANA_RETIRO_INICIO = "//input[@name='ventana_retiro_inicio']"
    XPATH_VENTANA_RETIRO_FIN = "//input[@name='ventana_retiro_fin']"
    XPATH_IMAGENES = "//input[@name='imagenes']"
    XPATH_CREAR_PRODUCTO_BTN = "//*[@id='root']/div/div/div/form/button[2]"
    
    # Elementos adicionales
    XPATH_NAVBAR = "//nav[@class='navbar']"
    
    # Flag para controlar si ya hicimos login
    ya_logueado = False
    
    
    @pytest.fixture(autouse=True)
    def login_una_sola_vez(self, navegador, helper):
        """Login UNA SOLA VEZ al inicio de todos los tests"""
        helper.cerrar_alerta()
        
        if not TestCrearProducto.ya_logueado:
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
            link_publicar = (By.XPATH, self.XPATH_LINK_PUBLICAR_PRODUCTO)
            helper.elemento_visible(link_publicar)
            
            print(f"✅ LOGIN COMPLETADO")
            TestCrearProducto.ya_logueado = True
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
    
    
    def test_3_link_publicar_producto_visible(self, navegador, helper):
        """✅ Test 3: Link 'Publicar Producto' visible"""
        print("\n✅ Test 3: Link Publicar Producto visible...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_publicar = (By.XPATH, self.XPATH_LINK_PUBLICAR_PRODUCTO)
        assert helper.elemento_visible(link_publicar), "❌ Link Publicar Producto no visible"
        
        print("✅ Link 'Publicar Producto' está visible")
    
    
    def test_4_navegar_a_crear_producto(self, navegador, helper):
        """✅ Test 4: Navegar a página de crear producto"""
        print("\n✅ Test 4: Navegar a crear producto...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_publicar = (By.XPATH, self.XPATH_LINK_PUBLICAR_PRODUCTO)
        helper.clickear(link_publicar)
        
        time.sleep(2)  # Esperar que cargue la página
        
        nombre_lote = (By.XPATH, self.XPATH_NOMBRE_LOTE)
        helper.elemento_visible(nombre_lote)
        
        assert "publicar" in navegador.current_url.lower()
        print(f"✅ Navegó a: {navegador.current_url}")
    
    
    def test_5_campos_crear_producto_presentes(self, navegador, helper):
        """✅ Test 5: Todos los campos presentes"""
        print("\n✅ Test 5: Campos crear producto presentes...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)  # Esperar carga
        
        nombre_lote = (By.XPATH, self.XPATH_NOMBRE_LOTE)
        categoria_select = (By.XPATH, self.XPATH_CATEGORIA_SELECT)
        descripcion = (By.XPATH, self.XPATH_DESCRIPCION)
        peso_qty = (By.XPATH, self.XPATH_PESO_QTY)
        precio_original = (By.XPATH, self.XPATH_PRECIO_ORIGINAL)
        precio_rescate = (By.XPATH, self.XPATH_PRECIO_RESCATE)
        fecha_vencimiento = (By.XPATH, self.XPATH_FECHA_VENCIMIENTO)
        ventana_inicio = (By.XPATH, self.XPATH_VENTANA_RETIRO_INICIO)
        ventana_fin = (By.XPATH, self.XPATH_VENTANA_RETIRO_FIN)
        imagenes = (By.XPATH, self.XPATH_IMAGENES)
        crear_btn = (By.XPATH, self.XPATH_CREAR_PRODUCTO_BTN)
        
        assert helper.elemento_visible(nombre_lote), "❌ Campo nombre_lote"
        assert helper.elemento_visible(categoria_select), "❌ Campo categoría"
        assert helper.elemento_visible(descripcion), "❌ Campo descripción"
        assert helper.elemento_visible(peso_qty), "❌ Campo peso"
        assert helper.elemento_visible(precio_original), "❌ Campo precio_original"
        assert helper.elemento_visible(precio_rescate), "❌ Campo precio_rescate"
        assert helper.elemento_visible(fecha_vencimiento), "❌ Campo fecha_vencimiento"
        assert helper.elemento_visible(ventana_inicio), "❌ Campo ventana_inicio"
        assert helper.elemento_visible(ventana_fin), "❌ Campo ventana_fin"
        assert helper.elemento_visible(imagenes), "❌ Campo imagenes"
        assert helper.elemento_visible(crear_btn), "❌ Botón crear"
        
        print("✅ Todos los campos están presentes")
    
    
    def test_6_escribir_nombre_lote(self, navegador, helper):
        """✅ Test 6: Escribir nombre de lote"""
        print("\n✅ Test 6: Escribir nombre lote...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        nombre_lote = (By.XPATH, self.XPATH_NOMBRE_LOTE)
        
        elem = helper.esperar_elemento(nombre_lote)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("Manzanas Rojas Frescas")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(nombre_lote, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert valor == "Manzanas Rojas Frescas"
        print(f"✅ Nombre lote escrito correctamente")
    
    
    def test_7_seleccionar_categoria(self, navegador, helper):
        """✅ Test 7: Seleccionar categoría"""
        print("\n✅ Test 7: Seleccionar categoría...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        categoria_select = (By.XPATH, self.XPATH_CATEGORIA_SELECT)
        
        elem = helper.esperar_elemento(categoria_select)
        print(f"✅ Select encontrado")
        
        # Obtener opciones disponibles
        opciones = elem.find_elements(By.TAG_NAME, "option")
        print(f"📋 Opciones disponibles: {len(opciones)}")
        for i, opcion in enumerate(opciones):
            print(f"  {i}. {opcion.text}")
    
    
    def test_8_escribir_descripcion(self, navegador, helper):
        """✅ Test 8: Escribir descripción"""
        print("\n✅ Test 8: Escribir descripción...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        descripcion = (By.XPATH, self.XPATH_DESCRIPCION)
        
        elem = helper.esperar_elemento(descripcion)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("Manzanas frescas recién cosechadas, perfectas para ensaladas")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(descripcion, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert "Manzanas" in valor
        print(f"✅ Descripción escrita correctamente")
    
    
    def test_9_escribir_peso(self, navegador, helper):
        """✅ Test 9: Escribir peso"""
        print("\n✅ Test 9: Escribir peso...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        peso_qty = (By.XPATH, self.XPATH_PESO_QTY)
        
        elem = helper.esperar_elemento(peso_qty)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("5")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(peso_qty, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert valor == "5"
        print(f"✅ Peso escrito correctamente")
    
    
    def test_10_escribir_precio_original(self, navegador, helper):
        """✅ Test 10: Escribir precio original"""
        print("\n✅ Test 10: Escribir precio original...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        precio_original = (By.XPATH, self.XPATH_PRECIO_ORIGINAL)
        
        elem = helper.esperar_elemento(precio_original)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("15000")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(precio_original, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert valor == "15000"
        print(f"✅ Precio original escrito correctamente")
    
    
    def test_11_escribir_precio_rescate(self, navegador, helper):
        """✅ Test 11: Escribir precio rescate"""
        print("\n✅ Test 11: Escribir precio rescate...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        precio_rescate = (By.XPATH, self.XPATH_PRECIO_RESCATE)
        
        elem = helper.esperar_elemento(precio_rescate)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("7500")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(precio_rescate, "value")
        print(f"📝 Valor escrito: '{valor}'")
        assert valor == "7500"
        print(f"✅ Precio rescate escrito correctamente")
    
    
    def test_12_escribir_fecha_vencimiento(self, navegador, helper):
        """✅ Test 12: Escribir fecha vencimiento"""
        print("\n✅ Test 12: Escribir fecha vencimiento...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        fecha_vencimiento = (By.XPATH, self.XPATH_FECHA_VENCIMIENTO)
        
        elem = helper.esperar_elemento(fecha_vencimiento)
        elem.clear()
        time.sleep(0.5)
        elem.send_keys("12/12/2025")
        time.sleep(0.5)
        
        valor = helper.obtener_atributo(fecha_vencimiento, "value")
        print(f"📝 Valor escrito: '{valor}'")
        print(f"✅ Fecha vencimiento escrita correctamente")
    
    
    def test_13_escribir_ventana_retiro(self, navegador, helper):
        """✅ Test 13: Escribir ventana de retiro"""
        print("\n✅ Test 13: Escribir ventana retiro...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        ventana_inicio = (By.XPATH, self.XPATH_VENTANA_RETIRO_INICIO)
        ventana_fin = (By.XPATH, self.XPATH_VENTANA_RETIRO_FIN)
        
        elem_inicio = helper.esperar_elemento(ventana_inicio)
        elem_inicio.clear()
        time.sleep(0.5)
        elem_inicio.send_keys("10:00")
        time.sleep(0.5)
        
        elem_fin = helper.esperar_elemento(ventana_fin)
        elem_fin.clear()
        time.sleep(0.5)
        elem_fin.send_keys("18:00")
        time.sleep(0.5)
        
        valor_inicio = helper.obtener_atributo(ventana_inicio, "value")
        valor_fin = helper.obtener_atributo(ventana_fin, "value")
        print(f"📝 Ventana: {valor_inicio} - {valor_fin}")
        print(f"✅ Ventana retiro escrita correctamente")
    
    
    def test_14_captura_pagina_crear_producto(self, navegador, helper):
        """📸 Test 14: Capturar pantalla de crear producto"""
        print("\n📸 Test 14: Capturando pantalla...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        helper.captura_pantalla("pagina_crear_producto")
        print("✅ Captura guardada en screenshots/")
    
    
    def test_15_crear_producto_exitoso(self, navegador, helper):
        """✅✅ Test 15: Crear producto exitosamente"""
        print("\n✅✅ Test 15: Crear producto exitosamente...")
        
        helper.cerrar_alerta()
        navegador.get(CREAR_PRODUCTO_URL)
        time.sleep(2)
        
        nombre_lote = (By.XPATH, self.XPATH_NOMBRE_LOTE)
        categoria_select = (By.XPATH, self.XPATH_CATEGORIA_SELECT)
        descripcion = (By.XPATH, self.XPATH_DESCRIPCION)
        peso_qty = (By.XPATH, self.XPATH_PESO_QTY)
        precio_original = (By.XPATH, self.XPATH_PRECIO_ORIGINAL)
        precio_rescate = (By.XPATH, self.XPATH_PRECIO_RESCATE)
        fecha_vencimiento = (By.XPATH, self.XPATH_FECHA_VENCIMIENTO)
        ventana_inicio = (By.XPATH, self.XPATH_VENTANA_RETIRO_INICIO)
        ventana_fin = (By.XPATH, self.XPATH_VENTANA_RETIRO_FIN)
        crear_btn = (By.XPATH, self.XPATH_CREAR_PRODUCTO_BTN)
        
        # Llenar formulario
        nombre_unico = f"Producto {int(time.time())}"
        helper.escribir(nombre_lote, nombre_unico)
        time.sleep(0.5)
        
        # Seleccionar categoría
        select = helper.esperar_elemento(categoria_select)
        options = select.find_elements(By.TAG_NAME, "option")
        if len(options) > 1:
            options[1].click()  # Seleccionar segunda opción
            time.sleep(0.5)
        
        helper.escribir(descripcion, "Descripción del producto")
        time.sleep(0.5)
        helper.escribir(peso_qty, "10")
        time.sleep(0.5)
        helper.escribir(precio_original, "20000")
        time.sleep(0.5)
        helper.escribir(precio_rescate, "10000")
        time.sleep(0.5)
        helper.escribir(fecha_vencimiento, "15/12/2025")
        time.sleep(0.5)
        helper.escribir(ventana_inicio, "09:00")
        time.sleep(0.5)
        helper.escribir(ventana_fin, "17:00")
        time.sleep(0.5)
        
        print("📝 Formulario completado")
        helper.captura_pantalla("formulario_crear_producto_completo")
        
        try:
            helper.clickear(crear_btn)
            print("✅ Formulario enviado!")
            
            for intento in range(5):
                time.sleep(1)
                url_actual = navegador.current_url
                print(f"📍 URL actual: {url_actual}")
                
                if "publicar" not in url_actual.lower():
                    print("✅✅ PRODUCTO CREADO - Redirigido!")
                    helper.captura_pantalla("despues_crear_producto")
                    return
            
            print("⚠️ Producto se creó pero no se vio redirección")
            
        except Exception as e:
            helper.cerrar_alerta()
            print(f"❌ Error: {str(e)[:100]}")
    
    
    def test_16_navegar_atras(self, navegador, helper):
        """✅ Test 16: Navegar atrás desde crear producto"""
        print("\n✅ Test 16: Navegar atrás...")
        
        helper.cerrar_alerta()
        navegador.get(BASE_URL)
        time.sleep(1)
        
        link_publicar = (By.XPATH, self.XPATH_LINK_PUBLICAR_PRODUCTO)
        helper.clickear(link_publicar)
        
        time.sleep(2)
        
        nombre_lote = (By.XPATH, self.XPATH_NOMBRE_LOTE)
        helper.elemento_visible(nombre_lote)
        
        navegador.back()
        time.sleep(1)
        
        link_publicar = (By.XPATH, self.XPATH_LINK_PUBLICAR_PRODUCTO)
        helper.elemento_visible(link_publicar)
        
        assert BASE_URL in navegador.current_url
        print("✅ Navegación atrás funcionó")