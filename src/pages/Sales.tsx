import { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, X } from 'lucide-react';

const Sales = () => {
    const { data, addSale } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0]
    });

    const selectedProduct = data.products.find(p => p.id === formData.productId);
    const totalPreview = selectedProduct ? (selectedProduct.price * parseInt(formData.quantity || '0')) : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.productId || !formData.quantity) return;

        try {
            addSale({
                productId: formData.productId,
                quantity: parseInt(formData.quantity),
                date: formData.date
            });
            setIsModalOpen(false);
            setFormData({ ...formData, productId: '', quantity: '1' });
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const getProductName = (id: string) => {
        return data.products.find(p => p.id === id)?.name || 'Producto Eliminado';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1>Registro de Ventas</h1>
                    <p>Mira el historial de ventas y registra nuevas salidas.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Nueva Venta
                </button>
            </div>

            <div className="glass-panel p-4">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto Vendido</th>
                                <th>Cantidad</th>
                                <th className="text-right">Total Generado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sales.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Aún no hay ventas registradas</td></tr>
                            ) : data.sales.map(sale => (
                                <tr key={sale.id}>
                                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                                    <td className="font-medium">{getProductName(sale.productId)}</td>
                                    <td>{sale.quantity} und.</td>
                                    <td className="text-right font-bold text-success">+${sale.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Registrar Nueva Venta</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {errorMsg && (
                                    <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Seleccionar Producto</label>
                                    <select className="select" required value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                        <option value="" disabled>Selecciona un producto disponible...</option>
                                        {data.products.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                                {p.name} - ${p.price} ({p.stock} disponibles)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label>Cantidad (Unidades)</label>
                                        <input type="number" min="1" className="input" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha de Venta</label>
                                        <input type="date" className="input" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                </div>

                                {selectedProduct && (
                                    <div className="mt-4 p-4 glass-panel" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted">Total Calculado:</span>
                                            <span className="text-success" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                                ${totalPreview.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={!formData.productId || parseInt(formData.quantity) <= 0}>
                                    Confirmar Venta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
