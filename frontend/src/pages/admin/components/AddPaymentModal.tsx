// frontend/src/pages/admin/components/AddPaymentModal.tsx
import React, { useState } from 'react';
import { useRecordPaymentMutation } from '../../../store/api/wholesaleApi';
import { WholesaleOrder, WholesalePaymentMethod } from '../../../types';
import toast from 'react-hot-toast';

interface AddPaymentModalProps {
  order: WholesaleOrder;
  onClose: () => void;
}

const METHODS: { key: WholesalePaymentMethod; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'jazzcash', label: 'JazzCash', icon: '📱' },
  { key: 'easypaisa', label: 'Easypaisa', icon: '🟢' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { key: 'cheque', label: 'Cheque', icon: '📄' },
];

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ order, onClose }) => {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WholesalePaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId, setTransactionId] = useState('');
  const [installmentNote, setInstallmentNote] = useState('');

  const shopKeeper = order.shopKeeper;
  const remaining = order.totalDue;
  const amountNum = Number(amount);
  const amountError = amountNum > 0 && amountNum > remaining
    ? `Exceeds remaining due (PKR ${remaining.toLocaleString()})`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountNum || amountNum <= 0 || amountError) return;

    try {
      await recordPayment({
        orderId: order._id,
        shopKeeperId: typeof shopKeeper === 'string' ? shopKeeper : shopKeeper._id,
        amount: amountNum,
        method,
        transactionId: transactionId.trim() || undefined,
        paymentDate,
        installmentNote: installmentNote.trim() || undefined,
      }).unwrap();
      toast.success('Payment recorded successfully!');
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message || 'Failed to record payment';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-navy-mid border border-navy-light rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy-light flex items-center justify-between bg-navy-mid">
          <div>
            <h2 className="font-heading text-white text-xl font-bold">Record Payment</h2>
            <p className="text-gray-400 text-[11px] uppercase tracking-widest mt-0.5">
              {order.orderId} — {typeof shopKeeper === 'object' ? shopKeeper.shopName : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-navy-light">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Status */}
        <div className="mx-6 mt-5 p-4 bg-navy-dark border border-electric/20 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Order Total</p>
              <p className="text-white font-bold font-dm text-[13px] mt-1">PKR {order.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Paid</p>
              <p className="text-emerald-400 font-bold font-dm text-[13px] mt-1">PKR {order.totalPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Remaining</p>
              <p className="text-red-400 font-bold font-dm text-[13px] mt-1">PKR {remaining.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          
          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-1.5">
              Payment Amount (PKR) <span className="text-red-400">*</span>
            </label>
            <input
              id="payment-amount"
              type="number"
              min="1"
              max={remaining}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className={`w-full bg-navy-dark border px-4 py-3 text-white text-lg font-bold rounded-xl outline-none transition-all ${
                amountError ? 'border-red-500 focus:border-red-400' : 'border-navy-light focus:border-electric'
              }`}
            />
            {amountError ? (
              <p className="text-red-400 text-[11px] font-bold mt-1">{amountError}</p>
            ) : (
              <p className="text-gray-500 text-[11px] mt-1">Maximum: PKR {remaining.toLocaleString()}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-2">
              Payment Method <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                    method === m.key
                      ? 'border-electric bg-electric/10 text-white'
                      : 'border-navy-light bg-navy-dark text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-1.5">
              Payment Date <span className="text-red-400">*</span>
            </label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full bg-navy-dark border border-navy-light px-4 py-3 text-white rounded-xl outline-none focus:border-electric transition-all"
            />
          </div>

          {/* Transaction ID (optional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-1.5">
              Transaction / Reference ID <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="payment-transaction-id"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="JazzCash TxID, Cheque No..."
              className="w-full bg-navy-dark border border-navy-light px-4 py-3 text-white rounded-xl outline-none focus:border-electric transition-all placeholder-gray-600"
            />
          </div>

          {/* Installment Note (optional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-1.5">
              Installment Note <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="payment-installment-note"
              type="text"
              value={installmentNote}
              onChange={(e) => setInstallmentNote(e.target.value)}
              placeholder='e.g. "Week 3" or "January payment"'
              className="w-full bg-navy-dark border border-navy-light px-4 py-3 text-white rounded-xl outline-none focus:border-electric transition-all placeholder-gray-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-navy-light text-gray-300 hover:text-white hover:border-gray-500 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amountNum || !!amountError}
              className="flex-1 bg-electric text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recording...</>
              ) : (
                '✓ Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
