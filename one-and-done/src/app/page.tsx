'use client';

import { useState, useEffect } from 'react';
import { 
  UserPlus, Plus, RefreshCw, Trash2, Calculator, Receipt, Share2, Download, 
  CheckCircle, ArrowLeft, Camera, CreditCard, Smartphone, Building2, QrCode, 
  Eye, Upload, Crown, HelpCircle, X, Edit3, Users, Minus
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/calculations';
import { Person, Item, ViewType, HostPaymentMethod, BillSummary } from '../types';

// Components
import AddPersonModal from '../components/AddPersonModal';
import AddItemModal from '../components/AddItemModal';

export default function Home() {
  // Main state
  const [people, setPeople] = useLocalStorage<Person[]>('billSplitter_people', []);
  const [items, setItems] = useLocalStorage<Item[]>('billSplitter_foods', []);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('main');
  
  // Onboarding states
  const [isFirstTime, setIsFirstTime] = useLocalStorage<boolean>('billSplitter_firstTime', true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHostReminder, setShowHostReminder] = useState(false);
  
  // Modal states
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHostPaymentModal, setShowHostPaymentModal] = useState(false);
  
  // Edit states
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Selection states
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedPersonSummary, setSelectedPersonSummary] = useState<string | null>(null);
  
  // Host/Payment states
  const [hostId, setHostId] = useLocalStorage<string | null>('billSplitter_hostId', null);
  const [hostPaymentMethod, setHostPaymentMethod] = useLocalStorage<HostPaymentMethod>('billSplitter_hostPaymentMethod', {
    type: 'qrcode',
    image: null,
    details: ''
  });

  // Check if first time user
  useEffect(() => {
    if (isFirstTime && people.length === 0 && items.length === 0) {
      setShowWelcome(true);
    }
  }, [isFirstTime, people.length, items.length]);

  // Person management
  const handleAddPerson = (name: string) => {
    if (editingPerson) {
      setPeople(people.map(p => p.id === editingPerson.id ? { ...p, name } : p));
      setEditingPerson(null);
    } else {
      const newPerson: Person = {
        id: generateId(),
        name
      };
      setPeople([...people, newPerson]);
      
      // Show host reminder if this is the first person or no host is set
      if (people.length === 0 || !hostId) {
        setShowHostReminder(true);
        setTimeout(() => setShowHostReminder(false), 5000);
      }
    }
    
    // Mark as not first time after adding first person
    if (isFirstTime) {
      setIsFirstTime(false);
    }
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setShowPersonModal(true);
  };

  const handleDeletePerson = (personId: string) => {
    if (confirm('แน่ใจหรือไม่ที่จะลบคนนี้? รายการที่เกี่ยวข้องจะถูกลบออกด้วย')) {
      setPeople(people.filter(p => p.id !== personId));
      setItems(items.map(item => ({
        ...item,
        participants: item.participants.filter(pid => pid !== personId)
      })).filter(item => item.participants.length > 0));
      
      if (hostId === personId) {
        setHostId(null);
      }
    }
  };

  // Item management
  const handleAddItem = (itemData: Omit<Item, 'id'>) => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...editingItem, ...itemData } : item
      ));
      setEditingItem(null);
    } else {
      const newItem: Item = {
        id: generateId(),
        ...itemData
      };
      setItems([...items, newItem]);
    }
    setSelectedPeople([]);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setSelectedPeople(item.participants);
    setShowItemModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('แน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  // Calculate bill summary
  const calculateBillSummary = (): BillSummary => {
    const billSummary: BillSummary = {};
    
    people.forEach(person => {
      billSummary[person.id] = {
        name: person.name,
        items: [],
        total: 0
      };
    });

    items.forEach(item => {
      const pricePerPerson = item.price / item.participants.length;
      item.participants.forEach(personId => {
        if (billSummary[personId]) {
          billSummary[personId].items.push({
            name: item.name,
            price: pricePerPerson,
            totalPrice: item.price,
            sharedWith: item.participants.length
          });
          billSummary[personId].total += pricePerPerson;
        }
      });
    });

    return billSummary;
  };

  const billSummary = calculateBillSummary();
  const totalBill = items.reduce((sum, item) => sum + item.price, 0);

  // Selection helpers
  const togglePersonSelection = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const selectAllPeople = () => {
    setSelectedPeople(people.map(p => p.id));
  };

  const clearSelectedPeople = () => {
    setSelectedPeople([]);
  };

  // Clear functions
  const clearAll = () => {
    if (confirm('คุณต้องการลบข้อมูลทั้งหมดใช่ไหม?')) {
      setPeople([]);
      setItems([]);
      setSelectedPeople([]);
      setHostId(null);
      setHostPaymentMethod({ type: 'qrcode', image: null, details: '' });
    }
  };

  const clearPeople = () => {
    if (confirm('คุณต้องการลบคนทั้งหมดใช่ไหม?')) {
      setPeople([]);
      setItems([]);
      setSelectedPeople([]);
      setHostId(null);
    }
  };

  const clearFoods = () => {
    if (confirm('คุณต้องการลบอาหารทั้งหมดใช่ไหม?')) {
      setItems([]);
      setSelectedPeople([]);
    }
  };

  // Export data
  const exportData = () => {
    const data = {
      people,
      foods: items,
      billSummary: calculateBillSummary(),
      totalBill,
      hostId,
      hostPaymentMethod,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-and-done-bill-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Payment method helpers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHostPaymentMethod({
          ...hostPaymentMethod,
          image: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const setHost = (personId: string) => {
    setHostId(personId);
  };

  const updateHostPaymentMethod = () => {
    if (hostPaymentMethod.image || hostPaymentMethod.details) {
      setShowHostPaymentModal(false);
    }
  };

  const viewPersonSummary = (personId: string) => {
    setSelectedPersonSummary(personId);
    setCurrentView('summary');
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'qrcode': return <QrCode className="w-4 h-4" />;
      case 'promptpay': return <Smartphone className="w-4 h-4" />;
      case 'bank': return <Building2 className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'qrcode': return 'QR Code';
      case 'promptpay': return 'PromptPay';
      case 'bank': return 'Bank Account';
      default: return 'อื่นๆ';
    }
  };

  const closeModals = () => {
    setShowPersonModal(false);
    setShowItemModal(false);
    setEditingPerson(null);
    setEditingItem(null);
    setSelectedPeople([]);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setIsFirstTime(false);
  };

  // Summary View
  if (currentView === 'summary' && selectedPersonSummary) {
    const person = people.find(p => p.id === selectedPersonSummary);
    const personBill = billSummary[selectedPersonSummary];
    const hostPerson = people.find(p => p.id === hostId || '');

    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}>
        {/* Header */}
        <div className="glass border-b sticky top-0 z-10 mb-8">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentView('main');
                  setSelectedPersonSummary(null);
                }}
                className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>กลับ</span>
              </button>
              <div className="text-center">
                <h1 className="text-xl font-bold gradient-text">สรุปการจ่าย</h1>
                <p className="text-sm text-gray-300">{person?.name}</p>
              </div>
              <div className="w-16"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bill Details */}
            <div className="glass rounded-xl p-6 shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">รายละเอียดการจ่าย</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-300">ยอดที่ต้องจ่าย</p>
                  <p className="text-2xl font-bold text-red-400">
                    ฿{personBill?.total.toFixed(2) || '0.00'}
                  </p>
                  {hostPerson && (
                    <p className="text-xs text-gray-400">
                      จ่ายให้ {hostPerson.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {personBill?.items.map((item, index) => (
                  <div key={index} className="glass-dark rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <span className="font-semibold text-red-400">
                        ฿{item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>ราคาต้นฉบับ: ฿{item.totalPrice.toFixed(2)}</p>
                      <p>หารกัน {item.sharedWith} คน</p>
                    </div>
                  </div>
                ))}

                {(!personBill?.items || personBill.items.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>ไม่มีรายการ</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="glass rounded-xl p-6 shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">วิธีการชำระเงิน</h2>
                {hostPerson && hostId === selectedPersonSummary && (
                  <button
                    onClick={() => setShowHostPaymentModal(true)}
                    className="btn-primary px-4 py-2 text-white rounded-lg text-sm"
                  >
                    {hostPaymentMethod.image || hostPaymentMethod.details ? 'แก้ไข' : 'เพิ่ม'}
                  </button>
                )}
              </div>

              {hostPerson ? (
                hostId === selectedPersonSummary ? (
                  <div className="space-y-4">
                    <div className="glass-dark rounded-lg p-4 border border-yellow-500/30">
                      <div className="text-center">
                        <div className="text-yellow-400 text-2xl mb-2">👑</div>
                        <h3 className="font-semibold text-yellow-400">คุณเป็นคนจ่าย</h3>
                        <p className="text-sm text-gray-300">คนอื่นจะจ่ายเงินให้คุณ</p>
                      </div>
                    </div>

                    {(hostPaymentMethod.image || hostPaymentMethod.details) ? (
                      <div className="glass-dark rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          {getPaymentIcon(hostPaymentMethod.type)}
                          <span className="font-medium">
                            {getPaymentTypeText(hostPaymentMethod.type)}
                          </span>
                        </div>
                        
                        {hostPaymentMethod.image && (
                          <div className="mt-3">
                            <img 
                              src={hostPaymentMethod.image} 
                              alt="Payment QR Code" 
                              className="w-full max-w-xs mx-auto rounded-lg border border-white/20"
                            />
                          </div>
                        )}
                        
                        {hostPaymentMethod.details && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-300 mb-1">รายละเอียด:</p>
                            <p className="font-mono text-sm bg-black/30 p-2 rounded mt-1">
                              {hostPaymentMethod.details}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>ยังไม่ได้ตั้งค่าวิธีการรับเงิน</p>
                        <button
                          onClick={() => setShowHostPaymentModal(true)}
                          className="mt-2 btn-primary px-4 py-2 text-white rounded-lg text-sm"
                        >
                          เพิ่มวิธีการรับเงิน
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass-dark rounded-lg p-4 border border-red-500/30">
                      <div className="text-center">
                        <div className="text-red-400 text-xl mb-2">💳</div>
                        <h3 className="font-semibold text-red-400">
                          จ่ายเงินให้ {hostPerson.name}
                        </h3>
                        <p className="text-2xl font-bold text-red-400 mt-1">
                          ฿{personBill?.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {(hostPaymentMethod.image || hostPaymentMethod.details) && (
                      <div className="glass-dark rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          {getPaymentIcon(hostPaymentMethod.type)}
                          <span className="font-medium">
                            {getPaymentTypeText(hostPaymentMethod.type)}
                          </span>
                        </div>
                        
                        {hostPaymentMethod.image && (
                          <div className="mt-3">
                            <img 
                              src={hostPaymentMethod.image} 
                              alt="Payment QR Code" 
                              className="w-full max-w-xs mx-auto rounded-lg border border-white/20"
                            />
                          </div>
                        )}
                        
                        {hostPaymentMethod.details && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-300 mb-1">รายละเอียด:</p>
                            <p className="font-mono text-sm bg-black/30 p-2 rounded mt-1">
                              {hostPaymentMethod.details}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => {
                              const text = `ชำระเงินให้ ${hostPerson.name}\nจำนวน: ฿${personBill?.total.toFixed(2)}\n${hostPaymentMethod.details ? `รายละเอียด: ${hostPaymentMethod.details}` : ''}`;
                              navigator.clipboard.writeText(text);
                              alert('คัดลอกข้อมูลแล้ว!');
                            }}
                            className="flex-1 btn-primary px-4 py-2 text-white rounded-lg text-sm"
                          >
                            Copy ข้อมูล
                          </button>
                          {hostPaymentMethod.image && (
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.download = `payment-${hostPerson.name}.png`;
                                link.href = hostPaymentMethod.image!;
                                link.click();
                              }}
                              className="btn-secondary px-4 py-2 text-white rounded-lg text-sm"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่ได้เลือกคนจ่าย</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
    }`}>
      {/* Header */}
      <div className="glass border-b sticky top-0 z-10 mb-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">One&Done</h1>
                <p className="text-sm text-gray-300">Bill Splitter Pro</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* First Time User Hint */}
              {isFirstTime && (
                <div className="animate-pulse-slow">
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium shadow-lg"
                  >
                    <span>👋</span>
                    <span>ครั้งแรก? คลิกที่นี่!</span>
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 glass-dark rounded-lg transition-colors hover:bg-white/10"
                title="คู่มือการใช้งาน"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 glass-dark rounded-lg transition-colors hover:bg-white/10"
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 btn-primary px-4 py-2 text-white rounded-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              {/* Clear Buttons Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 btn-danger px-4 py-2 text-white rounded-lg">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 top-full mt-1 w-48 glass rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={clearPeople}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-red-400 rounded-t-lg flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>ลบคนทั้งหมด</span>
                  </button>
                  <button
                    onClick={clearFoods}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-orange-400 flex items-center space-x-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>ลบอาหารทั้งหมด</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-red-400 rounded-b-lg flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบทั้งหมด</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* People Management */}
          <div className="glass rounded-xl p-8 shadow-lg animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-semibold">คนในปาร์ตี้</h2>
              <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300">
                {people.length}
              </span>
            </div>
            
            {/* Host Reminder */}
            {showHostReminder && (
              <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 animate-fade-in-scale">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300 font-medium">
                    💡 อย่าลืมกำหนด Host (คนจ่าย) ด้วยนะ!
                  </p>
                </div>
                <p className="text-xs text-yellow-400 mt-1">
                  กดปุ่ม 👑 เพื่อตั้งเป็นคนที่จ่ายเงินให้ทั้งหมด
                </p>
              </div>
            )}
            
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setShowPersonModal(true)}
                className="btn-primary px-4 py-2 text-white rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มคน</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {people.map(person => (
                <div key={person.id} className={`flex items-center justify-between p-3 glass-dark rounded-lg transition-all card-hover ${
                  hostId === person.id ? 'ring-2 ring-yellow-400/50' : ''
                }`}>
                  <div className="flex items-center space-x-2 flex-1">
                    {hostId === person.id && (
                      <span className="host-badge">HOST</span>
                    )}
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setHost(person.id)}
                      className={`p-1 rounded transition-colors ${
                        hostId === person.id 
                          ? 'text-yellow-400 bg-yellow-400/20' 
                          : 'hover:bg-white/10'
                      }`}
                      title="ตั้งเป็นคนจ่าย"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPerson(person)}
                      className="p-1 rounded transition-colors hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePerson(person.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-400/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {people.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="mb-4">ยังไม่มีคนในปาร์ตี้</p>
                  <button
                    onClick={() => setShowPersonModal(true)}
                    className="btn-primary px-6 py-3 text-white rounded-lg"
                  >
                    เพิ่มคนแรก
                  </button>
                </div>
              )}
            </div>

            {/* Host Payment Method Setup */}
            {hostId && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-300">วิธีการรับเงิน</p>
                  <button
                    onClick={() => setShowHostPaymentModal(true)}
                    className="text-xs px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                  >
                    {hostPaymentMethod.image || hostPaymentMethod.details ? 'แก้ไข' : 'ตั้งค่า'}
                  </button>
                </div>
                {(hostPaymentMethod.image || hostPaymentMethod.details) && (
                  <div className="text-xs text-gray-400">
                    <p>✅ ตั้งค่าแล้ว ({getPaymentTypeText(hostPaymentMethod.type)})</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Food Management */}
          <div className="glass rounded-xl p-8 shadow-lg animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-4">
              <Receipt className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">รายการอาหาร</h2>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                {items.length}
              </span>
            </div>

            <button
              onClick={() => setShowItemModal(true)}
              disabled={people.length === 0}
              className="w-full btn-primary px-4 py-2 text-white rounded-lg flex items-center justify-center space-x-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>

            {/* Food List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="glass-dark rounded-lg p-3 card-hover">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 rounded transition-colors hover:bg-white/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-400/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p>ราคา: ฿{item.price.toFixed(2)}</p>
                    <p>หารกัน {item.participants.length} คน: {
                      item.participants.map(id => people.find(p => p.id === id)?.name).join(', ')
                    }</p>
                    <p className="text-emerald-400 font-medium">
                      คนละ: ฿{(item.price / item.participants.length).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="mb-4">ยังไม่มีรายการอาหาร</p>
                  {people.length > 0 ? (
                    <button
                      onClick={() => setShowItemModal(true)}
                      className="btn-primary px-6 py-3 text-white rounded-lg"
                    >
                      เพิ่มรายการแรก
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm">เพิ่มคนก่อนเพื่อเพิ่มรายการ</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="glass rounded-xl p-8 shadow-lg animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold">สรุปการหาร</h2>
            </div>

            {/* Total Bill */}
            <div className="glass-dark rounded-lg p-4 mb-4 border border-purple-500/30">
              <p className="text-center">
                <span className="text-sm text-gray-300">ยอดรวมทั้งหมด</span>
              </p>
              <p className="text-2xl font-bold text-center text-purple-400">
                ฿{totalBill.toFixed(2)}
              </p>
            </div>

            {/* Individual Bills */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.values(billSummary).map(person => (
                <div key={person.name} className="glass-dark rounded-lg p-4 card-hover">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{person.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-emerald-400">
                        ฿{person.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => viewPersonSummary(
                          Object.keys(billSummary).find(id => billSummary[id].name === person.name) || ''
                        )}
                        className="p-1 rounded-lg btn-primary text-white transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {person.items.length > 0 && (
                    <div className="text-xs space-y-1 text-gray-300">
                      {person.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name} (หาร {item.sharedWith} คน)</span>
                          <span>฿{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {person.items.length > 3 && (
                        <p className="text-center text-blue-400">
                          และอีก {person.items.length - 3} รายการ...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {people.length === 0 || items.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีข้อมูลสรุป</p>
                  <p className="text-sm">เพิ่มคนและรายการแล้วจะมีสรุปค่าใช้จ่ายแสดงที่นี่</p>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      const summary = Object.values(billSummary)
                        .map(p => `${p.name}: ฿${p.total.toFixed(2)}`)
                        .join('\n');
                      navigator.clipboard.writeText(
                        `One&Done Bill Summary\n\n${summary}\n\nTotal: ฿${totalBill.toFixed(2)}`
                      );
                      alert('คัดลอกข้อมูลแล้ว!');
                    }}
                    className="w-full flex items-center justify-center space-x-2 btn-secondary px-4 py-2 text-white rounded-lg"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Summary</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal for First Time Users */}
      {showWelcome && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-lg animate-fade-in-scale">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">
                ยินดีต้อนรับสู่ One&Done!
              </h2>
              <p className="text-gray-300">
                เว็บแบ่งจ่ายค่าอาหารและเครื่องดื่มแบบยุติธรรม
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 glass-dark rounded-lg">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-white">เพิ่มคนในปาร์ตี้</p>
                  <p className="text-xs text-gray-400">รวมตัวคุณเองด้วย</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 glass-dark rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-white">ตั้งค่า Host (คนจ่าย)</p>
                  <p className="text-xs text-gray-400">กดปุ่ม 👑 เพื่อตั้งเป็นคนจ่าย</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 glass-dark rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-white">เพิ่มรายการอาหาร</p>
                  <p className="text-xs text-gray-400">เลือกคนที่กินแต่ละรายการ</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex-1 px-4 py-3 glass-dark border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                ดูคู่มือเต็ม
              </button>
              <button
                onClick={handleWelcomeClose}
                className="flex-1 px-4 py-3 btn-primary text-white rounded-xl font-medium"
              >
                เริ่มใช้งาน! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPersonModal
        isOpen={showPersonModal}
        onClose={closeModals}
        onAdd={handleAddPerson}
        editPerson={editingPerson}
      />

      <AddItemModal
        isOpen={showItemModal}
        onClose={closeModals}
        onAdd={handleAddItem}
        people={people}
        editItem={editingItem}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text">คู่มือการใช้งาน One&Done</h3>
                  <p className="text-sm text-gray-300">เว็บแบ่งจ่ายค่าอาหารและเครื่องดื่ม</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              {/* Quick Start */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-yellow-400">⚡ เริ่มต้นอย่างรวดเร็ว</h4>
                <div className="glass-dark rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h5 className="font-semibold text-emerald-400 mb-1">เพิ่มคน</h5>
                      <p className="text-xs">เพิ่มชื่อทุกคนในกลุ่ม</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h5 className="font-semibold text-yellow-400 mb-1">ตั้ง Host</h5>
                      <p className="text-xs">กำหนดคนที่จ่ายเงิน</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Receipt className="w-6 h-6 text-blue-400" />
                      </div>
                      <h5 className="font-semibold text-blue-400 mb-1">เพิ่มอาหาร</h5>
                      <p className="text-xs">บันทึกรายการและราคา</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* About Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-emerald-400">📋 เกี่ยวกับ One&Done</h4>
                <div className="glass-dark rounded-lg p-4">
                  <p className="mb-2">
                    <strong className="text-white">One&Done</strong> เป็นเว็บแอปสำหรับแบ่งจ่ายค่าอาหารและเครื่องดื่มเมื่อไปสังสรรค์กับเพื่อน
                  </p>
                  <p className="mb-2">
                    🎯 <strong className="text-emerald-400">เหมาะสำหรับ:</strong> คนที่จ่ายเงินให้ทั้งหมดก่อน แล้วต้องการให้เพื่อนจ่ายเงินคืน
                  </p>
                  <p>
                    ✨ <strong className="text-blue-400">จุดเด่น:</strong> คำนวณการแบ่งจ่ายแบบยุติธรรม - ใครกินอะไรจ่ายแค่นั้น
                  </p>
                </div>
              </div>

              {/* How to Use */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-blue-400">🚀 วิธีการใช้งาน</h4>
                <div className="space-y-4">
                  
                  <div className="glass-dark rounded-lg p-4 border-l-4 border-emerald-500">
                    <h5 className="font-semibold text-emerald-400 mb-2">ขั้นตอนที่ 1: จัดการคนในปาร์ตี้</h5>
                    <ul className="text-sm space-y-1">
                      <li>• เพิ่มชื่อคนในกลุ่ม (รวมตัวคุณเองด้วย)</li>
                      <li>• กดปุ่ม 👑 เพื่อตั้งตัวเองเป็น "คนจ่าย" (Host)</li>
                      <li>• ตั้งค่าวิธีการรับเงิน (QR Code, PromptPay, เลขบัญชี)</li>
                    </ul>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border-l-4 border-blue-500">
                    <h5 className="font-semibold text-blue-400 mb-2">ขั้นตอนที่ 2: เพิ่มรายการอาหาร</h5>
                    <ul className="text-sm space-y-1">
                      <li>• ใส่ชื่ออาหารและราคา</li>
                      <li>• เลือกคนที่กินอาหารนั้น</li>
                      <li>• กด "เพิ่มรายการ" เพื่อเพิ่มในรายการ</li>
                      <li>• ทำซ้ำจนครบทุกรายการ</li>
                    </ul>
                  </div>

                  <div className="glass-dark rounded-lg p-4 border-l-4 border-purple-500">
                    <h5 className="font-semibold text-purple-400 mb-2">ขั้นตอนที่ 3: ดูสรุปและรับเงิน</h5>
                    <ul className="text-sm space-y-1">
                      <li>• ดูสรุปการหารในส่วน "สรุปการหาร"</li>
                      <li>• กดปุ่ม 👁️ เพื่อดูรายละเอียดแต่ละคน</li>
                      <li>• แชร์ QR Code หรือข้อมูลการรับเงินให้เพื่อน</li>
                      <li>• รับเงินจากเพื่อนตามจำนวนที่แต่ละคนต้องจ่าย</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full px-4 py-3 btn-primary text-white rounded-lg font-medium"
                >
                  เข้าใจแล้ว เริ่มใช้งาน! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Host Payment Method Modal */}
      {showHostPaymentModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ตั้งค่าวิธีการรับเงิน</h3>
              <button
                onClick={() => setShowHostPaymentModal(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  ประเภทการรับเงิน
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'qrcode', label: 'QR Code', icon: QrCode },
                    { type: 'promptpay', label: 'PromptPay', icon: Smartphone },
                    { type: 'bank', label: 'Bank Account', icon: Building2 }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setHostPaymentMethod({ ...hostPaymentMethod, type: type as any })}
                      className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                        hostPaymentMethod.type === type
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'glass-dark border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  อัพโหลดรูป QR Code หรือรูปการรับเงิน
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="host-payment-image-upload"
                  />
                  <label
                    htmlFor="host-payment-image-upload"
                    className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-white/20 rounded-lg cursor-pointer transition-colors hover:border-white/40 glass-dark"
                  >
                    <Upload className="w-5 h-5" />
                    <span>เลือกรูปภาพ</span>
                  </label>
                  
                  {hostPaymentMethod.image && (
                    <div className="mt-2">
                      <img 
                        src={hostPaymentMethod.image} 
                        alt="Payment method preview" 
                        className="w-full max-w-xs mx-auto rounded-lg border border-white/20"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  รายละเอียดการรับเงิน (เลขบัญชี, เบอร์โทร, etc.)
                </label>
                <textarea
                  value={hostPaymentMethod.details}
                  onChange={(e) => setHostPaymentMethod({ ...hostPaymentMethod, details: e.target.value })}
                  placeholder="เช่น: เลขบัญชี 123-456-7890, PromptPay 081-234-5678"
                  className="w-full px-3 py-2 rounded-lg border border-white/20 glass-dark text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => setShowHostPaymentModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg glass-dark hover:bg-white/10 text-white border border-white/20"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={updateHostPaymentMethod}
                  disabled={!hostPaymentMethod.image && !hostPaymentMethod.details}
                  className="flex-1 px-4 py-2 btn-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}