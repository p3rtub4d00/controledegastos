import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, 
  PieChart, X, ShoppingBag, Utensils, Car, Home, 
  Gamepad2, Briefcase, DollarSign, Calendar, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- UTILITÁRIOS ---

const CATEGORIES = {
  food: { label: 'Alimentação', icon: Utensils, color: '#f59e0b' },
  transport: { label: 'Transporte', icon: Car, color: '#3b82f6' },
  home: { label: 'Casa', icon: Home, color: '#8b5cf6' },
  leisure: { label: 'Lazer', icon: Gamepad2, color: '#ec4899' },
  shopping: { label: 'Compras', icon: ShoppingBag, color: '#14b8a6' },
  salary: { label: 'Salário', icon: Briefcase, color: '#22c55e' },
  other: { label: 'Outros', icon: DollarSign, color: '#64748b' },
};

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00'); // Fix fuso horário
  return date.toLocaleDateString('pt-BR');
};

const getMonthName = (date) => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

// --- COMPONENTES ---

const CardSummary = ({ title, value, icon: Icon, type }) => {
  const typeColors = {
    balance: 'text-slate-800',
    income: 'text-emerald-600',
    expense: 'text-rose-600',
    overdue: 'text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${typeColors[type]}`}>{formatCurrency(value)}</h3>
      </div>
      <div className={`p-3 rounded-xl ${type === 'income' ? 'bg-emerald-50' : type === 'expense' ? 'bg-rose-50' : type === 'overdue' ? 'bg-red-50' : 'bg-slate-100'}`}>
        <Icon className={`w-6 h-6 ${type === 'income' ? 'text-emerald-500' : type === 'expense' ? 'text-rose-500' : type === 'overdue' ? 'text-red-500' : 'text-slate-600'}`} />
      </div>
    </div>
  );
};

const TransactionItem = ({ transaction, onDelete, onToggleStatus }) => {
  const CategoryIcon = CATEGORIES[transaction.category]?.icon || CATEGORIES.other.icon;
  const isExpense = transaction.type === 'expense';
  const isPaid = transaction.status === 'paid';
  
  // Verifica se está atrasado (Data passada E não pago E é despesa)
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !isPaid && transaction.date < today && isExpense;

  return (
    <div className={`flex items-center justify-between p-4 border border-slate-100 rounded-xl mb-3 transition-all ${isPaid ? 'bg-slate-50 opacity-60' : 'bg-white hover:shadow-md'} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onToggleStatus(transaction.id)}
          className={`p-2 rounded-full transition-colors ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          <CheckCircle2 size={20} />
        </button>
        
        <div className={`p-3 rounded-full hidden sm:block ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
          <CategoryIcon size={20} />
        </div>
        
        <div>
          <p className={`font-semibold ${isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
            {transaction.description} 
            {transaction.installments > 1 && (
              <span className="text-xs ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {transaction.currentInstallment}/{transaction.installments}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="capitalize">{CATEGORIES[transaction.category]?.label}</span>
            <span>•</span>
            <span className={isOverdue ? "text-red-600 font-bold" : ""}>{formatDate(transaction.date)}</span>
            {isOverdue && <span className="text-red-600 font-bold">(Atrasado)</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className={`font-bold whitespace-nowrap ${isPaid ? 'text-slate-400' : isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
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
    description: '', amount: '', type: 'expense', category: 'food', date: new Date().toISOString().split('T')[0],
    isRecurring: false, isInstallment: false, installmentCount: 2
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    onSave({ ...formData, amount: parseFloat(formData.amount) });
    setFormData({ description: '', amount: '', type: 'expense', category: 'food', date: new Date().toISOString().split('T')[0], isRecurring: false, isInstallment: false, installmentCount: 2 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Nova Transação</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {['income', 'expense'].map((type) => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === type ? (type === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'text-slate-500'}`}>
                {type === 'income' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Valor</label>
                <input type="number" step="0.01" required className="w-full text-lg font-bold p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="0,00"
                  value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
                <input type="date" required className="w-full text-lg p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-700"
                  value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <input type="text" required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Ex: Aluguel, Cartão..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
            <select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white"
              value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>

          {/* Opções Avançadas */}
          {formData.type === 'expense' && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
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
                   <input type="number" min="2" max="48" className="w-full p-2 border border-slate-200 rounded-lg"
                     value={formData.installmentCount} onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {formData.type === 'income' && (
             <div className="p-4 bg-slate-50 rounded-xl">
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para controlar o Mês atual
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' ou 'overdue'

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Função para adicionar (com lógica de parcelas/fixas)
  const addTransaction = (data) => {
    const newTransactions = [];
    const baseId = crypto.randomUUID();

    if (data.isRecurring) {
      // Gera 12 meses de despesa fixa
      for (let i = 0; i < 12; i++) {
        const date = new Date(data.date);
        date.setMonth(date.getMonth() + i);
        newTransactions.push({
          ...data,
          id: `${baseId}-${i}`,
          date: date.toISOString().split('T')[0],
          status: 'pending',
          installments: 1,
          currentInstallment: 1
        });
      }
    } else if (data.isInstallment) {
      // Gera as parcelas
      const installmentValue = data.amount / data.installmentCount;
      for (let i = 0; i < data.installmentCount; i++) {
        const date = new Date(data.date);
        date.setMonth(date.getMonth() + i);
        newTransactions.push({
          ...data,
          amount: installmentValue,
          id: `${baseId}-${i}`,
          date: date.toISOString().split('T')[0],
          status: 'pending',
          installments: parseInt(data.installmentCount),
          currentInstallment: i + 1,
          description: `${data.description}` // A UI vai mostrar "1/10"
        });
      }
    } else {
      // Transação Normal
      newTransactions.push({
        ...data,
        id: baseId,
        status: 'pending',
        installments: 1,
        currentInstallment: 1
      });
    }

    setTransactions([...newTransactions, ...transactions]);
  };

  const deleteTransaction = (id) => {
    if(confirm("Tem certeza? Se for parcela, apaga somente esta.")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: t.status === 'paid' ? 'pending' : 'paid' } : t
    ));
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // --- FILTROS E CÁLCULOS ---

  // 1. Filtra transações do mês selecionado
  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date + 'T00:00:00');
    return tDate.getMonth() === currentDate.getMonth() && 
           tDate.getFullYear() === currentDate.getFullYear();
  });

  // 2. Ordena: Pendentes primeiro, Pagos depois
  const sortedTransactions = [...monthTransactions].sort((a, b) => {
    if (a.status === b.status) return new Date(b.date) - new Date(a.date);
    return a.status === 'paid' ? 1 : -1;
  });

  // 3. Filtra Atrasados (Anterior a hoje E pendente)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTransactions = transactions.filter(t => 
    t.date < todayStr && t.status === 'pending' && t.type === 'expense'
  );

  const summary = monthTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    
    // Saldo considera: Receita Total - Despesa Total (Independente de pago ou não, para previsão)
    // Se quiser Saldo Real (só o que pagou/recebeu), adicione filtro t.status === 'paid'
    return acc;
  }, { income: 0, expense: 0 });

  const balance = summary.income - summary.expense;

  const chartData = Object.entries(monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {})).map(([key, value]) => ({ name: CATEGORIES[key].label, value, color: CATEGORIES[key].color }));

  return (
    <div className="min-h-screen pb-20 md:pb-10 px-4 pt-6 md:pt-10 max-w-6xl mx-auto">
      
      {/* Header & Navegação de Mês */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Finanças
          </h1>
        </div>

        {/* Seletor de Mês Centralizado */}
        <div className="flex items-center bg-white rounded-full shadow-sm border border-slate-200 p-1">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 font-bold text-slate-800 w-40 text-center capitalize">
            {getMonthName(currentDate)}
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium items-center gap-2 hover:bg-slate-800 shadow-lg">
          <Plus size={20} /> Nova Transação
        </button>
      </header>

      {/* Navegação entre Abas (Dashboard vs Atrasados) */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setViewMode('dashboard')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 ${viewMode === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Visão Mensal
        </button>
        <button 
          onClick={() => setViewMode('overdue')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${viewMode === 'overdue' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-red-500'}`}
        >
          <AlertCircle size={18} /> 
          Contas em Atraso 
          {overdueTransactions.length > 0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2 rounded-full">{overdueTransactions.length}</span>
          )}
        </button>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CardSummary title="Saldo Previsto" value={balance} icon={Wallet} type="balance" />
            <CardSummary title="Receitas Totais" value={summary.income} icon={TrendingUp} type="income" />
            <CardSummary title="Despesas Totais" value={summary.expense} icon={TrendingDown} type="expense" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={18} /> Gastos do Mês</h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer><RePieChart><Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}</Pie><Tooltip formatter={(val) => formatCurrency(val)} /></RePieChart></ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem gastos este mês</div>}
              </div>
            </div>

            {/* Lista de Transações */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-slate-800 mb-4">Extrato de {getMonthName(currentDate)}</h3>
              <div className="space-y-0">
                {sortedTransactions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl"><p className="text-slate-500">Nenhum lançamento neste mês.</p></div>
                ) : (
                  sortedTransactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} onToggleStatus={toggleStatus} />)
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Tela de Atrasados */
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <AlertCircle size={32} />
            <div>
              <h2 className="text-xl font-bold">Contas em Atraso</h2>
              <p className="text-sm text-red-400">Atenção: Estas contas venceram e ainda não foram marcadas como pagas.</p>
            </div>
          </div>
          
          {overdueTransactions.length === 0 ? (
            <div className="text-center py-10 bg-emerald-50 rounded-xl">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="text-emerald-700 font-bold">Tudo em dia!</h3>
              <p className="text-emerald-600 text-sm">Você não tem contas pendentes de meses anteriores.</p>
            </div>
          ) : (
            overdueTransactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} onToggleStatus={toggleStatus} />)
          )}
        </div>
      )}

      {/* FAB Mobile */}
      <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
        <Plus size={24} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addTransaction} />
    </div>
  );
}

export default App;
