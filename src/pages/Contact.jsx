import Navbar from "../components/Navbar";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              Contact Us
            </h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We would love to hear from you. Whether you have a question about our products,
              need assistance with an order, or just want to say hello, feel free to reach out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 shadow-sm border border-gray-100">
            {/* Contact Information */}
            <div className="space-y-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Get in Touch</h2>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold-50 text-gold-600 rounded-full">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email Us</h3>
                  <a href="mailto:zafirajewelleries@gmail.com" className="text-gray-600 hover:text-gold-600 transition-colors">
                    zafirajewelleries@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold-50 text-gold-600 rounded-full">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">WhatsApp</h3>
                  <a href="https://wa.me/94707506269" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold-600 transition-colors">
                    070 750 6269
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold-50 text-gold-600 rounded-full">
                  <Facebook size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Facebook</h3>
                  <a href="https://facebook.com/LuxeGiftings" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold-600 transition-colors">
                    Luxe Giftings
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold-50 text-gold-600 rounded-full">
                  <Instagram size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instagram</h3>
                  <a href="https://instagram.com/zafira.lk" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold-600 transition-colors">
                    Zafira.lk
                  </a>
                </div>
              </div>
            </div>

            {/* Simple Contact Form (Optional visuals) */}
            <div className="bg-gray-50 p-6 md:p-8">
               <h3 className="text-xl font-serif text-gray-900 mb-4">Send us a Message</h3>
               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 focus:border-gold-500 outline-none" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 border border-gray-300 focus:border-gold-500 outline-none" placeholder="Your Email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows="4" className="w-full px-4 py-2 border border-gray-300 focus:border-gold-500 outline-none" placeholder="How can we help?"></textarea>
                  </div>
                  <button className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors">
                    Send Message
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">*This form is for demonstration purposes.</p>
               </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
