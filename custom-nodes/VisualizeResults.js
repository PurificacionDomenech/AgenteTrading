const fs = require('fs');

class VisualizeResults {
description = {
displayName: 'Visualize Results',
name: 'VisualizeResults',
group: 'output',
version: 1,
description: 'Crea gráficos de equidad y drawdown',
defaults: { name: 'Visualize Results' },
inputs: ['main'],
outputs: ['main'],
properties: []
};

async execute() {
try {
const trades = this.getInputData()[0].json.trades || [];
let equity = 100000, peak = equity;
const equityCurve = [], drawdowns = [], dates = [];
trades.forEach(trade => {
equity += trade.profit || 0;
peak = Math.max(peak, equity);
const drawdown = (peak - equity) / peak;
equityCurve.push(equity);
drawdowns.push(drawdown * 100);
dates.push(trade.date || new Date().toISOString().split('T')[0]);
});
const html = `
<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
<div id="chart"></div>
<script>
Plotly.newPlot('chart', [
{ x: ${JSON.stringify(dates)}, y: ${JSON.stringify(equityCurve)}, type: 'scatter', name: 'Equidad' },
{ x: ${JSON.stringify(dates)}, y: ${JSON.stringify(drawdowns)}, type: 'scatter', name: 'Drawdown (%)', yaxis: 'y2' }
], {
title: 'Resultados de Trading',
yaxis: { title: 'Equidad ($)' },
yaxis2: { title: 'Drawdown (%)', overlaying: 'y', side: 'right' }
});
</script>
</body>
</html>
`;
fs.writeFileSync('results.html', html);
return this.prepareOutputData([{ json: { chartFile: 'results.html' } }]);
} catch (error) {
throw new Error(`Error generando gráficos: ${error.message}`);
}
}
}

module.exports = { VisualizeResults };