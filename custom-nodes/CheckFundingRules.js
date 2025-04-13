class CheckFundingRules {
description = {
displayName: 'Check Funding Rules',
name: 'CheckFundingRules',
group: 'transform',
version: 1,
description: 'Verifica reglas de fondeo',
defaults: { name: 'Check Funding Rules' },
inputs: ['main'],
outputs: ['main'],
properties: []
};

async execute() {
try {
const input = this.getInputData()[0].json;
const capital = input.capital || 100000;
const maxDrawdown = input.maxDrawdown || 0.10;
const dailyDrawdown = input.dailyDrawdown || 0.05;
const trades = input.trades || [];
if (capital <= 0) throw new Error('Capital inválido');
let equity = capital, peak = capital, drawdown = 0;
const dailyProfits = {};
for (const trade of trades) {
const profit = trade.profit || 0;
equity += profit;
peak = Math.max(peak, equity);
drawdown = (peak - equity) / peak;
const date = trade.date.split('T')[0];
dailyProfits[date] = (dailyProfits[date] || 0) + profit;
const dailyLoss = -Math.min(0, dailyProfits[date]) / capital;
if (dailyLoss > dailyDrawdown) {
return this.prepareOutputData([{ json: { alert: `Drawdown diario excede ${dailyDrawdown * 100}%`, drawdown } }]);
}
if (drawdown > maxDrawdown) {
return this.prepareOutputData([{ json: { alert: `Drawdown total excede ${maxDrawdown * 100}%`, drawdown } }]);
}
}
return this.prepareOutputData([{ json: { drawdown, status: 'Reglas cumplidas' } }]);
} catch (error) {
throw new Error(`Error verificando reglas: ${error.message}`);
}
}
}

module.exports = { CheckFundingRules };

