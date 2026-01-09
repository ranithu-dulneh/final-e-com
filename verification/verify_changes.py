from playwright.sync_api import sync_playwright, expect

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home
        page.goto("http://localhost:5173")

        # Wait for page to load
        page.wait_for_load_state("networkidle")

        # 1. Verify Login button in Navbar
        # Look for the user icon or link to /login
        login_link = page.locator("a[href='/login']")
        expect(login_link).to_be_visible()
        print("Login link found.")

        # 2. Verify Logo removed from Hero
        # The logo had alt="ZAFAIR Logo"
        logo = page.locator("img[alt='ZAFAIR Logo']")
        expect(logo).not_to_be_visible()
        print("Hero logo not visible (as expected).")

        # 3. Check for animation classes (indirectly via screenshot or class check)
        # We can check if the h1 has the class 'animate-fade-in-up'
        h1 = page.locator("h1")
        expect(h1).to_have_class(re.compile(r"animate-fade-in-up"))
        print("Animation class found on H1.")

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved to verification/verification.png")

        browser.close()

import re

if __name__ == "__main__":
    verify_changes()
