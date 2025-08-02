import { useState, useEffect } from 'react';
import { X, ShoppingCart, DollarSign, Users, CheckCircle } from 'lucide-react';
import { AddItemModalProps } from '../types';

export default function AddItemModal({ isOpen, onClose, onAdd, people, editItem = null }: AddItemModalProps) {
  const [name, setName] = useState<string>(editItem?.name || '');
  const [price, setPrice] = useState<string>(editItem?.price?.toString() || '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(editItem?.participants || []);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price.toString());
      setSelectedParticipants(editItem.participants);
    } else {
      setName('');
      setPrice('');
      setSelectedParticipants([]);
    }
  }, [editItem]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim() && price && selectedParticipants.length > 0) {
      onAdd({
        name: name.trim(),
        price: Number(price),
        participants: selectedParticipants
      });
      setName('');
      setPrice('');
      setSelectedParticipants([]);
      onClose();
    }
  };

  const toggleParticipant = (personId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const selectAll = () => {
    setSelectedParticipants(people.map(p => p.id));
  };

  const clearAll = () => {
    setSelectedParticipants([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl shadow-2xl w-full max-w-lg transform animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {editItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="itemName" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <ShoppingCart className="w-4 h-4" />
                <span>ชื่อรายการ</span>
              </label>
              <input
                id="itemName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ข้าวผัด, เบียร์ช้าง..."
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all glass-dark text-white placeholder-gray-400"
                autoFocus
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="itemPrice" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4" />
                <span>ราคา (บาท)</span>
              </label>
              <input
                id="itemPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all glass-dark text-white placeholder-gray-400"
              />
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Users className="w-4 h-4" />
                  <span>ใครมีส่วนร่วมบ้าง? ({selectedParticipants.length} คน)</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/30 transition-colors"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full hover:bg-gray-500/30 transition-colors"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              </div>

              {people.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>กรุณาเพิ่มคนก่อน</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {people.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => toggleParticipant(person.id)}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedParticipants.includes(person.id)
                          ? 'person-selected'
                          : 'person-unselected hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedParticipants.includes(person.id)
                          ? 'bg-white border-white'
                          : 'border-white/40'
                      }`}>
                        {selectedParticipants.includes(person.id) && (
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <span className="font-medium flex-1 text-left">
                        {person.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 transition-colors font-medium glass-dark"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !price || selectedParticipants.length === 0}
              className="flex-1 px-4 py-3 btn-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {editItem ? 'อัพเดท' : 'เพิ่ม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}