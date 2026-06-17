import type { AppState } from '../App';
import { compareData } from '../utils/dataProcessing';
import { Settings2, ArrowRight } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
}

function TabSettings({ state, setState, onNext }: Props) {
  const { planHeaders, factHeaders, mapping } = state;

  const updateMapping = (field: keyof typeof mapping, value: string) => {
    setState((prev) => ({
      ...prev,
      mapping: { ...prev.mapping, [field]: value },
      result: null,
    }));
  };

  const handleCompare = () => {
    const result = compareData(state.planData, state.factData, state.mapping);
    setState((prev) => ({ ...prev, result }));
    onNext();
  };

  const allSelected =
    mapping.planPlateCol &&
    mapping.planAddressCol &&
    mapping.factPlateCol &&
    mapping.factAddressCol;

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Settings2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Настройка маппинга колонок</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Mapping */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Колонки Плана</h3>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Госномер машины</label>
              <select
                value={mapping.planPlateCol}
                onChange={(e) => updateMapping('planPlateCol', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">-- Выберите колонку --</option>
                {planHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Адрес площадки</label>
              <select
                value={mapping.planAddressCol}
                onChange={(e) => updateMapping('planAddressCol', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">-- Выберите колонку --</option>
                {planHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Fact Mapping */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-6">Колонки Факта (API)</h3>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Госномер машины</label>
              <select
                value={mapping.factPlateCol}
                onChange={(e) => updateMapping('factPlateCol', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">-- Выберите колонку --</option>
                {factHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Адрес площадки</label>
              <select
                value={mapping.factAddressCol}
                onChange={(e) => updateMapping('factAddressCol', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">-- Выберите колонку --</option>
                {factHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-4 mt-6">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
          <Settings2 className="w-5 h-5" />
        </div>
        <p className="text-sm text-amber-800 font-medium">
          Система автоматически очистит госномера от пробелов и приведет к верхнему регистру перед началом сверки. 
          Данные будут сопоставляться по уникальной связке [Машина + Адрес].
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleCompare}
          disabled={!allSelected}
          className={`px-10 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            allSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Начать анализ данных
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default TabSettings;
