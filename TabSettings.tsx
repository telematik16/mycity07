import { useState, useMemo } from 'react';
import type { AppState } from '../App';
import { exportToExcel } from '../utils/dataProcessing';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onBack: () => void;
}

function Step3Results({ state, onBack }: Props) {
  const { result, mapping } = state;
  const [filterPlate, setFilterPlate] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'plan' | 'outOfPlan'>('plan');
  const [planPage, setPlanPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const pageSize = 20;

  if (!result) return null;

  const { planWithStatus, factOutOfPlan } = result;

  // Get unique plates for filter
  const allPlates = useMemo(() => {
    const plates = new Set<string>();
    planWithStatus.forEach((r) => plates.add(r._plate));
    factOutOfPlan.forEach((r) => plates.add(r._plate));
    return Array.from(plates).sort();
  }, [planWithStatus, factOutOfPlan]);

  // Filtered data
  const filteredPlan = useMemo(() => {
    if (filterPlate === 'all') return planWithStatus;
    return planWithStatus.filter((r) => r._plate === filterPlate);
  }, [planWithStatus, filterPlate]);

  const filteredOutOfPlan = useMemo(() => {
    if (filterPlate === 'all') return factOutOfPlan;
    return factOutOfPlan.filter((r) => r._plate === filterPlate);
  }, [factOutOfPlan, filterPlate]);

  // Filtered metrics
  const filteredMetrics = useMemo(() => {
    const totalPlan = filteredPlan.length;
    const visited = filteredPlan.filter((r) => r._status === 'Посещен').length;
    const notVisited = filteredPlan.filter((r) => r._status === 'Не посещен').length;
    const outOfPlan = filteredOutOfPlan.length;
    return { totalPlan, visited, notVisited, outOfPlan };
  }, [filteredPlan, filteredOutOfPlan]);

  // Pagination
  const planTotalPages = Math.ceil(filteredPlan.length / pageSize);
  const planPaginated = filteredPlan.slice((planPage - 1) * pageSize, planPage * pageSize);

  const outTotalPages = Math.ceil(filteredOutOfPlan.length / pageSize);
  const outPaginated = filteredOutOfPlan.slice((outPage - 1) * pageSize, outPage * pageSize);

  const handleExport = () => {
    exportToExcel(result);
  };

  const visitedPercent = filteredMetrics.totalPlan > 0
    ? Math.round((filteredMetrics.visited / filteredMetrics.totalPlan) * 100)
    : 0;

  const metricCards = [
    {
      label: 'Всего адресов в плане',
      value: filteredMetrics.totalPlan,
      color: 'bg-slate-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Посещено по плану',
      value: filteredMetrics.visited,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Не посещено',
      value: filteredMetrics.notVisited,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Посещено ВНЕ плана',
      value: filteredMetrics.outOfPlan,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  // Get column keys for tables (excluding internal _ prefixed ones)
  const planColumns = useMemo(() => {
    if (planWithStatus.length === 0) return [];
    return Object.keys(planWithStatus[0]).filter(
      (k) => !k.startsWith('_') || k === '_status'
    );
  }, [planWithStatus]);

  const factColumns = useMemo(() => {
    if (factOutOfPlan.length === 0) return [];
    return Object.keys(factOutOfPlan[0]).filter(
      (k) => !k.startsWith('_') || k === '_status'
    );
  }, [factOutOfPlan]);

  const getDisplayColumns = (cols: string[]): { key: string; label: string }[] => {
    return cols.map((k) => {
      if (k === '_status') return { key: k, label: 'Статус' };
      if (k === mapping.planPlateCol || k === mapping.factPlateCol) return { key: k, label: k };
      if (k === mapping.planAddressCol || k === mapping.factAddressCol) return { key: k, label: k };
      return { key: k, label: k };
    });
  };

  const renderCellValue = (row: Record<string, string | number>, key: string) => {
    if (key === '_status') {
      const val = String(row[key]);
      if (val === 'Посещен') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Посещен
          </span>
        );
      }
      if (val === 'Не посещен') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Не посещен
          </span>
        );
      }
      if (val === 'Вне плана') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
            </svg>
            Вне плана
          </span>
        );
      }
    }
    // Highlight plate and address columns
    if (key === mapping.planPlateCol || key === mapping.factPlateCol) {
      return <span className="font-mono text-sm font-medium text-slate-800">{row[key]}</span>;
    }
    if (key === mapping.planAddressCol || key === mapping.factAddressCol) {
      return <span className="text-sm text-slate-700">{row[key]}</span>;
    }
    return <span className="text-sm text-slate-600">{row[key]}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Результаты сверки</h2>
        <p className="text-slate-500 mt-1">Сравнение плановых и фактических данных маршрутов ТКО</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className={`${card.bgColor} rounded-xl p-4 border border-slate-200/50`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 font-medium">{card.label}</span>
              <span className={`${card.textColor}`}>{card.icon}</span>
            </div>
            <div className={`text-3xl font-bold ${card.textColor}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Выполнение плана</span>
          <span className="text-sm font-bold text-emerald-600">{visitedPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${visitedPercent}%` }}
          />
        </div>
      </div>

      {/* Filter + Export */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Фильтр по госномеру:</label>
          <select
            value={filterPlate}
            onChange={(e) => {
              setFilterPlate(e.target.value);
              setPlanPage(1);
              setOutPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Все госномера</option>
            {allPlates.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExport}
          className="px-5 py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Скачать итоговый отчёт (.xlsx)
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'plan'
                ? 'text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Анализ плана
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'plan' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {filteredPlan.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('outOfPlan')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'outOfPlan'
                ? 'text-amber-700 bg-amber-50 border-b-2 border-amber-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Внеплановые посещения
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'outOfPlan' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {filteredOutOfPlan.length}
            </span>
          </button>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {activeTab === 'plan' && (
            <>
              {filteredPlan.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Нет данных для отображения</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b">
                        №
                      </th>
                      {getDisplayColumns(planColumns).map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planPaginated.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          row._status === 'Не посещен' ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {(planPage - 1) * pageSize + i + 1}
                        </td>
                        {planColumns.map((col) => (
                          <td key={col} className="px-4 py-2.5">
                            {renderCellValue(row, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Pagination */}
              {planTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <span className="text-sm text-slate-500">
                    Страница {planPage} из {planTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlanPage(Math.max(1, planPage - 1))}
                      disabled={planPage === 1}
                      className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Назад
                    </button>
                    <button
                      onClick={() => setPlanPage(Math.min(planTotalPages, planPage + 1))}
                      disabled={planPage === planTotalPages}
                      className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Далее →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'outOfPlan' && (
            <>
              {filteredOutOfPlan.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Нет внеплановых посещений — отлично! 🎉</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b">
                        №
                      </th>
                      {getDisplayColumns(factColumns).map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {outPaginated.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {(outPage - 1) * pageSize + i + 1}
                        </td>
                        {factColumns.map((col) => (
                          <td key={col} className="px-4 py-2.5">
                            {renderCellValue(row, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Pagination */}
              {outTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <span className="text-sm text-slate-500">
                    Страница {outPage} из {outTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutPage(Math.max(1, outPage - 1))}
                      disabled={outPage === 1}
                      className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Назад
                    </button>
                    <button
                      onClick={() => setOutPage(Math.min(outTotalPages, outPage + 1))}
                      disabled={outPage === outTotalPages}
                      className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Далее →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
          Вернуться к настройкам
        </button>
      </div>
    </div>
  );
}

export default Step3Results;
