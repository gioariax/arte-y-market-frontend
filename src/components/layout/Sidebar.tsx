import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Package, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon">AM</div>
        <h2>Arte y Market</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={20} />
          <span>Gastos</span>
        </NavLink>

        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Inventario</span>
        </NavLink>

        <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={20} />
          <span>Ventas</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={20} />
          <span>Configuración</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
