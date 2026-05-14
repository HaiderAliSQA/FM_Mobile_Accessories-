import React from 'react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="pt-24 pb-20 px-6 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-fm-bg">
      <h1 className="font-playfair text-4xl text-white mb-4 text-center">Shipping Policy</h1>
      <p className="text-center font-dm text-white-2 mb-12">
        To ensure a premium unboxing experience, all FM Mobile orders are quality checked and carefully packaged. 
      </p>

      <div className="bg-navy-mid border border-navy-light p-8 lg:p-10 space-y-10">
        
        {/* Delivery Time */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-electric">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="font-playfair text-2xl text-white">Delivery Timelines</h2>
          </div>
          <p className="font-dm text-white-2 leading-relaxed ml-9">
            Our standard nationwide delivery typically takes <strong>3 to 5 working days</strong> from the moment your order is confirmed. Please note that during festive seasons or mega sales, dispatch procedures may encounter slight delays due to high order volumes.
          </p>
        </section>

        {/* Shipping Charges */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-electric">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <h2 className="font-playfair text-2xl text-white">Shipping Charges</h2>
          </div>
          <p className="font-dm text-white-2 leading-relaxed ml-9 mb-4">
            We provide priority delivery across all serviceable regions in Pakistan. To simplify your shopping experience, we charge a <strong>standard flat-rate shipping fee of PKR 300</strong> on all orders nationwide.
          </p>
          <div className="ml-9 p-4 bg-[#f8f5f0] border-l-2 border-fm-gold font-dm text-white text-sm italic">
            "No hidden costs. The PKR 300 flat fee covers priority handling and TCS courier services for your entire order."
          </div>
        </section>

        {/* Coverage */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-electric">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="font-playfair text-2xl text-white">Areas Covered & Couriers</h2>
          </div>
          <p className="font-dm text-white-2 leading-relaxed ml-9">
            FM Mobile dispatches solely via <strong>TCS Logistics</strong> to ensure a trusted priority handling process across major cities. We deliver to every city, town, and postal code accessible strictly by major courier networks within Pakistan.
          </p>
        </section>

        {/* Cash on Delivery */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-electric">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="font-playfair text-2xl text-white">Cash on Delivery (COD)</h2>
          </div>
          <p className="font-dm text-white-2 leading-relaxed ml-9 mb-3">
            Cash on Delivery is fully supported for all our accessory collections. 
          </p>
          <ul className="ml-9 list-disc pl-5 font-dm text-white-2 space-y-2">
            <li>You must pay the exact invoice amount exclusively to the courier before accepting the package.</li>
            <li>Opening the package before payment is physically restricted by courier regulations.</li>
            <li>In case of refusal upon delivery, your account may be flagged for restricted prepaid-only orders in the future.</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default ShippingPolicy;
