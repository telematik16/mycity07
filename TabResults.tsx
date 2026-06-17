import type { AppState } from '../App';
import { compareData } from '../utils/dataProcessing';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
  onBack: () => void;
}

function Step2Mapping({ state, setState, onNext, onBack }: Props) {
  const { planHeaders, factHeaders, mapping } = state;

  const updateMapping = (field: keyof typeof mapping, value: string) => {
    setState((prev) => ({
      ...prev,
      mapping: { ...prev.mapping, [field]: value },
      result: null,
    }));
  };

  const allSelected =
    mapping.planPlateCol &&
    mapping.planAddressCol &&
    mapping.factPlateCol &&
    mapping.factAddressCol;

  const handleCompare = () => {
    const result = compareData(state.planData, state.factData, state.mapping);
    setState((prev) => ({ ...prev, result }));
    onNext();
  };

  // Smart default: try to auto-select columns by matching common names
  const getAutoSelect = (headers: string[], keywords: string[]): string => {
    for (const kw of keywords) {
      const found = headers.find((h) =>
        h.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) return found;
    }
    return '';
  };

  // Auto-detect on mount if not set
  const autoDetect = (type: 'plan' | 'fact') => {
    const headers = type === 'plan' ? planHeaders : factHeaders;
    const plateKeywords = ['гос', 'номер', 'госномер', 'регистрацион', 'авто', 'транспорт', 'plate', 'vehicle'];
    const addressKeywords = ['адрес', 'место', 'площадк', 'контейнер', 'address', 'location', 'объект', 'точк'];

    const plateCol = getAutoSelect(headers, plateKeywords);
    const addressCol = getAutoSelect(headers, addressKeywords);

    if (type === 'plan') {
      setState((prev) => ({
        ...prev,
        mapping: {
          ...prev.mapping,
          planPlateCol: plateCol || prev.mapping.planPlateCol,
          planAddressCol: addressCol || prev.mapping.planAddressCol,
        },
      }));
    } else {
      setState((prev) => ({
        ...prev,
        mapping: {
          ...prev.mapping,
          factPlateCol: plateCol || prev.mapping.factPlateCol,
          factAddressCol: addressCol || prev.mapping.factAddressCol,
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Настройка колонок</h2>
        <p className="text-slate-500 mt-1">Укажите, в каких колонках находятся госномера и адреса</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Mapping */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">П</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">План</h3>
            </div>
            <button
              onClick={() => autoDetect('plan')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
            >
              ✨ Автоопределение
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Колонка «Гос. номер»
              </label>
              <select
                value={mapping.planPlateCol}
                onChange={(e) => updateMapping('planPlateCol', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">— Выберите колонку —</option>
                {planHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Колонка «Адрес»
              </label>
              <select
                value={mapping.planAddressCol}
                onChange={(e) => updateMapping('planAddressCol', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">— Выберите колонку —</option>
                {planHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {mapping.planPlateCol && mapping.planAddressCol && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2 font-medium">Предпросмотр (первые 3 строки):</p>
              {state.planData.slice(0, 3).map((row, i) => (
                <div key={i} className="text-xs text-slate-600 flex gap-2 py-0.5">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {row[mapping.planPlateCol]}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="truncate max-w-[200px]">{row[mapping.planAddressCol]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fact Mapping */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">Ф</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Факт</h3>
            </div>
            <button
              onClick={() => autoDetect('fact')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              ✨ Автоопределение
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Колонка «Гос. номер»
              </label>
              <select
                value={mapping.factPlateCol}
                onChange={(e) => updateMapping('factPlateCol', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">— Выберите колонку —</option>
                {factHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Колонка «Адрес»
              </label>
              <select
                value={mapping.factAddressCol}
                onChange={(e) => updateMapping('factAddressCol', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">— Выберите колонку —</option>
                {factHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {mapping.factPlateCol && mapping.factAddressCol && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2 font-medium">Предпросмотр (первые 3 строки):</p>
              {state.factData.slice(0, 3).map((row, i) => (
                <div key={i} className="text-xs text-slate-600 flex gap-2 py-0.5">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {row[mapping.factPlateCol]}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="truncate max-w-[200px]">{row[mapping.factAddressCol]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm text-amber-800 font-medium">Предобработка данных</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Перед сравнением все госномера будут приведены к верхнему регистру, а лишние пробелы в начале и конце строк — удалены автоматически.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Назад
        </button>
        <button
          onClick={handleCompare}
          disabled={!allSelected}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
            allSelected
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Сравнить данные
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Step2Mapping;
