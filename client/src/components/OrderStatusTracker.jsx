import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  FileText,
  CreditCard,
  ChefHat,
  Flame,
  Gift,
  Bike,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

const steps = [
  { id: 1, key: 'Order Placed', label: 'Order Placed', desc: 'Received in bakery system', icon: FileText },
  { id: 2, key: 'Payment Successful', label: 'Payment Verified', desc: 'Secure merchant confirmation', icon: CreditCard },
  { id: 3, key: 'Order Accepted', label: 'Order Accepted', desc: 'Bakers assigned to your order', icon: ChefHat },
  { id: 4, key: 'Preparing Your Treats', label: 'Baking & Decorating', desc: 'Fresh in the kitchen', icon: Flame },
  { id: 5, key: 'Ready for Delivery', label: 'Packaged & Sealed', desc: 'Gift boxed with love', icon: Gift },
  { id: 6, key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your door', icon: Bike },
  { id: 7, key: 'Delivered', label: 'Sweetly Delivered', desc: 'Enjoy your bite of happiness!', icon: CheckCircle2 },
];

export default function OrderStatusTracker({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Real-time socket listener for this order
  useEffect(() => {
    if (!order?.orderId) return;

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('trackOrder', order.orderId);

    socket.on(`orderStatusChanged:${order.orderId}`, (data) => {
      if (data?.order) {
        setOrder(data.order);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.orderId]);

  const currentStatus = order?.orderStatus || 'Order Placed';
  const currentStepIndex = steps.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase());
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft">
      {/* Current Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#F5EBE1] gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78A7F] block">
            Current Live Status
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#3D2314] flex items-center gap-2 mt-0.5">
            <span className="animate-pulse w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            {currentStatus}
          </h3>
          <p className="text-xs text-[#7B4B29] mt-1">
            Order #{order.orderId} • Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="bg-[#FFF9F2] px-4 py-2.5 rounded-2xl border border-[#EEDDC9] text-right">
          <span className="text-[10px] uppercase font-bold text-[#A78A7F] block">Estimated Delivery</span>
          <span className="text-sm font-bold text-[#3D2314] flex items-center gap-1 justify-end">
            <Clock className="w-3.5 h-3.5 text-[#D68C98]" />
            35 - 45 Mins
          </span>
        </div>
      </div>

      {/* Visual Stepper Progression */}
      <div className="relative">
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-start gap-4 relative group">
                {/* Connecting line */}
                {idx !== steps.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-px transition-colors duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-[#EEDDC9]'
                    }`}
                  />
                )}

                {/* Step Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all z-10 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#3D2314] text-[#FAD2E1] ring-4 ring-[#FAD2E1] shadow-md animate-bounce-subtle'
                      : 'bg-[#FFF9F2] text-[#C29F87] border border-[#EEDDC9]'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>

                {/* Step Label & Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isCurrent
                          ? 'text-[#3D2314] font-serif text-base'
                          : isCompleted
                          ? 'text-[#3D2314]'
                          : 'text-[#A78A7F]'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="bg-[#FAD2E1] text-[#3D2314] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7B4B29] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
