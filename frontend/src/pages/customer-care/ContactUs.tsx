import React, { useState } from 'react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate backend transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 px-6 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-fm-bg">
      <h1 className="font-playfair text-4xl text-fm-text mb-4 text-center">Contact Us</h1>
      <p className="text-center font-dm text-fm-text-2 mb-12 max-w-2xl mx-auto">
        We are here to assist you with any inquiries regarding our premium mobile accessories. Please reach out via the details below or send us a direct message.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white border border-fm-border p-8 hover:border-fm-gold transition-colors">
            <h3 className="font-playfair text-2xl text-fm-text mb-6">Our Headquarters</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center shrink-0 text-fm-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-dm font-bold text-sm text-fm-text uppercase tracking-widest mb-1">Address</h4>
                  <p className="font-dm text-fm-text-2 leading-relaxed">
                    Jhumra Chowk, Near MCB Bank<br />
                    Alamgir Road, Left Street No. 1<br />
                    Chiniot, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center shrink-0 text-fm-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-dm font-bold text-sm text-fm-text uppercase tracking-widest mb-1">Phone</h4>
                  <p className="font-dm text-fm-text-2">
                    <a href="tel:+923007002061" className="hover:text-fm-gold transition-colors">+92 300 700 2061</a>
                  </p>
                  <p className="font-dm text-xs text-fm-text-3 mt-1">Available Mon - Sat (10:00 AM - 08:00 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f8f5f0] flex items-center justify-center shrink-0 text-fm-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-dm font-bold text-sm text-fm-text uppercase tracking-widest mb-1">Email</h4>
                  <p className="font-dm text-fm-text-2">
                    <a href="mailto:Hafizhaideraliuet@gmail.com" className="hover:text-fm-gold transition-colors">Hafizhaideraliuet@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-fm-border p-8">
          <h3 className="font-playfair text-2xl text-fm-text mb-6">Send a Message</h3>

          {isSubmitted ? (
            <div className="bg-[#f8f5f0] border border-fm-gold/30 p-6 text-center">
              <span className="text-3xl mb-3 block">✓</span>
              <h4 className="font-playfair text-xl text-fm-text mb-2">Message Sent</h4>
              <p className="font-dm text-fm-text-2 text-sm">Thank you for contacting FM Mobile Accessories. One of our representatives will respond to your inquiry shortly.</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-6 text-fm-gold text-xs font-dm tracking-widest uppercase hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block font-dm text-xs font-bold text-fm-text uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block font-dm text-xs font-bold text-fm-text uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-dark"
                  placeholder="e.g. +92 300 0000000"
                />
              </div>
              <div>
                <label htmlFor="message" className="block font-dm text-xs font-bold text-fm-text uppercase tracking-widest mb-2">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="How can we assist you today?"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-dark w-full py-4 text-center disabled:opacity-70 disabled:cursor-not-allowed bg-fm-text text-white hover:bg-fm-gold transition-colors font-dm text-sm tracking-widest uppercase"
              >
                {isSubmitting ? 'Sending Request...' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
