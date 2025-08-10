"use client";

import React from "react";
import { User, Receipt, Download, Copy, DollarSign } from "lucide-react";
import {
  formatCurrency,
  generateSummary,
  exportToCSV,
} from "../utils/calculations";
import { Person, Item } from "../types";

interface SummarySectionProps {
  people: Person[];
  items: Item[];
}

const SummarySection: React.FC<SummarySectionProps> = ({ people, items }) => {
  const summary = generateSummary(people, items);
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

  // คัดลอกข้อความสรุปไปยัง clipboard
  const handleCopyText = async () => {
    let text = "🧾 Divvy - สรุปค่าใช้จ่าย\n\n";
    text += `💰 ยอดรวมทั้งหมด: ${formatCurrency(totalAmount)}\n\n`;

    summary.forEach((person) => {
      text += `👤 ${person.name}: ${formatCurrency(person.total)}\n`;
      person.items.forEach((item) => {
        text += `   • ${item.name}: ${formatCurrency(item.splitPrice)}\n`;
      });
      text += "\n";
    });

    try {
      await navigator.clipboard.writeText(text);
      alert("คัดลอกข้อมูลเรียบร้อย!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("ไม่สามารถคัดลอกข้อมูลได้");
    }
  };

  // ดาวน์โหลด CSV
  const handleExportCSV = () => {
    const csv = exportToCSV(people, items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `one-and-done-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    URL.revokeObjectURL(url); // ✅ ป้องกัน memory leak
  };

  if (people.length === 0 || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ยังไม่มีข้อมูลสรุป
        </h3>
        <p className="text-gray-500">
          เพิ่มคนและรายการแล้วจะมีสรุปค่าใช้จ่ายแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">สรุปค่าใช้จ่าย</h2>
              <p className="text-green-100">
                ยอดรวมทั้งหมด: {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleCopyText}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="คัดลอกข้อมูล"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">คัดลอก</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="ดาวน์โหลด CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 space-y-4">
        {summary.map((person) => (
          <div
            key={person.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {person.items.length} รายการ
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(person.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            {person.items.length > 0 && (
              <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                {person.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-xs text-gray-500">
                        (หาร {item.participants.length} คน)
                      </span>
                    </div>
                    <span className="font-medium text-purple-600">
                      {formatCurrency(item.splitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">รายการทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">คนทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{people.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ค่าเฉลี่ย/คน</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                people.length > 0 ? totalAmount / people.length : 0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;