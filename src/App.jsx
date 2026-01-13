import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, 
  PieChart, X, ShoppingBag, Utensils, Car, Home, 
  Gamepad2, Briefcase, DollarSign 
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- CONFIGURAÇÃO E UTILITÁRIOS ---

const CATEGORIES = {
  food: { label: 'Alimentação', icon: Utensils, color: '#f59e0b' },
  transport: { label: 'Transporte', icon: Car, color: '#3b82f6' },
  home: { label: 'Casa', icon: Home, color: '#8b5cf6' },
  leisure: { label: 'Lazer', icon: Gamepad2, color: '#ec4899' },
  shopping: { label: 'Compras', icon: ShoppingBag, color: '#14b8a6' },
  salary: { label: 'Salário', icon: Briefcase, color: '#22c55e' },
  other: { label: 'Outros', icon: DollarSign, color: '#64748b' },
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// --- COMPONENTES ---

const CardSummary = ({ title, value, icon: Icon, type }) => {
  const typeColors = {
    balance: 'text-slate-800',
    income: 'text-emerald-600',
    expense: 'text-rose-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${typeColors[type]}`}>{formatCurrency(value)}</h3>
      </div>
      <div className={`p-3 rounded-xl ${type === 'income' ? 'bg-emerald-50' : type === 'expense' ? 'bg-rose-50' : 'bg-slate-100'}`}>
        <Icon className={`w-6 h-6 ${type === 'income' ? 'text-emerald-500' : type === 'expense' ? 'text-rose-500' : 'text-slate-600'}`} />
      </div>
    </div>
  );
};

const TransactionItem = ({ transaction, onDelete }) => {
  const CategoryIcon = CATEGORIES[transaction.category]?.icon || CATEGORIES.other.icon;
  const isExpense = transaction.type === 'expense';

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl mb-3 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
          <CategoryIcon size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{transaction.description}</p>
          <p className="text-xs text-slate-500 capitalize">{CATEGORIES[transaction.category]?.label || 'Outros'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-bold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
        </span>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="text-slate-300 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    onSave({ ...formData, amount: parseFloat(formData.amount) });
    setFormData({ description: '', amount: '', type: 'expense', category: 'food', date: new Date().toISOString().split('T')[0] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Nova Transação</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {['income', 'expense'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.type === type 
                    ? type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {type === 'income' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Valor</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full text-2xl font-bold p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              placeholder="Ex: Almoço, Freelance..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
              <input
                type="date"
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-4 shadow-lg shadow-slate-200">
            Adicionar Transação
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = summary.income - summary.expense;

  // Dados para o Gráfico (Agrupado por Categoria)
  const chartData = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
  ).map(([key, value]) => ({
    name: CATEGORIES[key].label,
    value,
    color: CATEGORIES[key].color
  }));

  return (
    <div className="min-h-screen pb-20 md:pb-10 px-4 pt-6 md:pt-10 max-w-6xl mx-auto">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Finanças
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie seus gastos de forma simples.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          <Plus size={20} /> Nova Transação
        </button>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <CardSummary 
          title="Saldo Atual" 
          value={balance} 
          icon={Wallet} 
          type="balance" 
        />
        <CardSummary 
          title="Receitas" 
          value={summary.income} 
          icon={TrendingUp} 
          type="income" 
        />
        <CardSummary 
          title="Despesas" 
          value={summary.expense} 
          icon={TrendingDown} 
          type="expense" 
        />
      </div>

      {/* Grid Principal: Gráfico + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Gráfico e Estatísticas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-slate-400" /> Gastos por Categoria
            </h3>
            
            <div className="h-64 w-full relative">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                  Sem dados de despesas
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Lista de Transações */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Últimas Transações</h3>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              {transactions.length} registros
            </span>
          </div>

          <div className="space-y-0">
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500">Nenhuma transação registrada.</p>
              </div>
            ) : (
              transactions.map(t => (
                <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* FAB Mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-300 hover:scale-110 transition-transform active:scale-90"
      >
        <Plus size={24} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addTransaction} />
    </div>
  );
}

export default App;
