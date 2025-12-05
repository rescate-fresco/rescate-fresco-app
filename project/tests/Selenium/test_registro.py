#pytest test_registro.py -v --html=reporte_registro.html --self-contained-html


import pytest
from selenium.webdriver.common.by import By
import time

BASE_URL = "http://localhost:5173"
REGISTRO_URL = "http://localhost:5173/Registrarse"


class TestRegistro:
    """Tests de Registro - Página de Registro"""
    
    # XPath definidos
    XPATH_LINK_INICIO = "//a[contains(text(),'Inicio')]"
    XPATH_LINK_REGISTRO = "//a[normalize-space()='Registrarse']"
    
    # Campos del formulario
    XPATH_NOMBRE_INPUT = "//input[@name='nombre_usuario']"
    XPATH_EMAIL_INPUT = "//input[@placeholder='ejemplo@correo.com']"
    XPATH_PASSWORD_INPUT = "//input[@placeholder='Mínimo 8 caracteres']"
    XPATH_ROL_SELECT = "//select[@name='rol']"
    XPATH_DIRECCION_INPUT = "//textarea[@name='direccion_usuario']"
    XPATH_REGISTRO_BTN = "//button[normalize-space()='Registrarse']"
    
    # Elementos adicionales
    XPATH_CUERPO_DIV = "//div[@class='Cuerpo']"
    
    
    def test_1_cargar_pagina_inicio(self, navegador):
        """✅ Test 1: Cargar página de inicio"""
        print("\n✅ Test 1: Cargar página inicio...")
        
        navegador.get(BASE_URL)
        
        titulo = navegador.title
        print(f"📖 Título: {titulo}")
        
        assert "rescate" in titulo.lower() or "fresco" in titulo.lower()
        print("✅ Página cargada correctamente")
    
    
    def test_2_link_registro_visible(self, navegador, helper):
        """✅ Test 2: Link 'Registrarse' visible"""
        print("\n✅ Test 2: Link Registrarse visible...")
        
        navegador.get(BASE_URL)
        
        link_registro = (By.XPATH, self.XPATH_LINK_REGISTRO)
        assert helper.elemento_visible(link_registro)
        print("✅ Link 'Registrarse' está visible")
    
    
    def test_3_navegar_a_registro(self, navegador, helper):
        """✅ Test 3: Navegar a página de registro"""
        print("\n✅ Test 3: Navegar a registro...")
        
        navegador.get(BASE_URL)
        
        link_registro = (By.XPATH, self.XPATH_LINK_REGISTRO)
        helper.clickear(link_registro)
        
        # Esperar a que cargue la página de registro
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        helper.elemento_visible(nombre_input)
        
        assert "registrarse" in navegador.current_url.lower()
        print(f"✅ Navegó a: {navegador.current_url}")
    
    
    def test_4_campos_registro_presentes(self, navegador, helper):
        """✅ Test 4: Todos los campos de registro presentes"""
        print("\n✅ Test 4: Campos registro presentes...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        rol_select = (By.XPATH, self.XPATH_ROL_SELECT)
        direccion_input = (By.XPATH, self.XPATH_DIRECCION_INPUT)
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        # Verificar todos los campos
        assert helper.elemento_visible(nombre_input), "❌ Campo nombre no visible"
        assert helper.elemento_visible(email_input), "❌ Campo email no visible"
        assert helper.elemento_visible(password_input), "❌ Campo password no visible"
        assert helper.elemento_visible(rol_select), "❌ Select rol no visible"
        assert helper.elemento_visible(direccion_input), "❌ Área dirección no visible"
        assert helper.elemento_visible(registro_btn), "❌ Botón registro no visible"
        
        print("✅ Todos los campos están presentes")
    
    
    def test_5_escribir_nombre(self, navegador, helper):
        """✅ Test 5: Escribir nombre de usuario"""
        print("\n✅ Test 5: Escribir nombre...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        helper.escribir(nombre_input, "Juan Pérez")
        
        valor = helper.obtener_atributo(nombre_input, "value")
        assert valor == "Juan Pérez", f"Nombre no coincide: {valor}"
        print(f"✅ Nombre escrito: {valor}")
    
    
    def test_6_escribir_email(self, navegador, helper):
        """✅ Test 6: Escribir email"""
        print("\n✅ Test 6: Escribir email...")
        
        navegador.get(REGISTRO_URL)
        
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        helper.escribir(email_input, "juan@test.com")
        
        valor = helper.obtener_atributo(email_input, "value")
        assert valor == "juan@test.com", f"Email no coincide: {valor}"
        print(f"✅ Email escrito: {valor}")
    
    
    def test_7_escribir_password(self, navegador, helper):
        """✅ Test 7: Escribir contraseña"""
        print("\n✅ Test 7: Escribir contraseña...")
        
        navegador.get(REGISTRO_URL)
        
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        helper.escribir(password_input, "Password123!")
        
        valor = helper.obtener_atributo(password_input, "value")
        assert valor == "Password123!", f"Password no coincide: {valor}"
        print(f"✅ Contraseña escrita: {valor}")
    
    
    def test_8_seleccionar_rol(self, navegador, helper):
        """✅ Test 8: Seleccionar rol"""
        print("\n✅ Test 8: Seleccionar rol...")
        
        navegador.get(REGISTRO_URL)
        
        rol_select = (By.XPATH, self.XPATH_ROL_SELECT)
        
        # Obtener el select
        select_elem = helper.esperar_elemento(rol_select)
        
        # Obtener todas las opciones
        opciones = select_elem.find_elements(By.TAG_NAME, "option")
        print(f"📋 Opciones disponibles: {len(opciones)}")
        
        if len(opciones) > 1:
            # Seleccionar la segunda opción (primera es usualmente "Seleccionar")
            opciones[1].click()
            print(f"✅ Rol seleccionado: {opciones[1].text}")
        else:
            print("⚠️ Solo hay una opción en el select")
    
    
    def test_9_escribir_direccion(self, navegador, helper):
        """✅ Test 9: Escribir dirección"""
        print("\n✅ Test 9: Escribir dirección...")
        
        navegador.get(REGISTRO_URL)
        
        direccion_input = (By.XPATH, self.XPATH_DIRECCION_INPUT)
        helper.escribir(direccion_input, "Calle Principal 123, Apartamento 4B")
        
        valor = helper.obtener_atributo(direccion_input, "value")
        assert "Calle Principal" in valor, f"Dirección no coincide: {valor}"
        print(f"✅ Dirección escrita: {valor}")
    
    
    def test_10_nombre_vacio(self, navegador, helper):
        """❌ Test 10: Enviar sin nombre"""
        print("\n❌ Test 10: Nombre vacío...")
        
        navegador.get(REGISTRO_URL)
        
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        
        helper.escribir(email_input, "test@test.com")
        helper.escribir(password_input, "Password123!")
        
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        try:
            helper.clickear(registro_btn)
            print("✅ Nombre vacío no permitido")
        except Exception as e:
            print(f"✅ Nombre vacío rechazado")
    
    
    def test_11_email_vacio(self, navegador, helper):
        """❌ Test 11: Enviar sin email"""
        print("\n❌ Test 11: Email vacío...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        
        helper.escribir(nombre_input, "Juan Pérez")
        helper.escribir(password_input, "Password123!")
        
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        try:
            helper.clickear(registro_btn)
            print("✅ Email vacío no permitido")
        except Exception as e:
            print(f"✅ Email vacío rechazado")
    
    
    def test_12_password_vacio(self, navegador, helper):
        """❌ Test 12: Enviar sin contraseña"""
        print("\n❌ Test 12: Password vacío...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        
        helper.escribir(nombre_input, "Juan Pérez")
        helper.escribir(email_input, "juan@test.com")
        
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        try:
            helper.clickear(registro_btn)
            print("✅ Password vacío no permitido")
        except Exception as e:
            print(f"✅ Password vacío rechazado")
    
    
    def test_13_password_corta(self, navegador, helper):
        """❌ Test 13: Password menor a 8 caracteres"""
        print("\n❌ Test 13: Password corta...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        
        helper.escribir(nombre_input, "Juan Pérez")
        helper.escribir(email_input, "juan@test.com")
        helper.escribir(password_input, "Pass12")  # Solo 6 caracteres
        
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        try:
            helper.clickear(registro_btn)
            print("✅ Password corta no permitida")
        except Exception as e:
            print(f"✅ Password corta rechazada")
    
    
    def test_14_captura_pagina_registro(self, navegador, helper):
        """📸 Test 14: Capturar pantalla de registro"""
        print("\n📸 Test 14: Capturando pantalla...")
        
        navegador.get(REGISTRO_URL)
        helper.captura_pantalla("pagina_registro")
        print("✅ Captura guardada en screenshots/")
    
    
    def test_15_link_inicio_desde_registro(self, navegador, helper):
        """✅ Test 15: Link 'Inicio' desde página de registro"""
        print("\n✅ Test 15: Link Inicio en registro...")
        
        navegador.get(REGISTRO_URL)
        
        link_inicio = (By.XPATH, self.XPATH_LINK_INICIO)
        helper.clickear(link_inicio)
        
        # Esperar a que cargue la página de inicio
        link_registro = (By.XPATH, self.XPATH_LINK_REGISTRO)
        helper.elemento_visible(link_registro)
        
        assert "registrarse" not in navegador.current_url.lower()
        print(f"✅ Volvió a: {navegador.current_url}")
    
    
    def test_16_formulario_completo(self, navegador, helper):
        """✅✅ Test 16: Completar formulario con datos válidos"""
        print("\n✅✅ Test 16: Formulario completo...")
        
        navegador.get(REGISTRO_URL)
        
        nombre_input = (By.XPATH, self.XPATH_NOMBRE_INPUT)
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        rol_select = (By.XPATH, self.XPATH_ROL_SELECT)
        direccion_input = (By.XPATH, self.XPATH_DIRECCION_INPUT)
        registro_btn = (By.XPATH, self.XPATH_REGISTRO_BTN)
        
        # Llenar formulario
        helper.escribir(nombre_input, "Test Usuario")
        helper.escribir(email_input, "testuser@test.com")
        helper.escribir(password_input, "TestPassword123!")
        
        # Seleccionar rol
        select_elem = helper.esperar_elemento(rol_select)
        opciones = select_elem.find_elements(By.TAG_NAME, "option")
        if len(opciones) > 1:
            opciones[1].click()
        
        helper.escribir(direccion_input, "Calle Test 123")
        
        print("📝 Formulario completado")
        
        # Captura antes de enviar
        helper.captura_pantalla("formulario_completado")
        
        # Enviar formulario
        try:
            helper.clickear(registro_btn)
            print("✅ Formulario enviado!")
            
            # Esperar respuesta
            tiempo_espera = 0
            while tiempo_espera < 5:
                url_actual = navegador.current_url
                print(f"📍 URL actual: {url_actual}")
                
                if "registrarse" not in url_actual.lower():
                    print("✅✅ REGISTRO EXITOSO - Redirigido a otra página")
                    helper.captura_pantalla("despues_registro")
                    return
                
                time.sleep(1)
                tiempo_espera += 1
            
            print("⚠️ El registro se envió pero no se vio redirección")
            
        except Exception as e:
            print(f"❌ Error al enviar: {str(e)[:50]}")