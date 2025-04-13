class NewsAnalysis {
description = {
displayName: 'News Analysis',
name: 'NewsAnalysis',
group: 'transform',
version: 1,
description: 'Analiza noticias de Nasdaq',
defaults: { name: 'News Analysis' },
inputs: ['main'],
outputs: ['main'],
properties: []
};

async execute() {
try {
const news = this.getInputData()[0].json.articles || [];
let analysis = { positive: 0, negative: 0, neutral: 0, summary: '' };
news.forEach(item => {
if (!item.title || !item.description) return;
const text = (item.title + ' ' + item.description).toLowerCase();
let sentiment = 'neutral';
if (text.includes('sube') || text.includes('alza') || text.includes('ganancia')) {
sentiment = 'positive';
analysis.positive++;
} else if (text.includes('baja') || text.includes('pérdida') || text.includes('cae')) {
sentiment = 'negative';
analysis.negative++;
} else {
analysis.neutral++;
}
analysis.summary += `\n${item.title}\n${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}\n`;
});
return this.prepareOutputData([{ json: analysis }]);
} catch (error) {
throw new Error(`Error analizando noticias: ${error.message}`);
}
}
}

module.exports = { NewsAnalysis };