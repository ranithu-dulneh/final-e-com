import base64
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # Load the shop page as we can see product details there
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(2000)
        page.screenshot(path="home.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
