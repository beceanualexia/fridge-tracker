"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle, Search } from 'lucide-react';

export default function FridgeTracker() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Încărcăm datele din memoria telefonului
  useEffect(() => {
    const savedItems = localStorage.getItem('fridgeItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // 2. Funcție salvare
  const saveToPhone = (updatedItems) => {
    setItems(updatedItems);
    localStorage.setItem('fridgeItems', JSON.stringify(updatedItems));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.expiryDate) return;

    const itemToAdd = { 
      id: Date.now(), 
      ...newItem 
    };
    
    const updatedList = [...items, itemToAdd];
    saveToPhone(updatedList);
    setNewItem({ name: '', expiryDate: '', category: '' });
  };

  const deleteItem = (id) => {
    const updatedList = items.filter(item => item.id !== id);
    saveToPhone(updatedList);
  };

  // --- LOGICA DE CULORI (MODIFICATĂ PENTRU GALBEN AZI) ---
  const getStatusColor = (dateString) => {
    if (!dateString) return 'bg-slate-800';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetăm ceasul la 00:00 azi

    // Construim data corect (fără probleme de fus orar)
    const [year, month, day] = dateString.split('-').map(Number);
    const expiry = new Date(year, month - 1, day); 

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // REGULI:
    // < 0: Trecut (Ieri sau mai demult) -> ROSU
    // <= 3: Azi (0) + Următoarele 3 zile -> GALBEN
    // > 3: Viitor -> VERDE
    
    if (diffDays < 0) return 'bg-red-500/20 text-red-200 border-red-500/50'; 
    if (diffDays <= 3) return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50';
    return 'bg-green-500/20 text-green-200 border-green-500/50';
  };

  const filteredAndSortedItems = items
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  // --- QUICK ADD BUTTONS ---
  const quickAdd = (name) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7); 
    const dateStr = nextWeek.toISOString().split('T')[0];
    
    setNewItem({ 
        name: name, 
        expiryDate: dateStr, 
        category: 'General' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fridge Tracker
          </h1>
          <p className="text-slate-400 text-sm">Stop wasting food. Track it.</p>
        </div>

        {/* INPUT FORM */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-xl">
          <form onSubmit={addItem} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Product Name</label>
              <input
                type="text"
                placeholder="e.g., Milk, Eggs..."
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Expiry Date</label>
              <input
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-300" 
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add to Fridge
            </button>
          </form>

          {/* QUICK ADD */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['🥛 Milk', '🥚 Eggs', '🧀 Cheese', '🥗 Salad'].map((item) => (
              <button 
                key={item} 
                onClick={() => quickAdd(item.split(' ')[1])}
                type="button" 
                className="bg-slate-700/50 hover:bg-slate-600 px-3 py-1 rounded-full text-xs whitespace-nowrap border border-slate-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search your fridge..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p>Fridge is empty 🕸️</p>
            </div>
          ) : (
            filteredAndSortedItems.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${getStatusColor(item.expiryDate)}`}
              >
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs opacity-80 mt-1">
                    <AlertCircle size={12} />
                    <span>Expires: {item.expiryDate}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="p-2 hover:bg-slate-900/20 rounded-lg transition-colors text-current opacity-70 hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
