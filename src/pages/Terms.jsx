import React from 'react';
import Navbar from '../components/Navbar';

const Terms = () => {
  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8 text-center">Policies & Terms</h1>

        <div className="bg-white p-8 border border-gray-100 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Terms and Conditions</h2>
            <p className="mb-4">
              Welcome to ZAFIRA. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Use of the Website</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>You must be at least 18 years old to use our website or make purchases.</li>
              <li>You are responsible for maintaining the confidentiality of your account information, including your username and password.</li>
              <li>You agree to provide accurate and current information during the registration and checkout process.</li>
              <li>You may not use our website for any unlawful or unauthorized purposes.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Product Information and Pricing</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.</li>
              <li>Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Orders and Payments</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>By placing an order on our website, you are making an offer to purchase the selected products.</li>
              <li>We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.</li>
              <li>You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and shipping fees, to your chosen payment method.</li>
              <li>We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Shipping and Delivery</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>We will make reasonable efforts to ensure timely shipping and delivery of your orders.</li>
              <li>Shipping and delivery times provided are estimates and may vary based on your location and other factors.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Returns and Refunds</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to the policy provided on our website for more information.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Intellectual Property</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of ZAFIRA or its licensors.</li>
              <li>You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Limitation of Liability</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>In no event shall ZAFIRA, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.</li>
              <li>We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Amendments and Termination</h3>
            <p className="mb-4">
              We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Privacy Policy</h2>
            <p className="mb-4">
              At ZAFIRA, we are committed to protecting the privacy and security of our customers' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or make a purchase on our website. By using our website, you consent to the practices described in this policy.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Information We Collect</h3>
            <p className="mb-2">When you visit our website, we may collect certain information about you, including:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Personal identification information (such as your name, email address, and phone number) provided voluntarily by you during the registration or checkout process.</li>
              <li>Payment and billing information necessary to process your orders, including credit card details, which are securely handled by trusted third-party payment processors.</li>
              <li>Browsing information, such as your IP address, browser type, and device information, collected automatically using cookies and similar technologies.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Use of Information</h3>
            <p className="mb-2">We may use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>To process and fulfill your orders, including shipping and delivery.</li>
              <li>To communicate with you regarding your purchases, provide customer support, and respond to inquiries or requests.</li>
              <li>To personalize your shopping experience and present relevant product recommendations and promotions.</li>
              <li>To improve our website, products, and services based on your feedback and browsing patterns.</li>
              <li>To detect and prevent fraud, unauthorized activities, and abuse of our website.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Information Sharing</h3>
            <p className="mb-2">We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Trusted service providers:</strong> We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering products. These providers are contractually obligated to handle your data securely and confidentially.</li>
              <li><strong>Legal requirements:</strong> We may disclose your information if required to do so by law or in response to valid legal requests or orders.</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Data Security</h3>
            <p className="mb-4">
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Cookies and Tracking Technologies</h3>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our website. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Changes to the Privacy Policy</h3>
            <p className="mb-4">
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with a revised "last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Contact Us</h3>
            <p className="mb-4">
              If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please contact us using the information provided on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Refund Policy</h2>
            <p className="mb-4">
              Thank you for shopping at ZAFIRA. We value your satisfaction and strive to provide you with the best online shopping experience possible. If, for any reason, you are not completely satisfied with your purchase, we are here to help.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Returns</h3>
            <p className="mb-4">
              We accept returns within 14 days from the date of purchase. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Refunds</h3>
            <p className="mb-4">
              Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Please note that the refund amount will exclude any shipping charges incurred during the initial purchase.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Exchanges</h3>
            <p className="mb-4">
              If you would like to exchange your item for a different size, color, or style, please contact our customer support team within 14 days of receiving your order. We will provide you with further instructions on how to proceed with the exchange.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Non-Returnable Items</h3>
            <p className="mb-2">Certain items are non-returnable and non-refundable. These include:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Gift cards</li>
              <li>Downloadable software products</li>
              <li>Personalized or custom-made items</li>
              <li>Perishable goods</li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Damaged or Defective Items</h3>
            <p className="mb-4">
              In the unfortunate event that your item arrives damaged or defective, please contact us immediately. We will arrange for a replacement or issue a refund, depending on your preference and product availability.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Return Shipping</h3>
            <p className="mb-4">
              You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item shipped, defective product). In such cases, we will provide you with a prepaid shipping label.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Processing Time</h3>
            <p className="mb-4">
              Refunds and exchanges will be processed within 5-7 business days after we receive your returned item. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider.
            </p>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">Contact Us</h3>
            <p className="mb-4">
              If you have any questions or concerns regarding our refund policy, please contact our customer support team. We are here to assist you and ensure your shopping experience with us is enjoyable and hassle-free.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Terms;
