import { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Inventory = () => {
    const { data, addProduct, updateProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: ''
    });

    const openModal = (product?: any) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString()
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', price: '', stock: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock) return;

        if (editingId) {
            updateProduct(editingId, {
                name: formData.name,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            });
        } else {
            addProduct({
                name: formData.name,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            });
        }

        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1>Inventario</h1>
                    <p>Gestiona los productos y sus existencias (stock).</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={18} /> Nuevo Producto
                </button>
            </div>

            <div className="glass-panel p-4">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre del Producto</th>
                                <th>Precio de Venta ($)</th>
                                <th>En Stock</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay productos en inventario</td></tr>
                            ) : data.products.map(product => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-outline" style={{padding: '0.4rem', marginRight: '0.5rem'}} onClick={() => openModal(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{padding: '0.4rem', color: 'var(--danger)'}} onClick={() => deleteProduct(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
                    </tbody>
                </table>
            </div>
        </div>

      {
        isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{editingId ? 'Editar Producto' : 'Crear Producto'}</h2>
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input type="text" className="input" placeholder="Ej. Camiseta Algodón" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Precio de Venta ($)</label>
                                    <input type="number" step="0.01" className="input" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Cantidad en Stock</label>
                                    <input type="number" className="input" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Guardar Producto'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
    </div >
  );
};

export default Inventory;
