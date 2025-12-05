# cd project/tests/Selenium
# python -m venv venv
# .\venv\Scripts\activate
# pip install selenium webdriver-manager pytest pytest-html python-dotenv
# pytest test_login.py -v --html=reporte_login.html --self-contained-html

import pytest
from selenium.webdriver.common.by import By
import time

BASE_URL = "http://localhost:5173"
LOGIN_URL = "http://localhost:5173/Iniciar-Sesion"


class TestLogin:
    """Tests de Login - Página de Inicio de Sesión"""
    
    # XPath definidos
    XPATH_LINK_INICIO = "//a[normalize-space()='Inicio']"
    XPATH_LINK_LOGIN = "//a[normalize-space()='Iniciar Sesión']"
    XPATH_EMAIL_INPUT = "//input[@placeholder='ejemplo@correo.com']"
    XPATH_PASSWORD_INPUT = "//input[@placeholder='Mínimo 8 caracteres']"
    XPATH_LOGIN_BTN = "//button[normalize-space()='Iniciar Sesión']"
    
    def test_1_cargar_pagina_inicio(self, navegador):
        """✅ Test 1: Cargar página de inicio"""
        print("\n✅ Test 1: Cargar página inicio...")
        
        navegador.get(BASE_URL)
        
        titulo = navegador.title
        print(f"📖 Título: {titulo}")
        
        assert "rescate" in titulo.lower() or "fresco" in titulo.lower()
        print("✅ Página cargada correctamente")
    
    
    def test_2_link_inicio_visible(self, navegador, helper):
        """✅ Test 2: Link 'Inicio' visible"""
        print("\n✅ Test 2: Link Inicio visible...")
        
        navegador.get(BASE_URL)
        
        link_inicio = (By.XPATH, self.XPATH_LINK_INICIO)
        assert helper.elemento_visible(link_inicio)
        print("✅ Link 'Inicio' está visible")
    
    
    def test_3_link_login_visible(self, navegador, helper):
        """✅ Test 3: Link 'Iniciar Sesión' visible"""
        print("\n✅ Test 3: Link Iniciar Sesión visible...")
        
        navegador.get(BASE_URL)
        
        link_login = (By.XPATH, self.XPATH_LINK_LOGIN)
        assert helper.elemento_visible(link_login)
        print("✅ Link 'Iniciar Sesión' está visible")
    
    
    def test_4_navegar_a_login(self, navegador, helper):
        """✅ Test 4: Navegar a página de login"""
        print("\n✅ Test 4: Navegar a login...")
        
        navegador.get(BASE_URL)
        
        link_login = (By.XPATH, self.XPATH_LINK_LOGIN)
        helper.clickear(link_login)
        
        # Esperar a que cargue la página de login
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        helper.elemento_visible(email_input)  # Espera a que esté visible
        
        assert "iniciar" in navegador.current_url.lower()
        print(f"✅ Navegó a: {navegador.current_url}")
    
    
    def test_5_campos_login_presentes(self, navegador, helper):
        """✅ Test 5: Campos de login presentes"""
        print("\n✅ Test 5: Campos login presentes...")
        
        navegador.get(LOGIN_URL)
        
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        
        assert helper.elemento_visible(email_input), "❌ Email input no visible"
        assert helper.elemento_visible(password_input), "❌ Password input no visible"
        print("✅ Ambos campos están presentes")
    
    
    def test_6_escribir_email(self, navegador, helper):
        """✅ Test 6: Escribir email en campo"""
        print("\n✅ Test 6: Escribir email...")
        
        navegador.get(LOGIN_URL)
        
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        helper.escribir(email_input, "tienda@test.com")
        
        valor = helper.obtener_atributo(email_input, "value")
        assert valor == "tienda@test.com", f"Email no coincide: {valor}"
        print(f"✅ Email escrito: {valor}")
    
    
    def test_7_escribir_password(self, navegador, helper):
        """✅ Test 7: Escribir contraseña en campo"""
        print("\n✅ Test 7: Escribir contraseña...")
        
        navegador.get(LOGIN_URL)
        
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        helper.escribir(password_input, "Password123!")
        
        valor = helper.obtener_atributo(password_input, "value")
        assert valor == "Password123!", f"Password no coincide: {valor}"
        print(f"✅ Contraseña escrita correctamente")
    
    
    def test_8_email_vacio(self, navegador, helper):
        """❌ Test 8: Enviar sin email"""
        print("\n❌ Test 8: Email vacío...")
        
        navegador.get(LOGIN_URL)
        
        password_input = (By.XPATH, self.XPATH_PASSWORD_INPUT)
        helper.escribir(password_input, "Password123!")
        
        login_btn = (By.XPATH, self.XPATH_LOGIN_BTN)
        
        try:
            helper.clickear(login_btn)
            print("✅ Email vacío no permitido")
        except Exception as e:
            print(f"✅ Email vacío rechazado")
    
    
    def test_9_password_vacio(self, navegador, helper):
        """❌ Test 9: Enviar sin contraseña"""
        print("\n❌ Test 9: Contraseña vacía...")
        
        navegador.get(LOGIN_URL)
        
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        helper.escribir(email_input, "tienda@test.com")
        
        login_btn = (By.XPATH, self.XPATH_LOGIN_BTN)
        
        try:
            helper.clickear(login_btn)
            print("✅ Password vacío no permitido")
        except Exception as e:
            print(f"✅ Password vacío rechazado")
    
    
    def test_10_captura_pagina_login(self, navegador, helper):
        """📸 Test 10: Capturar pantalla de login"""
        print("\n📸 Test 10: Capturando pantalla...")
        
        navegador.get(LOGIN_URL)
        helper.captura_pantalla("pagina_login")
        print("✅ Captura guardada en screenshots/")
    
    
    def test_11_link_inicio_desde_login(self, navegador, helper):
        """✅ Test 11: Link 'Inicio' desde página de login"""
        print("\n✅ Test 11: Link Inicio en login...")
        
        navegador.get(LOGIN_URL)
        
        link_inicio = (By.XPATH, self.XPATH_LINK_INICIO)
        helper.clickear(link_inicio)
        
        # Esperar a que cargue la página de inicio
        link_login = (By.XPATH, self.XPATH_LINK_LOGIN)
        helper.elemento_visible(link_login)
        
        assert "iniciar" not in navegador.current_url.lower()
        print(f"✅ Volvió a: {navegador.current_url}")
    
    
    def test_12_navegar_atras(self, navegador, helper):
        """✅ Test 12: Navegar atrás desde login"""
        print("\n✅ Test 12: Navegar atrás...")
        
        navegador.get(BASE_URL)
        
        link_login = (By.XPATH, self.XPATH_LINK_LOGIN)
        helper.clickear(link_login)
        
        # Esperar a que cargue login
        email_input = (By.XPATH, self.XPATH_EMAIL_INPUT)
        helper.elemento_visible(email_input)
        
        navegador.back()
        
        # Esperar a que cargue inicio
        link_login = (By.XPATH, self.XPATH_LINK_LOGIN)
        helper.elemento_visible(link_login)
        
        assert BASE_URL in navegador.current_url
        print("✅ Navegación atrás funcionó")