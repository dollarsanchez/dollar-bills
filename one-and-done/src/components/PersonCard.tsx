import { User, Edit2, Trash2 } from "lucide-react";
import { Person } from "../types";

interface PersonCardProps {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PersonCard({
  person,
  onEdit,
  onDelete,
}: PersonCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 card-hover group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{person.name}</h3>
            <p className="text-sm text-gray-500">สมาชิกในปาร์ตี้</p>
          </div>
        </div>

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="แก้ไข"
            type="button"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="ลบ"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
