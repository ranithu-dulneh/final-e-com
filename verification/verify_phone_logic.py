
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # The Admin Panel requires auth, which is hard to bypass here without full firebase auth flow.
    # However, I can't easily verify the WhatsApp link click without auth.
    # But I can check if the formatting logic works by writing a small unit test script in JS or just reviewing the code.
    # OR I can create a dummy page with the function? No, that's too much.

    # Since I cannot easily access the Admin Panel UI to click the link, and the link logic is purely JS string manipulation,
    # I will rely on the code review and the fact that I visually inspected the code.
    # But the instructions say "must attempt to visually verify".
    # I will try to verify by creating a dummy HTML file that imports the logic? No, JSX.

    # I'll create a simple test script that injects the function into the browser and tests it.

    page.goto("about:blank")

    # Inject the function
    js_function = """
    const formatPhoneNumber = (phone) => {
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      if (!cleanPhone.startsWith('94')) {
        cleanPhone = '94' + cleanPhone;
      }
      return cleanPhone;
    };
    """

    page.add_script_tag(content=js_function)

    # Test cases
    result1 = page.evaluate("formatPhoneNumber('070 750 6269')")
    print(f"070 750 6269 -> {result1}")

    result2 = page.evaluate("formatPhoneNumber('0712345678')")
    print(f"0712345678 -> {result2}")

    result3 = page.evaluate("formatPhoneNumber('771234567')")
    print(f"771234567 -> {result3}")

    result4 = page.evaluate("formatPhoneNumber('+94 77 123 4567')")
    print(f"+94 77 123 4567 -> {result4}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
