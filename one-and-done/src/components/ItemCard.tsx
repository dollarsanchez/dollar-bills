import { ShoppingCart, Edit2, Trash2, Users } from "lucide-react";
import { formatCurrency } from "../utils/calculations";
import { Item, Person } from "../types";

interface ItemCardProps {
  item: Item;
  people: Person[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function ItemCard({
  item,
  people,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const participantNames = item.participants
    .map((id) => people.find((person) => person.id === id)?.name)
    .filter(Boolean);

  const pricePerPerson = item.price / item.participants.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 card-hover group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(item.price)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>คนละ {formatCurrency(pricePerPerson)}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {participantNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
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
