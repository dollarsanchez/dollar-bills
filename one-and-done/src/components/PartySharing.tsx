import { useState, useEffect } from "react";
import { QrCode, Share2, Copy, Download, X, Users, Eye } from "lucide-react";
import { Person, Item } from "../types";

interface PartySharingProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  items: Item[];
  hostId: string | null;
  billSummary: any;
}

// Simple QR Code generator (for demo - in production use a proper library)
function generateQRCodeSVG(text: string, size: number = 200): string {
  // This is a simplified QR code placeholder
  // In production, use a library like 'qrcode' or 'qr-code-generator'
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="70" y="10" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="20" height="20" fill="black"/>
      <rect x="160" y="10" width="20" height="20" fill="black"/>
      <rect x="170" y="10" width="20" height="20" fill="black"/>
      
      <rect x="10" y="40" width="20" height="20" fill="black"/>
      <rect x="70" y="40" width="20" height="20" fill="black"/>
      <rect x="100" y="40" width="20" height="20" fill="black"/>
      <rect x="160" y="40" width="20" height="20" fill="black"/>
      <rect x="170" y="40" width="20" height="20" fill="black"/>
      
      <rect x="40" y="70" width="20" height="20" fill="black"/>
      <rect x="70" y="70" width="20" height="20" fill="black"/>
      <rect x="130" y="70" width="20" height="20" fill="black"/>
      <rect x="160" y="70" width="20" height="20" fill="black"/>
      
      <rect x="10" y="100" width="20" height="20" fill="black"/>
      <rect x="40" y="100" width="20" height="20" fill="black"/>
      <rect x="100" y="100" width="20" height="20" fill="black"/>
      <rect x="130" y="100" width="20" height="20" fill="black"/>
      <rect x="170" y="100" width="20" height="20" fill="black"/>
      
      <rect x="70" y="130" width="20" height="20" fill="black"/>
      <rect x="100" y="130" width="20" height="20" fill="black"/>
      <rect x="160" y="130" width="20" height="20" fill="black"/>
      
      <rect x="10" y="160" width="20" height="20" fill="black"/>
      <rect x="40" y="160" width="20" height="20" fill="black"/>
      <rect x="100" y="160" width="20" height="20" fill="black"/>
      <rect x="130" y="160" width="20" height="20" fill="black"/>
      <rect x="170" y="160" width="20" height="20" fill="black"/>
      
      <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="8" fill="black">One&Done</text>
    </svg>
  `;
}

export default function PartySharing({
  isOpen,
  onClose,
  people,
  items,
  hostId,
  billSummary,
}: PartySharingProps) {
  const [partyId, setPartyId] = useState<string>("");
  const [partyUrl, setPartyUrl] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Generate unique party ID
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      setPartyId(id);

      // Create party URL (in production, this would be your actual domain)
      const url = `${window.location.origin}/party/${id}`;
      setPartyUrl(url);

      // Store party data in localStorage (in production, use a database)
      const partyData = {
        id,
        people,
        items,
        hostId,
        billSummary,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`party_${id}`, JSON.stringify(partyData));
    }
  }, [isOpen, people, items, hostId, billSummary]);

  useEffect(() => {
    if (selectedPerson && billSummary[selectedPerson]) {
      const personBill = billSummary[selectedPerson];
      const personUrl = `${partyUrl}/person/${selectedPerson}`;
      setQrCodeData(personUrl);
    } else {
      setQrCodeData(partyUrl);
    }
  }, [selectedPerson, partyUrl, billSummary]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("คัดลอกแล้ว!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQR = () => {
    const svg = generateQRCodeSVG(qrCodeData, 300);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `one-and-done-qr-${selectedPerson || "party"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "One&Done Party",
          text: "มาดูการแบ่งจ่ายของเราใน One&Done!",
          url: selectedPerson
            ? `${partyUrl}/person/${selectedPerson}`
            : partyUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      copyToClipboard(
        selectedPerson ? `${partyUrl}/person/${selectedPerson}` : partyUrl
      );
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const hostPerson = people.find((p) => p.id === hostId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-scale">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">แชร์ปาร์ตี้</h2>
              <p className="text-sm text-gray-300">
                แชร์ลิงก์หรือ QR Code ให้เพื่อน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  QR Code
                </h3>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: generateQRCodeSVG(qrCodeData, 180),
                    }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 btn-secondary px-4 py-2 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด</span>
                </button>
                <button
                  onClick={shareNative}
                  className="flex-1 btn-primary px-4 py-2 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>แชร์</span>
                </button>
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  เลือกการแชร์
                </h3>

                {/* Party Overview */}
                <div className="glass-dark rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      🎉 ภาพรวมปาร์ตี้
                    </span>
                    <button
                      onClick={() => setSelectedPerson("")}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedPerson === ""
                          ? "bg-emerald-500 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      เลือก
                    </button>
                  </div>
                  <p className="text-xs text-gray-300">
                    👥 {people.length} คน • 💰 ฿{totalAmount.toFixed(2)} • 🍽️{" "}
                    {items.length} รายการ
                  </p>
                </div>

                {/* Individual Person Links */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 font-medium">
                    หรือแชร์รายบุคคล:
                  </p>
                  {Object.values(billSummary).map((person: any) => (
                    <div
                      key={person.name}
                      className="glass-dark rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {person.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-white font-medium">
                              {person.name}
                            </span>
                            <p className="text-xs text-emerald-400">
                              ฿{person.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedPerson(
                              Object.keys(billSummary).find(
                                (id) => billSummary[id].name === person.name
                              ) || ""
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            selectedPerson ===
                            Object.keys(billSummary).find(
                              (id) => billSummary[id].name === person.name
                            )
                              ? "bg-emerald-500 text-white"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* URL Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ลิงก์ปาร์ตี้
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={
                      selectedPerson
                        ? `${partyUrl}/person/${selectedPerson}`
                        : partyUrl
                    }
                    readOnly
                    className="flex-1 px-3 py-2 glass-dark border border-white/20 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedPerson
                          ? `${partyUrl}/person/${selectedPerson}`
                          : partyUrl
                      )
                    }
                    className="btn-primary px-3 py-2 text-white rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Party Stats */}
              <div className="glass-dark rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">
                  📊 สถิติปาร์ตี้
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <p className="text-gray-300">คนทั้งหมด</p>
                    <p className="text-emerald-400 font-bold">
                      {people.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300">รายการ</p>
                    <p className="text-blue-400 font-bold">{items.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300">ยอดรวม</p>
                    <p className="text-purple-400 font-bold">
                      ฿{totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300">เฉลี่ย/คน</p>
                    <p className="text-yellow-400 font-bold">
                      ฿{(totalAmount / people.length).toFixed(2)}
                    </p>
                  </div>
                </div>
                {hostPerson && (
                  <div className="mt-3 pt-3 border-t border-white/20 text-center">
                    <p className="text-xs text-gray-300">
                      👑 Host:{" "}
                      <span className="text-yellow-400 font-medium">
                        {hostPerson.name}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 glass-dark rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">
              💡 วิธีการใช้งาน
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>
                • <strong>QR Code:</strong> ให้เพื่อนสแกนเพื่อดูข้อมูลได้ทันที
              </li>
              <li>
                • <strong>ลิงก์ปาร์ตี้:</strong> ส่งในกลุ่มไลน์หรือแชทได้
              </li>
              <li>
                • <strong>รายบุคคล:</strong>{" "}
                ส่งลิงก์เฉพาะคนให้แต่ละคนดูยอดตัวเอง
              </li>
              <li>
                • <strong>แชร์:</strong> ใช้ปุ่มแชร์เพื่อส่งผ่าน Social Media
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
