class AnalyzePlaybacks {
description = {
displayName: 'Analyze Playbacks',
name: 'AnalyzePlaybacks',
group: 'transform',
version: 1,
description: 'Analiza playbacks',
defaults: { name: 'Analyze Playbacks' },
inputs: ['main'],
outputs: ['main'],
properties: []
};

async execute() {
try {
const trades = this.getInputData()[0].json.trades || [];
let totalProfit = 0, wins = 0, totalTrades = trades.length;
const strategies = {};
const returns = [];
for (const trade of trades) {
const profit = trade.profit || 0;
totalProfit += profit;
if (profit > 0) wins++;
returns.push(profit);
const strategy = trade.strategy || 'Sin estrategia';
strategies[strategy] = strategies[strategy] || { profit: 0, trades: 0, wins: 0 };
strategies[strategy].profit += profit;
strategies[strategy].trades++;
if (profit > 0) strategies[strategy].wins++;
}
const meanReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
const stdDev = returns.length > 1 ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)) : 0;
const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;
const effectiveness = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
const metrics = {
totalProfit,
effectiveness,
sharpeRatio,
strategies: Object.keys(strategies).map(s => ({
strategy: s,
profit: strategies[s].profit,
effectiveness: strategies[s].trades > 0 ? (strategies[s].wins / strategies[s].trades) * 100 : 0
}))
};
return this.prepareOutputData([{ json: metrics }]);
} catch (error) {
throw new Error(`Error analizando playbacks: ${error.message}`);
}
}
}

module.exports = { AnalyzePlaybacks };