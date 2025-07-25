import { useState, useEffect } from "react";
import { X, User, UserPlus } from "lucide-react";
import { AddPersonModalProps } from "../types";

export default function AddPersonModal({
  isOpen,
  onClose,
  onAdd,
  editPerson = null,
}: AddPersonModalProps) {
  const [name, setName] = useState<string>(editPerson?.name || "");

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
    } else {
      setName("");
    }
  }, [editPerson]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl shadow-2xl w-full max-w-md transform animate-fade-in-scale">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              {editPerson ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <UserPlus className="w-5 h-5 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {editPerson ? "แก้ไขชื่อคน" : "เพิ่มคนใหม่"}
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="personName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ชื่อ
              </label>
              <input
                id="personName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ใส่ชื่อคน..."
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all glass-dark text-white placeholder-gray-400"
                autoFocus
              />
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
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 btn-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {editPerson ? "อัพเดท" : "เพิ่ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
