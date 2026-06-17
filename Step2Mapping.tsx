import { useState } from 'react';
import type { TabType, ColumnMapping, ComparisonResult } from './types';
import TabSync from './components/TabSync';
import TabSettings from './components/TabSettings';
import TabResults from './components/TabResults';
import TabReport from './components/TabReport';
import { LayoutDashboard, Settings, RefreshCw, FileText } from 'lucide-react';

export interface AppState {
  planFile: File | null;
  factFile: File | null;
  planHeaders: string[];
  factHeaders: string[];
  planData: Record<string, string>[];
  factData: Record<string, string>[];
  mapping: ColumnMapping;
  result: ComparisonResult | null;
  selectedDate: string;
  isSyncing: boolean;
  geozonesCount: number;
  lastUpdated: string;
}

const initialMapping: ColumnMapping = {
  planPlateCol: '',
  planAddressCol: '',
  factPlateCol: '',
  factAddressCol: '',
};

const initialState: AppState = {
  planFile: null,
  factFile: null,
  planHeaders: [],
  factHeaders: [],
  planData: [],
  factData: [],
  mapping: initialMapping,
  result: null,
  selectedDate: new Date().toISOString().split('T')[0],
  isSyncing: false,
  geozonesCount: 1742,
  lastUpdated: 'Сегодня',
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sync');
  const [state, setState] = useState<AppState>(initialState);

  const tabs = [
    { id: 'sync' as const, label: 'Данные и Синхронизация', icon: RefreshCw },
    { id: 'settings' as const, label: 'Настройка', icon: Settings },
    { id: 'results' as const, label: 'Результаты (Таблицы)', icon: LayoutDashboard },
    { id: 'report' as const, label: 'Аналитическая справка', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ТКО Контроль</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Закрытый портал</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center h-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 h-full text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-700">Администратор</p>
              <p className="text-[10px] text-slate-400">Система активна</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] p-6">
          {activeTab === 'sync' && (
            <TabSync state={state} setState={setState} onNext={() => setActiveTab('settings')} />
          )}
          {activeTab === 'settings' && (
            <TabSettings state={state} setState={setState} onNext={() => setActiveTab('results')} />
          )}
          {activeTab === 'results' && (
            <TabResults state={state} setState={setState} />
          )}
          {activeTab === 'report' && (
            <TabReport state={state} />
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-white border-t border-slate-200 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              API ГЛОНАССSoft: Подключено
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              База геозон: {state.geozonesCount} объектов
            </span>
          </div>
          <span>v1.0.0-MVP</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
