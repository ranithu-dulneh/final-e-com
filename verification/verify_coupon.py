
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the Admin Panel (login required, but we can try to hit the page or mock it)
    # Since I don't have auth, I will try to navigate to the Checkout page which is accessible if I have items in cart.
    # But wait, cart is empty by default.
    # I need to add an item to cart first.
    # Navigate to Shop, add item, then go to checkout.

    try:
        page.goto("http://localhost:5173/shop")
        page.wait_for_timeout(2000) # wait for products to load

        # Add first item to cart
        # Assuming there are products. If not, this might fail.
        # Let's try to find an "Add to Cart" button or link to product details.
        # Based on previous file reads, Shop has products.

        # Take a screenshot of shop page to see if products loaded
        page.screenshot(path="verification/shop_page.png")

        # Click on a product to go to details
        # We need to find a product link.
        # If products are loaded from firebase, it might take time.

        # Let's assume we can click the first product
        # product_card = page.locator('.product-card').first
        # product_card.click()

        # For now, let's just check if the admin panel has the new fields visually if we can access it.
        # The admin panel requires login.

        # Let's check the Checkout page UI for the coupon field.
        # We need to bypass the "Your cart is empty" check or manually inject cart items into localStorage.

        # Inject cart item into localStorage
        cart_item = '[{"id":"123","title":"Test Product","price":1000,"quantity":1,"couponCode":"TEST10","couponDiscount":100,"imageUrl":["https://placehold.co/100x100"]}]'

        page.add_init_script(f"window.localStorage.setItem('zafair_cart', '{cart_item}');")

        page.goto("http://localhost:5173/checkout")
        page.wait_for_timeout(2000)

        # Check if Coupon Input exists
        coupon_input = page.locator('input[placeholder="Coupon Code"]')
        if coupon_input.is_visible():
            print("Coupon input found!")
            coupon_input.fill("TEST10")
            page.click("button:has-text('Apply')")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/checkout_coupon_applied.png")
        else:
            print("Coupon input NOT found!")
            page.screenshot(path="verification/checkout_failed.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
