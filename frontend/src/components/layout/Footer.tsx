import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-dark text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="flex flex-col">
              <span className="font-heading text-2xl font-bold tracking-tight">
                <span className="text-electric">FM</span> Mobile Accessories
              </span>
              <span className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">
                Your One-Stop Mobile Shop
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Providing premium mobile accessories across Pakistan. Quality chargers, covers, and more at the best prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-navy-mid rounded-lg hover:bg-electric transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="p-2 bg-navy-mid rounded-lg hover:bg-electric transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://wa.me/923017967300" target="_blank" className="p-2 bg-navy-mid rounded-lg hover:bg-green-500 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.552.92 3.136 1.407 4.793 1.408h.001c5.403 0 9.8-4.397 9.802-9.802 0-2.618-1.02-5.08-2.871-6.932-1.851-1.852-4.311-2.872-6.93-2.872-5.404 0-9.803 4.398-9.806 9.803 0 1.834.512 3.62 1.48 5.161l-.985 3.593 3.681-.966zm12.336-6.721c-.328-.164-1.94-.958-2.241-1.069-.301-.111-.52-.164-.739.164-.219.328-.848 1.069-1.039 1.288-.192.219-.383.246-.711.082s-1.39-.512-2.646-1.633c-.977-.872-1.637-1.95-1.828-2.278-.191-.328-.02-.506.143-.669.148-.146.328-.383.492-.574.164-.191.219-.328.328-.546.109-.219.055-.41-.027-.574-.082-.164-.739-1.777-1.012-2.433-.266-.639-.537-.552-.739-.562-.191-.009-.41-.011-.628-.011-.219 0-.575.082-.875.41-.3.328-1.147 1.12-1.147 2.733 0 1.612 1.174 3.167 1.338 3.386.164.219 2.311 3.529 5.597 4.945.782.337 1.391.538 1.867.689.785.249 1.498.214 2.062.13.629-.094 1.94-.793 2.214-1.559.274-.766.274-1.422.191-1.559-.082-.136-.3-.219-.628-.383z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-heading text-lg font-bold text-white">Quick Links</h3>
            <ul className="flex flex-col space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-electric transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-electric transition-colors">All Categories</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-electric transition-colors">Your Cart</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-electric transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-electric transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Payments */}
          <div className="flex flex-col space-y-6 text-sm">
            <h3 className="font-heading text-lg font-bold text-white">Get in Touch</h3>
            <ul className="flex flex-col space-y-3 text-gray-400">
              <li className="flex items-center gap-3">
                <span className="text-electric">📍</span> Pakistan
              </li>
              <li className="flex items-center gap-3">
                <span className="text-electric">📧</span> Hafizhaideraliuet@gmail.com
              </li>
            </ul>
            <div className="mt-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Accepted Payments</span>
              <div className="flex flex-wrap gap-2">
                <span className="bg-navy-mid border border-white/5 px-2 py-1 rounded text-[10px] font-bold">COD</span>
                <span className="bg-navy-mid border border-white/5 px-2 py-1 rounded text-[10px] font-bold">JAZZCASH</span>
                <span className="bg-navy-mid border border-white/5 px-2 py-1 rounded text-[10px] font-bold">EASYPAISA</span>
                <span className="bg-navy-mid border border-white/5 px-2 py-1 rounded text-[10px] font-bold">BANK TRANSFER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} FM Mobile Accessories. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-400">
            <Link to="/shipping-policy" className="hover:text-electric">Shipping</Link>
            <Link to="/returns-policy" className="hover:text-electric">Returns</Link>
            <Link to="/contact" className="hover:text-electric">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
