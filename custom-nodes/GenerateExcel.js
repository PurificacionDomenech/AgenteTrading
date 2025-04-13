const ExcelJS = require('exceljs');

class GenerateExcel {
    description = {
        displayName: 'Generate Excel',
        name: 'GenerateExcel',
        group: 'output',
        version: 1,
        description: 'Crea bitácora Excel',
        defaults: { name: 'Generate Excel' },
        inputs: ['main'],
        outputs: ['main'],
        properties: []
    };

    async execute() {
        try {
            const trades = this.getInputData().map(item => item.json);
            const workbook = new ExcelJS.Workbook();
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            months.forEach(month => {
                const monthTrades = trades.filter(t => new Date(t.date).getMonth() === months.indexOf(month));
                if (monthTrades.length === 0) return; // Evita crear hojas vacías

                // Hoja de datos diarios
                const sheet = workbook.addWorksheet(month);
                sheet.columns = [
                    { header: 'Fecha', key: 'Fecha', width: 12 },
                    { header: 'Hora Inic', key: 'Hora Inic', width: 10 },
                    { header: 'Hora Final', key: 'Hora Final', width: 10 },
                    { header: 'Tiempo', key: 'Tiempo', width: 10 },
                    { header: 'Trade', key: 'Trade', width: 10 },
                    { header: 'Beneficios', key: 'Beneficios', width: 12 },
                    { header: 'Estrategia', key: 'Estrategia', width: 15 },
                    { header: 'Observaciones', key: 'Observaciones', width: 20 }
                ];

                monthTrades.forEach(trade => {
                    sheet.addRow({
                        Fecha: trade.date || new Date().toISOString().split('T')[0],
                        'Hora Inic': trade.startTime || '09:00:00',
                        'Hora Final': trade.endTime || '09:30:00',
                        Tiempo: trade.time || '00:30:00',
                        Trade: trade.trade || 'N/A',
                        Beneficios: trade.profit || 0,
                        Estrategia: trade.strategy || 'N/A',
                        Observaciones: trade.notes || ''
                    });
                });

                // Hoja de resumen semanal
                const weeklySheet = workbook.addWorksheet(`${month}_Resumen`);
                weeklySheet.columns = [
                    { header: 'Semana', key: 'Semana', width: 12 },
                    { header: 'Resultado', key: 'Resultado', width: 12 },
                    { header: 'Largos', key: 'Largos', width: 10 },
                    { header: 'Cortos', key: 'Cortos', width: 10 },
                    { header: 'Efectividad', key: 'Efectividad', width: 12 }
                ];

                for (let week = 1; week <= 5; week++) {
                    const weekTrades = monthTrades.filter(t => {
                        const date = new Date(t.date);
                        return Math.ceil(date.getDate() / 7) === week;
                    });
                    weeklySheet.addRow({
                        Semana: `Semana ${week}`,
                        Resultado: weekTrades.reduce((sum, t) => sum + (t.profit || 0), 0),
                        Largos: weekTrades.filter(t => t.trade === 'Compra').length,
                        Cortos: weekTrades.filter(t => t.trade === 'Venta').length,
                        Efectividad: weekTrades.length > 0 ? (weekTrades.filter(t => t.profit > 0).length / weekTrades.length) * 100 : 0
                    });
                }
            });

            await workbook.xlsx.writeFile('bitacora.xlsx');
            return this.prepareOutputData([{ json: { status: 'Excel generado' } }]);
        } catch (error) {
            throw new Error(`Error generando Excel: ${error.message}`);
        }
    }
}

module.exports = { GenerateExcel };