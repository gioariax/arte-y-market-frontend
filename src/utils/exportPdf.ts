import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppData, Category, Expense, Income, Sale, Product } from '../types';

export const exportDashboardToPDF = (data: AppData) => {
    const doc = new jsPDF();
    const title = 'Reporte Financiero - Arte y Market';
    const subtitle = `Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`;

    // --- Header ---
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 30);

    // --- 1. Resumen por Categorías ---
    const categoryMap = new Map<string, { name: string, type: 'income' | 'expense', total: number }>();

    // Registrar Ventas (Ingreso especial)
    categoryMap.set('sales', { name: 'Ventas de Productos', type: 'income', total: 0 });

    // Inicializar categorías de contexto
    data.categories.forEach((c: Category) => {
        categoryMap.set(c.id, { name: c.name, type: c.type, total: 0 });
    });

    // Sumar valores
    data.sales.forEach((s: Sale) => categoryMap.get('sales')!.total += s.total);
    data.incomes.forEach((i: Income) => categoryMap.get(i.categoryId)!.total += i.amount);
    data.expenses.forEach((e: Expense) => categoryMap.get(e.categoryId)!.total += e.amount);

    const summaryRows = Array.from(categoryMap.values())
        .filter(cat => cat.total > 0)
        .sort((a, b) => b.type.localeCompare(a.type)) // Incomes first
        .map(cat => [
            cat.type === 'income' ? 'Ingreso' : 'Egreso',
            cat.name,
            `$${cat.total.toFixed(2)}`
        ]);

    autoTable(doc, {
        startY: 40,
        head: [['Tipo', 'Categoría', 'Total ($)']],
        body: summaryRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }, // --primary
        styles: { fontSize: 10 },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
        margin: { bottom: 20 },
        didDrawPage: (dataArg) => {
            doc.setFontSize(14);
            doc.setTextColor(33, 33, 33);
            doc.text('Resumen Financiero por Categorías', 14, dataArg.settings.startY! - 5);
        }
    });

    // Calculate overall totals
    const totalIncomes = Array.from(categoryMap.values()).filter(c => c.type === 'income').reduce((sum, c) => sum + c.total, 0);
    const totalExpenses = Array.from(categoryMap.values()).filter(c => c.type === 'expense').reduce((sum, c) => sum + c.total, 0);
    const balance = totalIncomes - totalExpenses;

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(`Ingresos Totales: $${totalIncomes.toFixed(2)}`, 14, finalY);
    doc.text(`Egresos Totales: $${totalExpenses.toFixed(2)}`, 14, finalY + 7);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(balance >= 0 ? 16 : 220, balance >= 0 ? 185 : 38, balance >= 0 ? 129 : 38);
    doc.text(`Balance Neto: $${balance.toFixed(2)}`, 14, finalY + 17);

    // --- 2. Historial de Movimientos Detallado ---

    // Recolectar e unificar todos los movimientos
    const allMovements: any[] = [];

    data.sales.forEach((s: Sale) => {
        const pName = data.products.find((p: Product) => p.id === s.productId)?.name || 'Producto';
        allMovements.push({ date: new Date(s.date), type: 'Ingreso', category: 'Venta', desc: pName, amount: s.total });
    });
    data.incomes.forEach((i: Income) => {
        const cName = data.categories.find((c: Category) => c.id === i.categoryId)?.name || 'Ingreso';
        allMovements.push({ date: new Date(i.date), type: 'Ingreso', category: cName, desc: i.description, amount: i.amount });
    });
    data.expenses.forEach((e: Expense) => {
        const cName = data.categories.find((c: Category) => c.id === e.categoryId)?.name || 'Egreso';
        allMovements.push({ date: new Date(e.date), type: 'Egreso', category: cName, desc: e.description, amount: e.amount });
    });

    // Ordenar cronológicamente ascendente
    allMovements.sort((a, b) => a.date.getTime() - b.date.getTime());

    const detailRows = allMovements.map(m => [
        m.date.toLocaleDateString(),
        m.type,
        m.category,
        m.desc,
        `${m.type === 'Egreso' ? '-' : '+'}$${m.amount.toFixed(2)}`
    ]);

    const detailStartY = finalY + 35;

    // Agregar nueva página si no hay espacio
    if (detailStartY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
    }

    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
        startY: detailStartY > doc.internal.pageSize.getHeight() - 40 ? 20 : detailStartY,
        head: [['Fecha', 'Tipo', 'Categoría', 'Detalle', 'Monto']],
        body: detailRows,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50] },
        styles: { fontSize: 9 },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
        didDrawPage: (dataArg) => {
            // Dibujar título en cada página de detalles
            if (dataArg.pageNumber !== 1 || (detailStartY <= doc.internal.pageSize.getHeight() - 40)) {
                doc.setFontSize(14);
                doc.setTextColor(33, 33, 33);
                doc.text('Historial Detallado de Movimientos', 14, dataArg.settings.startY! - 5);
            }
        }
    });

    doc.save(`Reporte_Financiero_${new Date().toISOString().split('T')[0]}.pdf`);
};
