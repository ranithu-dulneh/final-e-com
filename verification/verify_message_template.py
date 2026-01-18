
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # I can't access Admin Panel due to auth.
    # However, I can verify the function output by injecting it into a page and running it.

    page.goto("about:blank")

    # Inject the function code
    js_code = """
    const getWhatsAppMessage = (status, order, tracking) => {
      const name = order.customer.name;
      const id = order.id.slice(-6);
      const trackInfo = tracking || "N/A";

      switch(status) {
        case "Order confirmed":
          const items = order.items.map(i => i.title).join(', ');
          const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
          const deliveryMethod = "Courier Service";
          const paymentMethod = order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Bank Deposit';

          return `Hi ${name},

Thank you for your order! This message is to confirm that we have received your request for the ${items}.
Here are your order details:

     ⭕Order Confirmed: ${time}
     ⭕Total Amount: Rs. ${parseFloat(order.totalAmount).toLocaleString()}
     ⭕Delivery Fee: ${order.deliveryCharge}
     ⭕Delivery Method: ${deliveryMethod}
     ⭕Payment Method: ${paymentMethod}
     ⭕Tracking No.: ${trackInfo}

Thank you for shopping with us!

zafira.vercel.app`;
        default:
            return "Other status";
      }
    };
    """

    page.add_script_tag(content=js_code)

    # Mock data
    mock_order = {
        "id": "order123456",
        "customer": { "name": "Kumudu Miss" },
        "items": [ { "title": "Double-Sided Four-Petal Clover Necklace" } ],
        "totalAmount": 1290,
        "deliveryCharge": 0,
        "paymentMethod": "bank"
    }

    # Evaluate
    result = page.evaluate(f"getWhatsAppMessage('Order confirmed', {mock_order}, 'A353960')")

    print("Generated Message:")
    print(result)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
