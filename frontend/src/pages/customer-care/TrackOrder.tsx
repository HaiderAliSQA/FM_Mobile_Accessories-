import React, { useState } from 'react';

const TrackOrder: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [hasTracked, setHasTracked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock status steps
  const steps = [
    { label: 'Order Confirmed', description: 'Your order was successfully securely verified.', active: true, completed: true },
    { label: 'Shipped', description: 'Your package left our warehouse facility.', active: true, completed: true },
    { label: 'Out for Delivery', description: 'The TCS courier is actively en route geographically.', active: true, completed: false },
    { label: 'Delivered', description: 'Package safely reached destination.', active: false, completed: false },
  ];

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setIsLoading(true);
    setHasTracked(false);
    
    // Fake network request
    setTimeout(() => {
      setIsLoading(false);
      setHasTracked(true);
    }, 1200);
  };

  return (
    <div className="pt-24 pb-20 px-6 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen bg-fm-bg">
      <h1 className="font-playfair text-4xl text-white mb-4 text-center">Track Your Order</h1>
      <p className="text-center font-dm text-white-2 mb-12">
        Enter your tracking tracking ID or registered phone number internally provided during checkout strictly to monitor your parcel.
      </p>

      <div className="bg-navy-mid border border-navy-light p-8 mb-8">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. #FH-2098 or 0300 700 2061" 
            className="input-dark flex-grow py-3"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-dark sm:w-40 py-3 text-white bg-fm-text hover:bg-fm-gold transition-colors font-dm font-bold text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {hasTracked && (
        <div className="bg-navy-mid border border-navy-light p-8 animate-fadeIn">
          <h2 className="font-playfair text-2xl text-white mb-8 text-center pb-6 border-b border-navy-light">
            Status for {identifier.startsWith('#') ? identifier : `#FH-${Math.floor(Math.random()*9000)+1000}`}
          </h2>
          
          <div className="relative pl-6 lg:pl-10 space-y-12">
            {/* Vertical timeline line */}
            <div className="absolute left-9 lg:left-[50px] top-6 bottom-6 w-0.5 bg-fm-border"></div>

            {steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center gap-6">
                <div className={`
                  w-6 h-6 rounded-full flex shrink-0 items-center justify-center relative z-10 
                  ${step.completed ? 'bg-fm-gold text-white' : (step.active ? 'bg-navy-mid border-2 border-fm-gold' : 'bg-navy-mid border-2 border-navy-light')}
                `}>
                  {step.completed && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <h3 className={`font-dm font-bold uppercase tracking-widest text-sm mb-1 ${step.active ? 'text-white' : 'text-white-3'}`}>
                    {step.label}
                  </h3>
                  <p className="font-dm text-sm text-white-2">Contact our WhatsApp hotline (0301-7967300) sharing your Order ID and attached proof images depicting the current state.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default TrackOrder;
