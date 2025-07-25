import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface MoneyFlowProps {
  isActive: boolean;
  hostName: string;
  payments: { name: string; amount: number }[];
  onComplete: () => void;
}

export default function MoneyFlowAnimation({ isActive, hostName, payments, onComplete }: MoneyFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatingPayments, setAnimatingPayments] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      if (currentStep < payments.length) {
        setAnimatingPayments(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          onComplete();
          setCurrentStep(0);
          setAnimatingPayments([]);
        }, 1000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, payments.length, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">💰 การแบ่งจ่าย</h2>
          <p className="text-gray-300">เงินไหลจาก {hostName} ไปหา...</p>
        </div>

        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div key={index} className="relative">
              <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${
                animatingPayments.includes(index) 
                  ? 'glass-dark border border-emerald-500/50 transform scale-105' 
                  : 'glass-dark opacity-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    animatingPayments.includes(index) 
                      ? 'bg-emerald-500' 
                      : 'bg-gray-500'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {payment.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-white">{payment.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {animatingPayments.includes(index) && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <DollarSign 
                          key={i}
                          className="w-4 h-4 text-emerald-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                  <span className={`font-bold text-lg transition-colors duration-500 ${
                    animatingPayments.includes(index) 
                      ? 'text-emerald-400' 
                      : 'text-gray-400'
                  }`}>
                    ฿{payment.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Money flow animation */}
              {animatingPayments.includes(index) && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-ping w-4 h-4 bg-emerald-400 rounded-full opacity-75"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / payments.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {currentStep} / {payments.length} การจ่าย
          </p>
        </div>
      </div>
    </div>
  );
}