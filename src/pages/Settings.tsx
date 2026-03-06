import { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Trash2, X } from 'lucide-react';

const Settings = () => {
    const { data, addCategory, deleteCategory } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        addCategory({
            name: formData.name,
            type: formData.type as 'expense' | 'income'
        });

        setIsModalOpen(false);
        setFormData({ name: '', type: 'expense' });
    };

    const getUsageCount = (categoryId: string) => {
        const expenses = data.expenses.filter(e => e.categoryId === categoryId).length;
        const incomes = data.incomes.filter(i => i.categoryId === categoryId).length;
        return expenses + incomes;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1>Configuration</h1>
                    <p>Parametriza las categorías para tus ingresos y egresos.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Nueva Categoría
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Ingresos Column */}
                <div className="glass-panel p-4">
                    <h2 className="mb-4 flex items-center gap-2">
                        <span style={{ color: 'var(--success)' }}>●</span> Categorías de Ingresos
                    </h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th className="text-right">Usos</th>
                                    <th className="text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.categories.filter(c => c.type === 'income').map(cat => {
                                    const usage = getUsageCount(cat.id);
                                    return (
                                        <tr key={cat.id}>
                                            <td className="font-medium">{cat.name}</td>
                                            <td className="text-right text-muted">{usage}</td>
                                            <td className="text-right">
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.4rem', color: 'var(--danger)' }}
                                                    onClick={() => deleteCategory(cat.id)}
                                                    disabled={usage > 0}
                                                    title={usage > 0 ? "No puedes eliminar una categoría en uso" : "Eliminar"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Egresos Column */}
                <div className="glass-panel p-4">
                    <h2 className="mb-4 flex items-center gap-2">
                        <span style={{ color: 'var(--danger)' }}>●</span> Categorías de Egresos
                    </h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th className="text-right">Usos</th>
                                    <th className="text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.categories.filter(c => c.type === 'expense').map(cat => {
                                    const usage = getUsageCount(cat.id);
                                    return (
                                        <tr key={cat.id}>
                                            <td className="font-medium">{cat.name}</td>
                                            <td className="text-right text-muted">{usage}</td>
                                            <td className="text-right">
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.4rem', color: 'var(--danger)' }}
                                                    onClick={() => deleteCategory(cat.id)}
                                                    disabled={usage > 0}
                                                    title={usage > 0 ? "No puedes eliminar una categoría en uso" : "Eliminar"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Crear Categoría</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tipo de Flujo</label>
                                    <select className="select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="expense">Egreso (Gastos M.P., Generales, etc)</option>
                                        <option value="income">Ingreso (Ventas, Aportes, etc)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nombre de la Categoría</label>
                                    <input type="text" className="input" placeholder="Ej. Pago de Servicios" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Categoría</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
