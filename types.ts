import { useCallback, useState } from 'react';
import type { AppState } from '../App';
import { parseFile, parseFileData } from '../utils/dataProcessing';
import { Upload, Calendar, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
}

function TabSync({ state, setState, onNext }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    try {
      const headers = await parseFile(file);
      const data = await parseFileData(file);
      setState(prev => ({
        ...prev,
        planFile: file,
        planHeaders: headers,
        planData: data
      }));
    } catch (err) {
      console.error(err);
    }
  }, [setState]);

  const handleSyncFact = async () => {
    setState(prev => ({ ...prev, isSyncing: true }));
    // Simulate API call to GLONASSSoft
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data based on some geozones
    const mockFact = [
      { 'Госномер': 'А123БВ07', 'Адрес': 'НАЛЬЧИК УЛ.ТАРЧОКОВА 139 АФИНА 1К', 'Дата/Время': state.selectedDate + ' 09:12' },
      { 'Госномер': 'В777ХК07', 'Адрес': 'НАЛЬЧИК УЛ.КУЛИЕВА 5', 'Дата/Время': state.selectedDate + ' 10:45' },
    ];

    setState(prev => ({
      ...prev,
      isSyncing: false,
      factData: mockFact,
      factHeaders: ['Госномер', 'Адрес', 'Дата/Время'],
      factFile: new File([], 'api_sync_data.csv')
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Block */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-slate-800">Блок 1: План</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Excel/CSV</span>
          </div>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {state.planFile ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700">{state.planFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{state.planData.length} позиций загружено</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-600">Перетащите файл или кликните</p>
                <p className="text-xs text-slate-400 mt-2">Загрузите маршрутный план контрагента</p>
              </>
            )}
          </div>
        </div>

        {/* Fact Block */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-slate-800">Блок 2: Факт (API)</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ГЛОНАССSoft</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-full flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Выберите дату</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={state.selectedDate}
                    onChange={(e) => setState(prev => ({ ...prev, selectedDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </label>
            </div>

            <button
              onClick={handleSyncFact}
              disabled={state.isSyncing}
              className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                state.isSyncing
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              {state.isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Синхронизировать факт по API
                </>
              )}
            </button>

            {state.factData.length > 0 && !state.isSyncing && (
              <p className="text-center text-[10px] text-green-600 font-bold mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Данные за {state.selectedDate} получены успешно
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Geozone Status */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Блок 3: Внутренняя база геозон</p>
            <p className="text-xs text-blue-600 font-medium">В базе {state.geozonesCount} геозон. Обновлено: {state.lastUpdated}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          Локальный кэш активен
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!state.planFile || state.factData.length === 0}
          className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
            state.planFile && state.factData.length > 0
              ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-xl'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Перейти к настройке
        </button>
      </div>
    </div>
  );
}

export default TabSync;
