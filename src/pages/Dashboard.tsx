import { useData } from '../store/DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingDown, Package, Activity, FileDown } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/exportPdf';
import './Dashboard.css';

const Dashboard = () => {
  const { data } = useData();

  // Calculate metrics
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSales = data.sales.reduce((sum, item) => sum + item.total, 0);
  const totalOtherIncomes = data.incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = totalSales + totalOtherIncomes;
  const balance = totalIncome - totalExpenses;

  const lowStockCount = data.products.filter(p => p.stock < 5).length;

  // Prepare chart data (Income vs Expenses by Date)
  const recentActivityMap = new Map<string, { name: string, ingresos: number, gastos: number }>();

  data.sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString();
    if (!recentActivityMap.has(date)) recentActivityMap.set(date, { name: date, ingresos: 0, gastos: 0 });
    recentActivityMap.get(date)!.ingresos += sale.total;
  });

  data.incomes.forEach(income => {
    const date = new Date(income.date).toLocaleDateString();
    if (!recentActivityMap.has(date)) recentActivityMap.set(date, { name: date, ingresos: 0, gastos: 0 });
    recentActivityMap.get(date)!.ingresos += income.amount;
  });

  data.expenses.forEach(expense => {
    const date = new Date(expense.date).toLocaleDateString();
    if (!recentActivityMap.has(date)) recentActivityMap.set(date, { name: date, ingresos: 0, gastos: 0 });
    recentActivityMap.get(date)!.gastos += expense.amount;
  });

  const chartData = Array.from(recentActivityMap.values()).slice(-7);

  // Prepare expense category bar chart data dynamically
  const expenseCategoriesData = data.categories
    .filter(c => c.type === 'expense')
    .map(category => {
      const valor = data.expenses
        .filter(e => e.categoryId === category.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: category.name, valor };
    })
    .filter(item => item.valor > 0); // Only show categories with actual expenses

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Resumen General</h1>
          <p>Bienvenido. Aquí tienes el balance actual de tu negocio.</p>
        </div>
        <button className="btn btn-outline" onClick={() => exportDashboardToPDF(data)} style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)', color: 'var(--text-main)' }}>
          <FileDown size={18} /> Exportar Historial (PDF)
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="metric-card glass-panel">
          <div className="metric-icon success-icon"><DollarSign size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Ingresos Totales</span>
            <span className="metric-value text-success">${totalIncome.toFixed(2)}</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon danger-icon"><TrendingDown size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Gastos Totales</span>
            <span className="metric-value text-danger">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon primary-icon"><Activity size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Balance Neto</span>
            <span className={`metric-value ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon warning-icon"><Package size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Productos en Alerta</span>
            <span className="metric-value">{lowStockCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="chart-card glass-panel">
          <h3>Flujo de Caja (Últimos movimientos)</h3>
          {chartData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="ingresos" stroke="var(--success)" fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="gastos" stroke="var(--danger)" fillOpacity={1} fill="url(#colorGastos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart">No hay datos suficientes para mostrar gráficas.</div>
          )}
        </div>

        <div className="chart-card glass-panel">
          <h3>Gastos por Categoría</h3>
          {expenseCategoriesData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategoriesData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart">No hay gastos categorizados aún.</div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
