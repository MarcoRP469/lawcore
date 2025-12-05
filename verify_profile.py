
import os
import sys
from playwright.sync_api import sync_playwright, expect
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Start - Check Home Page
        print("Navigating to home page...")
        page.goto("http://localhost:3000", timeout=60000)
        expect(page).to_have_title("LawCore")

        # 2. Register a new Public User
        print("Registering new user...")
        # Trigger auth dialog
        page.get_by_role("button", name="Registrarse").click()

        # Check tabs. AuthDialog has "Iniciar Sesión" and "Registrarse" tabs
        # Wait for dialog content
        expect(page.get_by_text("Inicia sesión o crea una cuenta para continuar.")).to_be_visible()

        # Click "Registrarse" tab (it is a TabsTrigger)
        page.get_by_role("tab", name="Registrarse").click()

        # Generate random email to avoid collision
        import random
        rand_id = random.randint(1000, 9999)
        email = f"testuser{rand_id}@example.com"
        password = "password123"
        name = f"Test User {rand_id}"

        page.get_by_placeholder("Tu nombre").fill(name)
        page.get_by_placeholder("tu@correo.com").fill(email)

        # Handle multiple password inputs.
        # The first "••••••••" is password, second is confirm.
        password_inputs = page.get_by_placeholder("••••••••").all()
        password_inputs[0].fill(password)
        password_inputs[1].fill(password)

        # Submit - Button text is "Crear Cuenta"
        page.get_by_role("button", name="Crear Cuenta").click()

        # Wait for login/redirect.
        # Check if Avatar appears in header
        # The initials in AvatarFallback might be "TU" (Test User)
        print("Waiting for login...")
        # Instead of specific initials, look for the dropdown trigger button which contains an Avatar
        # The button has no text usually, but might be identifiable.
        # Let's look for the logout option which appears in the dropdown, BUT we need to open it first.
        # The trigger is a button with an Avatar inside.

        # We can wait for the "Iniciar Sesión" button to DISAPPEAR
        expect(page.get_by_role("button", name="Iniciar Sesión")).not_to_be_visible(timeout=15000)

        # 3. Verify Profile Page
        print("Navigating to Profile...")

        # Find the user menu trigger. It's the only button in the header right area after login roughly.
        # We can try to locate it by the avatar image or just navigating to URL directly.
        # Let's navigate directly to be safe and robust.
        page.goto("http://localhost:3000/perfil")

        # Verify URL and Content
        expect(page).to_have_url("http://localhost:3000/perfil")
        expect(page.get_by_text("Mi Perfil")).to_be_visible()

        # Wait for data to load
        time.sleep(2)

        # Check values
        # Note: Input values need to be checked with `to_have_value`
        expect(page.locator("input#nombre")).to_have_value(name)
        expect(page.locator("input#email")).to_have_value(email)

        # Take Screenshot of Profile
        print("Taking screenshot of Profile...")
        page.screenshot(path="/home/jules/verification/profile_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
