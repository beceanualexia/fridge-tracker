'use client';
import { useState, useEffect } from 'react';
import { Outfit } from 'next/font/google';

// 2. Îl configurăm
const titleFont = Outfit({ 
  subsets: ['latin'], 
  weight: ['700'] 
});

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [form, setForm] = useState({ name: '', expiryDate: '' });

  const quickAddItems = [
    { emoji: '🥛', name: 'Milk' },
    { emoji: '🥚', name: 'Eggs' },
    { emoji: '🧀', name: 'Cheese' },
    { emoji: '🥩', name: 'Meat' },
    { emoji: '🥗', name: 'Salad' },
    { emoji: '🥕', name: 'Veggies' }
  ];

  const sortProducts = (list) => {
    return list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const sorted = sortProducts(data);
        setProducts(sorted);
        setFilteredProducts(sorted); 
      });
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  async function addProduct() {
    if (!form.name || !form.expiryDate) return;
    const res = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const newProduct = await res.json();
    
    const newList = sortProducts([...products, newProduct]);
    setProducts(newList);
    setForm({ name: '', expiryDate: '' }); 
  }

  async function deleteProduct(id) {
    await fetch('/api/products', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    const remaining = products.filter(p => p.id !== id);
    setProducts(remaining);
  }

  const fillForm = (itemName) => {
    setForm({ ...form, name: itemName });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen p-8 font-sans bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto">
        
        
        <h1 className={`text-5xl mb-2 text-center text-green-400 ${titleFont.className}`}>
          Fridge Tracker
        </h1>
        
        <p className="text-center text-gray-400 mb-8">Stop wasting food. Save the planet.</p>

        {/* --- Add Section --- */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-700">
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {quickAddItems.map((item) => (
              <button 
                key={item.name}
                onClick={() => fillForm(`${item.emoji} ${item.name}`)}
                className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1 rounded-full transition-colors whitespace-nowrap border border-slate-600"
              >
                {item.emoji} {item.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-black">
            <input 
              placeholder="Item name (e.g., Greek Yogurt)" 
              className="border border-slate-600 p-3 rounded-lg flex-grow outline-none focus:ring-2 focus:ring-green-500 bg-slate-100"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
            <input 
              type="date" 
              className="border border-slate-600 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-slate-100"
              value={form.expiryDate}
              onChange={e => setForm({...form, expiryDate: e.target.value})}
            />
            <button 
              onClick={addProduct}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold transition-transform active:scale-95 shadow-lg"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* --- Search Bar --- */}
        <div className="mb-6">
          <input 
            placeholder="🔍 Search your fridge..." 
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-green-500 placeholder-gray-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- List --- */}
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const productDate = new Date(product.expiryDate);
            const diffTime = productDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let statusColor = "bg-slate-800 border-l-green-500"; 
            let textColor = "text-white";
            let warningText = "";

            if (diffDays < 0) {
              statusColor = "bg-red-900/10 border-l-red-500 border border-red-900/30";
              textColor = "text-red-400";
              warningText = "⚠️ EXPIRED";
            } else if (diffDays >= 0 && diffDays <= 3) {
              statusColor = "bg-yellow-900/10 border-l-yellow-500 border border-yellow-900/30";
              textColor = "text-yellow-400";
              warningText = "⚠️ EAT SOON";
            }

            return (
              <div 
                key={product.id} 
                className={`flex justify-between items-center p-4 rounded-lg border-l-4 shadow-sm transition-all hover:translate-x-1 ${statusColor}`}
              >
                <div>
                  <span className={`text-lg font-bold block ${textColor}`}>
                    {product.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    Expires: {product.expiryDate} 
                    <span className={`font-bold ml-2 ${textColor}`}>
                       {warningText || `(${diffDays} days left)`}
                    </span>
                  </span>
                </div>
                <button 
                  onClick={() => deleteProduct(product.id)}
                  className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                  title="Delete Item"
                >
                  🗑️
                </button>
              </div>
            );
          })}
          
          {products.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <div className="text-6xl mb-2">🕸️</div>
              <p className="text-xl">Your fridge is empty.</p>
            </div>
          )}
           {products.length > 0 && filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No matching products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}