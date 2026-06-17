import { useState, useMemo } from 'react';
import type { AppState } from '../App';
import { Download, FileText, Printer, Mail, Car } from 'lucide-react';

interface Props {
  state: AppState;
}

function TabReport({ state }: Props) {
  const { result } = state;
  const [selectedPlate, setSelectedPlate] = useState<string>('all');

  const plates = useMemo(() => {
    if (!result) return [];
    const p = new Set<string>();
    result.planWithStatus.forEach(r => p.add(r._plate));
    return Array.from(p).sort();
  }, [result]);

  const reportData = useMemo(() => {
    if (!result) return null;
    const plan = selectedPlate === 'all' 
      ? result.planWithStatus 
      : result.planWithStatus.filter(r => r._plate === selectedPlate);
    
    const fact = selectedPlate === 'all'
      ? result.factOutOfPlan
      : result.factOutOfPlan.filter(r => r._plate === selectedPlate);

    const total = plan.length;
    const visited = plan.filter(r => r._status === 'Посещен').length;
    const notVisited = total - visited;
    const outOfPlan = fact.length;
    const percent = total > 0 ? Math.round((visited / total) * 100) : 0;

    return { total, visited, notVisited, outOfPlan, percent };
  }, [result, selectedPlate]);

  const generateReportText = () => {
    if (!reportData) return 'Нет данных для генерации справки';
    
    const vehicleText = selectedPlate === 'all' ? 'всему автопарку' : `ТС ${selectedPlate}`;
    const date = state.selectedDate;

    return `
АНАЛИТИЧЕСКАЯ СПРАВКА ПО КОНТРОЛЮ ВЫВОЗА ТКО
Дата отчета: ${date}
Объект контроля: ${vehicleText}

1. ОБЩИЕ ПОКАЗАТЕЛИ
Всего площадок по плану: ${reportData.total}
Фактически посещено: ${reportData.visited}
Процент выполнения: ${reportData.percent}%

2. ВЫЯВЛЕННЫЕ НАРУШЕНИЯ
Количество пропущенных адресов: ${reportData.notVisited}
Количество внеплановых выгрузок: ${reportData.outOfPlan}

3. ЗАКЛЮЧЕНИЕ
По результатам автоматической сверки плановых и фактических данных за ${date}, эффективность работы по объекту "${vehicleText}" составила ${reportData.percent}%. 
${reportData.notVisited > 0 ? `Требуется провести проверку причин отклонения по ${reportData.notVisited} пропущенным адресам.` : 'Нарушений планового графика не выявлено.'}
${reportData.outOfPlan > 0 ? `Зафиксировано ${reportData.outOfPlan} фактов выгрузки вне утвержденного реестра.` : ''}

Отчет сформирован автоматически системой "ТКО Контроль" v1.0.
    `;
  };

  const downloadDoc = () => {
    const text = generateReportText();
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Report</title></head>
      <body>
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</pre>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Справка_${selectedPlate}_${state.selectedDate}.doc`;
    link.click();
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">Для генерации справки необходимы данные анализа.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Аналитическая справка</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Printer className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Mail className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Выберите объект</label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <button
                onClick={() => setSelectedPlate('all')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                  selectedPlate === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
                }`}
              >
                Все машины
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedPlate === 'all' ? 'bg-blue-400' : 'bg-slate-100 text-slate-400'}`}>
                  {result.planWithStatus.length}
                </span>
              </button>
              {plates.map(plate => (
                <button
                  key={plate}
                  onClick={() => setSelectedPlate(plate)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    selectedPlate === plate ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Car className="w-3 h-3" />
                    {plate}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={downloadDoc}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
          >
            <Download className="w-4 h-4" />
            Скачать справку (Word .doc)
          </button>
        </div>

        {/* Report Preview */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-inner min-h-[500px] p-10 font-mono text-sm text-slate-700 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 text-slate-50 pointer-events-none select-none">
              <p className="text-9xl font-black">КОНФИДЕНЦИАЛЬНО</p>
            </div>
            
            <pre className="relative whitespace-pre-wrap leading-relaxed z-10">
              {generateReportText()}
            </pre>

            <div className="absolute bottom-10 right-10 z-10 text-right opacity-30">
              <div className="w-24 h-24 border-2 border-slate-400 rounded-full flex items-center justify-center rotate-[-15deg]">
                <p className="text-[8px] font-bold text-center uppercase">Утверждено<br/>Системой<br/>Контроля</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabReport;
