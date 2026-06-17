import { useCallback, useState } from 'react';
import type { AppState } from '../App';
import { parseFile, parseFileData } from '../utils/dataProcessing';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
}

function Step1Upload({ state, setState, onNext }: Props) {
  const [planLoading, setPlanLoading] = useState(false);
  const [factLoading, setFactLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [factError, setFactError] = useState('');
  const [planDragOver, setPlanDragOver] = useState(false);
  const [factDragOver, setFactDragOver] = useState(false);

  const handlePlanFile = useCallback(async (file: File) => {
    setPlanError('');
    setPlanLoading(true);
    try {
      const headers = await parseFile(file);
      const data = await parseFileData(file);
      if (headers.length === 0) {
        setPlanError('Файл пуст или не содержит данных');
        setPlanLoading(false);
        return;
      }
      setState((prev) => ({
        ...prev,
        planFile: file,
        planHeaders: headers,
        planData: data,
        mapping: {
          ...prev.mapping,
          planPlateCol: '',
          planAddressCol: '',
        },
      }));
    } catch {
      setPlanError('Ошибка при чтении файла. Поддерживаются форматы .xlsx и .csv');
    }
    setPlanLoading(false);
  }, [setState]);

  const handleFactFile = useCallback(async (file: File) => {
    setFactError('');
    setFactLoading(true);
    try {
      const headers = await parseFile(file);
      const data = await parseFileData(file);
      if (headers.length === 0) {
        setFactError('Файл пуст или не содержит данных');
        setFactLoading(false);
        return;
      }
      setState((prev) => ({
        ...prev,
        factFile: file,
        factHeaders: headers,
        factData: data,
        mapping: {
          ...prev.mapping,
          factPlateCol: '',
          factAddressCol: '',
        },
      }));
    } catch {
      setFactError('Ошибка при чтении файла. Поддерживаются форматы .xlsx и .csv');
    }
    setFactLoading(false);
  }, [setState]);

  const canProceed = state.planFile !== null && state.factFile !== null && !planLoading && !factLoading;

  const handleDrop = (e: React.DragEvent, type: 'plan' | 'fact') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'plan') setPlanDragOver(false);
    else setFactDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls')) {
        if (type === 'plan') handlePlanFile(file);
        else handleFactFile(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Загрузка данных</h2>
        <p className="text-slate-500 mt-1">Загрузите плановый и фактический файлы для сравнения</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan File Upload */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            planDragOver
              ? 'border-emerald-500 bg-emerald-50'
              : state.planFile
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
          onDragOver={(e) => { e.preventDefault(); setPlanDragOver(true); }}
          onDragLeave={() => setPlanDragOver(false)}
          onDrop={(e) => handleDrop(e, 'plan')}
          onClick={() => document.getElementById('plan-input')?.click()}
        >
          <input
            id="plan-input"
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePlanFile(file);
            }}
          />
          <div className="text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              state.planFile ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              {planLoading ? (
                <svg className="w-7 h-7 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : state.planFile ? (
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">📋 План</h3>
            <p className="text-sm text-slate-500 mb-3">Файл от контрагента с плановыми адресами и госномерами</p>
            {state.planFile ? (
              <div className="bg-white rounded-lg px-4 py-2 inline-block border border-emerald-200">
                <span className="text-sm text-emerald-700 font-medium">{state.planFile.name}</span>
                <br />
                <span className="text-xs text-slate-400">
                  {state.planData.length} строк · {state.planHeaders.length} колонок
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">.xlsx, .csv</span>
            )}
          </div>
          {planError && (
            <p className="text-red-500 text-sm mt-3 text-center">{planError}</p>
          )}
        </div>

        {/* Fact File Upload */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            factDragOver
              ? 'border-blue-500 bg-blue-50'
              : state.factFile
              ? 'border-blue-300 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
          onDragOver={(e) => { e.preventDefault(); setFactDragOver(true); }}
          onDragLeave={() => setFactDragOver(false)}
          onDrop={(e) => handleDrop(e, 'fact')}
          onClick={() => document.getElementById('fact-input')?.click()}
        >
          <input
            id="fact-input"
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFactFile(file);
            }}
          />
          <div className="text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              state.factFile ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              {factLoading ? (
                <svg className="w-7 h-7 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : state.factFile ? (
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">📍 Факт</h3>
            <p className="text-sm text-slate-500 mb-3">Выгрузка из системы «Телематик» с фактическими данными</p>
            {state.factFile ? (
              <div className="bg-white rounded-lg px-4 py-2 inline-block border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">{state.factFile.name}</span>
                <br />
                <span className="text-xs text-slate-400">
                  {state.factData.length} строк · {state.factHeaders.length} колонок
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">.xlsx, .csv</span>
            )}
          </div>
          {factError && (
            <p className="text-red-500 text-sm mt-3 text-center">{factError}</p>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
            canProceed
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Далее
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Step1Upload;
