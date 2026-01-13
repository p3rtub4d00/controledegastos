import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, 
  PieChart, X, ShoppingBag, Utensils, Car, Home, 
  Gamepad2, Briefcase, DollarSign, CheckCircle2, AlertCircle, 
  ChevronLeft, ChevronRight, Search, Download, Upload, RefreshCw, CreditCard,
  Eye, EyeOff, FilterX
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Toaster, toast } from 'sonner';

// --- CONFIGURAÇÕES E UTILITÁRIOS ---

const CATEGORIES = {
  food: { label: 'Alimentação', icon: Utensils, color: '#f59e0b' },
  transport: { label: 'Transporte', icon: Car, color: '#3b82f6' },
  home: { label: 'Casa', icon: Home, color: '#8b5cf6' },
  leisure: { label: 'Lazer', icon: Gamepad2, color: '#ec4899' },
  shopping: { label: 'Compras', icon: ShoppingBag, color: '#14b8a6' },
  salary: { label: 'Salário', icon: Briefcase, color: '#22c55e' },
  other: { label: 'Outros', icon: DollarSign, color: '#64748b' },
};

const formatCurrency = (value, isHidden) => {
  if (isHidden) return '••••••';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getMonthName = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const getTodayISO = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// --- COMPONENTES ---

const ProgressBar = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  let colorClass = 'bg-emerald-500';
  if (percentage > 75) colorClass = 'bg-yellow-500';
  if (percentage > 90) colorClass = 'bg-red-500';

  return (
    <div className="w-full bg-slate-200 rounded-full h-3 mb-1 overflow-hidden">
      <div className={`${colorClass} h-3 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const TransactionItem = ({ transaction, onDelete, onToggleStatus, isHidden }) => {
  const CategoryIcon = CATEGORIES[transaction.category]?.icon || CATEGORIES.other.icon;
  const isExpense = transaction.type === 'expense';
  const isPaid = transaction.status === 'paid';
  const isOverdue = !isPaid && transaction.date < getTodayISO() && isExpense;

  return (
    <div className={`flex items-center justify-between p-4 border border-slate-100 rounded-xl mb-3 transition-all ${isPaid ? 'bg-slate-50 opacity-60' : 'bg-white hover:shadow-md'} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-center gap-4 overflow-hidden">
        <button 
          onClick={() => onToggleStatus(transaction.id)} 
          className={`p-2 rounded-full transition-colors flex-shrink-0 ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          <CheckCircle2 size={20} />
        </button>
        
        <div className={`p-3 rounded-full hidden sm:block flex-shrink-0 ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
          <CategoryIcon size={20} />
        </div>
        
        <div className="min-w-0">
          <p className={`font-semibold truncate ${isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
            {transaction.description} 
            {transaction.installments > 1 && (
              <span className="text-xs ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block">
                {transaction.currentInstallment}/{transaction.installments}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="capitalize">{CATEGORIES[transaction.category]?.label}</span>
            <span>•</span>
            <span className={isOverdue ? "text-red-600 font-bold" : ""}>{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 pl-2">
        <span className={`font-bold whitespace-nowrap ${isHidden ? 'blur-sm select-none' : ''} ${isPaid ? 'text-slate-400' : isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount, false)}
        </span>
        <button 
          onClick={() => {
            toast('Excluir transação?', {
              action: {
                label: 'Excluir',
                onClick: () => onDelete(transaction.id),
              },
              cancel: { label: 'Cancelar' },
            });
          }} 
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
    description: '', amount: '', type: 'expense', category: 'food', date: getTodayISO(),
    isRecurring: false, isInstallment: false, installmentCount: 2
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, date: getTodayISO() }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, amount: parseFloat(formData.amount) });
    setFormData({ description: '', amount: '', type: 'expense', category: 'food', date: getTodayISO(), isRecurring: false, isInstallment: false, installmentCount: 2 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Nova Transação</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            {['income', 'expense'].map((type) => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === type ? (type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm') : 'text-slate-500 hover:bg-slate-200'}`}>
                {type === 'income' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Valor</label>
                <input type="number" step="0.01" required className="w-full text-lg font-bold p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="0,00"
                  value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
                <input type="date" required className="w-full text-lg p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                  value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <input type="text" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Mercado, Luz..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
            <select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
              value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>

          {formData.type === 'expense' && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked, isInstallment: false })} />
                <span className="text-sm text-slate-700">Despesa Fixa (Repetir 12 meses)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                  checked={formData.isInstallment}
                  onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked, isRecurring: false })} />
                <span className="text-sm text-slate-700">Compra Parcelada</span>
              </label>

              {formData.isInstallment && (
                <div className="pl-7 animate-in fade-in slide-in-from-top-2">
                   <label className="block text-xs font-medium text-slate-500 mb-1">Número de Parcelas</label>
                   <input type="number" min="2" max="48" className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                     value={formData.installmentCount} onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })} />
                </div>
              )}
            </div>
          )}

           {formData.type === 'income' && (
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                   checked={formData.isRecurring}
                   onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })} />
                 <span className="text-sm text-slate-700">Receita Fixa (Salário mensal)</span>
               </label>
             </div>
          )}

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
            Salvar Transação
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
  
  const [spendingGoal, setSpendingGoal] = useState(() => {
    return localStorage.getItem('finance_goal') || 2000;
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    return localStorage.getItem('finance_privacy') === 'true';
  });

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'income', 'expense', 'debt'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_goal', spendingGoal);
  }, [spendingGoal]);

  useEffect(() => {
    localStorage.setItem('finance_privacy', isPrivacyMode);
  }, [isPrivacyMode]);

  const addTransaction = (data) => {
    const newTransactions = [];
    const baseId = crypto.randomUUID();

    if (data.isRecurring) {
      for (let i = 0; i < 12; i++) {
        const date = new Date(data.date + 'T12:00:00');
        date.setMonth(date.getMonth() + i);
        newTransactions.push({ ...data, id: `${baseId}-${i}`, date: date.toISOString().split('T')[0], status: 'pending', installments: 1, currentInstallment: 1 });
      }
      toast.success(data.type === 'income' ? 'Receita fixa criada para o ano!' : 'Despesa fixa criada para o ano!');
    } else if (data.isInstallment) {
      const installmentValue = data.amount / data.installmentCount;
      for (let i = 0; i < data.installmentCount; i++) {
        const date = new Date(data.date + 'T12:00:00');
        date.setMonth(date.getMonth() + i);
        newTransactions.push({ ...data, amount: installmentValue, id: `${baseId}-${i}`, date: date.toISOString().split('T')[0], status: 'pending', installments: parseInt(data.installmentCount), currentInstallment: i + 1, description: `${data.description}` });
      }
      toast.success(`Compra parcelada em ${data.installmentCount}x criada!`);
    } else {
      newTransactions.push({ ...data, id: baseId, status: 'pending', installments: 1, currentInstallment: 1 });
      toast.success('Transação adicionada com sucesso!');
    }

    setTransactions([...newTransactions, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Registro apagado.');
  };

  const toggleStatus = (id) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: t.status === 'paid' ? 'pending' : 'paid' } : t));
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setActiveFilter('all'); // Reseta filtro ao mudar mês
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setActiveFilter('all');
  };

  const togglePrivacy = () => {
    setIsPrivacyMode(!isPrivacyMode);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_financas_${getTodayISO()}.json`;
    link.click();
    toast.success('Backup baixado com sucesso!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData)) {
            setTransactions(importedData);
            toast.success("Dados restaurados com sucesso!");
          } else {
            toast.error("Arquivo inválido.");
          }
        } catch (error) {
          toast.error("Erro ao ler o arquivo.");
        }
      };
      reader.readAsText(file);
    }
  };

  // --- FILTROS DE VISUALIZAÇÃO ---

  const getFilteredTransactions = () => {
    let filtered = [];

    // Se for filtro de DÍVIDA, ignora o mês e pega tudo que é parcela futura
    if (activeFilter === 'debt') {
      return transactions.filter(t => t.type === 'expense' && t.status === 'pending' && t.installments > 1);
    }

    // Filtro Padrão (Por Mês)
    filtered = transactions.filter(t => {
      const tDate = new Date(t.date + 'T12:00:00');
      return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
    });

    // Filtros de Cards (Receita/Despesa)
    if (activeFilter === 'income') filtered = filtered.filter(t => t.type === 'income');
    if (activeFilter === 'expense') filtered = filtered.filter(t => t.type === 'expense');

    // Filtro de Busca (Texto)
    if (searchTerm) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered;
  };

  const displayTransactions = getFilteredTransactions();

  const sortedTransactions = [...displayTransactions].sort((a, b) => {
    if (a.status === b.status) return new Date(b.date) - new Date(a.date);
    return a.status === 'paid' ? 1 : -1;
  });

  const overdueTransactions = transactions.filter(t => 
    t.date < getTodayISO() && t.status === 'pending' && t.type === 'expense'
  );

  // Totais do Mês (Para os Cards) - Calculados SEMPRE com base no mês total (independente do filtro da lista)
  const monthAllTransactions = transactions.filter(t => {
    const tDate = new Date(t.date + 'T12:00:00');
    return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
  });

  const summary = monthAllTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const totalInstallmentDebt = transactions.reduce((acc, t) => {
    if (t.type === 'expense' && t.status === 'pending' && t.installments > 1) {
      return acc + t.amount;
    }
    return acc;
  }, 0);

  const chartData = Object.entries(monthAllTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, {})).map(([key, value]) => ({ name: CATEGORIES[key].label, value, color: CATEGORIES[key].color }));

  return (
    <div className="min-h-screen pb-24 md:pb-10 px-4 pt-6 md:pt-8 max-w-7xl mx-auto bg-[#f8fafc]">
      <Toaster position="top-center" richColors />

      {/* Topo com Backup e Privacidade */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="text-blue-600" /> Finanças
        </h1>
        <div className="flex gap-2">
          <button onClick={togglePrivacy} title={isPrivacyMode ? "Mostrar Valores" : "Esconder Valores"} className="p-2 text-slate-500 hover:bg-white hover:text-slate-900 rounded-full transition-all border border-transparent hover:border-slate-200">
            {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
          <button onClick={exportData} title="Fazer Backup" className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-full transition-all border border-transparent hover:border-slate-200">
            <Download size={20} />
          </button>
          <button onClick={() => fileInputRef.current.click()} title="Restaurar Backup" className="p-2 text-slate-500 hover:bg-white hover:text-emerald-600 rounded-full transition-all border border-transparent hover:border-slate-200">
            <Upload size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ChevronLeft size={20} /></button>
          <div className="flex flex-col items-center w-40">
            <span className="font-bold text-slate-800 capitalize text-lg">{getMonthName(currentDate)}</span>
            <button onClick={goToToday} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <RefreshCw size={10} /> Ir para Hoje
            </button>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ChevronRight size={20} /></button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar conta..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => setViewMode('dashboard')} className={`pb-3 px-2 font-medium border-b-2 transition-colors ${viewMode === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Visão Mensal</button>
        <button onClick={() => setViewMode('overdue')} className={`pb-3 px-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${viewMode === 'overdue' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500'}`}>
          <AlertCircle size={18} /> Atrasados 
          {overdueTransactions.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{overdueTransactions.length}</span>}
        </button>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          {/* CARDS DE RESUMO COM CLICK */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div 
              onClick={() => setActiveFilter('all')}
              className={`bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${activeFilter === 'all' ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
            >
              <div className="relative z-10">
                <p className="text-slate-300 text-sm font-medium mb-1">Saldo Previsto</p>
                <h3 className={`text-2xl font-bold ${isPrivacyMode ? 'blur-md select-none' : ''}`}>{formatCurrency(summary.income - summary.expense, false)}</h3>
              </div>
              <Wallet className="absolute right-4 bottom-4 text-slate-700 opacity-50" size={48} />
            </div>
            
            <div 
              onClick={() => setActiveFilter(activeFilter === 'income' ? 'all' : 'income')}
              className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:border-emerald-200 ${activeFilter === 'income' ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Receitas</p>
                  <h3 className={`text-xl font-bold text-emerald-600 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>{formatCurrency(summary.income, false)}</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="text-emerald-500" size={20} /></div>
              </div>
            </div>

            <div 
              onClick={() => setActiveFilter(activeFilter === 'expense' ? 'all' : 'expense')}
              className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:border-rose-200 ${activeFilter === 'expense' ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Despesas do Mês</p>
                  <h3 className={`text-xl font-bold text-rose-600 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>{formatCurrency(summary.expense, false)}</h3>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg"><TrendingDown className="text-rose-500" size={20} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 flex items-center gap-1">Meta: <span className={isPrivacyMode ? 'blur-sm' : ''}>{formatCurrency(spendingGoal, false)}</span></span>
                  <span className={`${summary.expense > spendingGoal ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{Math.round((summary.expense / spendingGoal) * 100)}%</span>
                </div>
                <ProgressBar current={summary.expense} max={spendingGoal} />
              </div>
            </div>

            <div 
               onClick={() => setActiveFilter(activeFilter === 'debt' ? 'all' : 'debt')}
               className={`bg-white p-6 rounded-2xl shadow-sm border relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer ${activeFilter === 'debt' ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30' : 'border-indigo-100'}`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-indigo-500 text-sm font-medium mb-1">Dívida Parcelada Total</p>
                  <h3 className={`text-xl font-bold text-indigo-700 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>{formatCurrency(totalInstallmentDebt, false)}</h3>
                  <p className="text-[10px] text-indigo-400 mt-1">Soma de parcelas futuras pendentes</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg"><CreditCard className="text-indigo-500" size={20} /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={18} /> Gastos do Mês</h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer><RePieChart><Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}</Pie><Tooltip formatter={(val) => formatCurrency(val, isPrivacyMode)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} /></RePieChart></ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem gastos este mês</div>}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  Extrato 
                  {activeFilter !== 'all' && (
                    <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md flex items-center gap-1">
                       Filtro: {activeFilter === 'income' ? 'Receitas' : activeFilter === 'expense' ? 'Despesas' : 'Dívidas Futuras'}
                       <button onClick={() => setActiveFilter('all')}><FilterX size={12}/></button>
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="space-y-0">
                {sortedTransactions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl"><p className="text-slate-500">Nenhum lançamento encontrado para este filtro.</p></div>
                ) : (
                  sortedTransactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} onToggleStatus={toggleStatus} isHidden={isPrivacyMode} />)
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <AlertCircle size={32} />
            <div>
              <h2 className="text-xl font-bold">Contas em Atraso</h2>
              <p className="text-sm text-red-400">Contas vencidas e não pagas de meses anteriores.</p>
            </div>
          </div>
          {overdueTransactions.length === 0 ? (
            <div className="text-center py-10 bg-emerald-50 rounded-xl">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="text-emerald-700 font-bold">Tudo em dia!</h3>
            </div>
          ) : overdueTransactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} onToggleStatus={toggleStatus} isHidden={isPrivacyMode} />)}
        </div>
      )}

      {/* FAB Mobile */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform z-40 md:hidden">
        <Plus size={24} />
      </button>

      {/* Botão Desktop */}
      <button onClick={() => setIsModalOpen(true)} className="hidden md:flex fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform z-40 items-center gap-2 font-bold">
        <Plus size={20} /> Nova Transação
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addTransaction} />
    </div>
  );
}

export default App;
