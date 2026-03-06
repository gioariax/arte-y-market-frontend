import { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Edit2, Trash2, X, Receipt, Tag } from 'lucide-react';

const Expenses = () => {
    const { data, addExpense, updateExpense, deleteExpense, addIncome, updateIncome, deleteIncome } = useData();

    const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const expenseCategories = data.categories.filter(c => c.type === 'expense');
    const incomeCategories = data.categories.filter(c => c.type === 'income');

    const openModal = (item?: any, type: 'expenses' | 'incomes' = activeTab) => {
        setActiveTab(type);
        const defaultCategoryId = type === 'expenses'
            ? (expenseCategories.length > 0 ? expenseCategories[0].id : '')
            : (incomeCategories.length > 0 ? incomeCategories[0].id : '');

        if (item) {
            setEditingId(item.id);
            setFormData({
                categoryId: item.categoryId,
                amount: item.amount.toString(),
                description: item.description,
                date: item.date
            });
        } else {
            setEditingId(null);
            setFormData({
                categoryId: defaultCategoryId,
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.description || !formData.categoryId) return;

        const payload = {
            categoryId: formData.categoryId,
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date
        };

        if (activeTab === 'expenses') {
            if (editingId) updateExpense(editingId, payload);
            else addExpense(payload);
        } else {
            if (editingId) updateIncome(editingId, payload);
            else addIncome(payload);
        }

        setIsModalOpen(false);
    };

    const getCategoryName = (id: string, type: 'expense' | 'income') => {
        const cat = data.categories.find(c => c.id === id && c.type === type);
        return cat ? cat.name : 'Categoría Eliminada';
    };

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Movimientos Financieros</h1>
          <p>Registra tus gastos operativos y otros ingresos fuera de ventas.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button 
          className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={18} /> Ver Gastos / Egresos
        </button>
        <button 
          className={`btn ${activeTab === 'incomes' ? 'btn-primary' : 'btn-outline'}`}
          style={activeTab === 'incomes' ? {background: 'var(--success)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'} : {}}
          onClick={() => setActiveTab('incomes')}
        >
          <Tag size={18} /> Ver Otros Ingresos
        </button>
        
        <button 
          className="btn ml-auto" 
          style={{background: 'var(--text-main)', color: 'var(--bg-dark)'}}
          onClick={() => openModal()}
        >
          <Plus size={18} /> {activeTab === 'expenses' ? 'Nuevo Gasto' : 'Nuevo Ingreso'}
        </button>
      </div >

    <div className="glass-panel p-4">
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th className="text-right">Monto</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activeTab === 'expenses' && (
                        data.expenses.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay gastos registrados</td></tr>
                        ) : data.expenses.map(expense => (
                            <tr key={expense.id}>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="font-medium">{expense.description}</td>
                                <td><span className="badge badge-warning">{getCategoryName(expense.categoryId, 'expense')}</span></td>
                                <td className="text-right font-bold text-danger">-${expense.amount.toFixed(2)}</td>
                                <td className="text-right">
                                    <button className="btn btn-outline" style={{ padding: '0.4rem', marginRight: '0.5rem' }} onClick={() => openModal(expense, 'expenses')}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => deleteExpense(expense.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}

                    {activeTab === 'incomes' && (
                        data.incomes.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay otros ingresos registrados</td></tr>
                        ) : data.incomes.map(income => (
                            <tr key={income.id}>
                                <td>{new Date(income.date).toLocaleDateString()}</td>
                                <td className="font-medium">{income.description}</td>
                                <td><span className="badge badge-success">{getCategoryName(income.categoryId, 'income')}</span></td>
                                <td className="text-right font-bold text-success">+${income.amount.toFixed(2)}</td>
                                <td className="text-right">
                                    <button className="btn btn-outline" style={{ padding: '0.4rem', marginRight: '0.5rem' }} onClick={() => openModal(income, 'incomes')}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => deleteIncome(income.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>

{
    isModalOpen && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editingId ? 'Editar' : 'Registrar Nuevo'} {activeTab === 'expenses' ? 'Gasto' : 'Ingreso'}</h2>
                    <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Categoría de {activeTab === 'expenses' ? 'Egreso' : 'Ingreso'}</label>
                            <select className="select" required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                <option value="" disabled>Selecciona una categoría...</option>
                                {(activeTab === 'expenses' ? expenseCategories : incomeCategories).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Descripción / Detalle</label>
                            <input type="text" className="input" placeholder="Ej. Pago de Factura #123" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Monto ($)</label>
                                <input type="number" step="0.01" className="input" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input type="date" className="input" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">{editingId ? 'Guardar Cambios' : 'Confirmar Registro'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
    </div >
  );
};

export default Expenses;
