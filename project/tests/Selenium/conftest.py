import pytest
import os
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()

BASE_URL = "http://localhost:5173"
TIMEOUT = 15


@pytest.fixture(scope="session")
def navegador_session():
    """Navegador Chrome para toda la sesión"""
    print("\n🌐 Iniciando Chrome...")
    
    opciones = webdriver.ChromeOptions()
    opciones.add_argument('--start-maximized')
    opciones.add_argument('--disable-blink-features=AutomationControlled')
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opciones
    )
    
    yield driver
    
    print("\n🛑 Cerrando Chrome...")
    driver.quit()


@pytest.fixture
def navegador(navegador_session):
    """Navegador limpio para cada test"""
    navegador_session.delete_all_cookies()
    navegador_session.get(BASE_URL)
    yield navegador_session


class Helper:
    """Funciones auxiliares para Selenium"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, TIMEOUT)
    
    def esperar_elemento(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def esperar_clickeable(self, locator):
        return self.wait.until(EC.element_to_be_clickable(locator))
    
    def esperar_visible(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))
    
    def clickear(self, locator):
        elem = self.esperar_clickeable(locator)
        elem.click()
    
    def escribir(self, locator, texto):
        elem = self.esperar_elemento(locator)
        elem.clear()
        elem.send_keys(texto)
    
    def obtener_texto(self, locator):
        elem = self.esperar_elemento(locator)
        return elem.text
    
    def obtener_atributo(self, locator, atributo):
        elem = self.esperar_elemento(locator)
        return elem.get_attribute(atributo)
    
    def elemento_visible(self, locator):
        try:
            self.esperar_visible(locator)
            return True
        except:
            return False
    
    def captura_pantalla(self, nombre):
        os.makedirs("screenshots", exist_ok=True)
        path = f"screenshots/{nombre}_{int(time.time())}.png"
        self.driver.save_screenshot(path)
        print(f"📸 Guardado: {path}")


@pytest.fixture
def helper(navegador):
    return Helper(navegador)