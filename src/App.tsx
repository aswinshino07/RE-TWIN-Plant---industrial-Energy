import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { LivePlantView } from './pages/LivePlantView';
import { EnergyIntelligence } from './pages/EnergyIntelligence';
import { BaselineAndMV } from './pages/BaselineAndMV';
import { WasteDetectionView } from './pages/WasteDetectionView';
import { EquipmentHealthView } from './pages/EquipmentHealthView';
import { DigitalTwinView } from './pages/DigitalTwinView';
import { SchedulingOptimiser } from './pages/SchedulingOptimiser';
import { DecisionCenter } from './pages/DecisionCenter';
import { CarbonPassportView } from './pages/CarbonPassportView';
import { VerifiedSavingsReportView } from './pages/VerifiedSavingsReportView';
import { DataSimulatorView } from './pages/DataSimulatorView';
import { ArchitectureView } from './pages/ArchitectureView';
import { DataQualityAndSettings } from './pages/DataQualityAndSettings';
import { AIAssistantDrawer } from './components/common/AIAssistantDrawer';
import { DemoGuideModal } from './components/common/DemoGuideModal';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTab: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Module ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-96 flex-col items-center justify-center p-8 text-center font-mono">
          <div className="rounded-lg border border-amber-500/40 bg-zinc-900/90 p-6 max-w-md shadow-xl">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-400 mb-2" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Module Auto-Recovery
            </h2>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              An unexpected render issue was safely intercepted: {this.state.error?.message || 'Component exception'}.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.fallbackTab();
              }}
              className="mt-4 flex items-center justify-center gap-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-xs font-bold font-mono transition-colors mx-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Command Center</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, notifications, removeNotification } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'live_plant':
        return <LivePlantView />;
      case 'sec':
        return <EnergyIntelligence />;
      case 'baseline':
        return <BaselineAndMV />;
      case 'waste':
        return <WasteDetectionView />;
      case 'health':
        return <EquipmentHealthView />;
      case 'twin':
        return <DigitalTwinView />;
      case 'scheduler':
        return <SchedulingOptimiser />;
      case 'decision':
        return <DecisionCenter />;
      case 'mv':
        return <BaselineAndMV />;
      case 'carbon':
        return <CarbonPassportView />;
      case 'reports':
        return <VerifiedSavingsReportView />;
      case 'simulator':
        return <DataSimulatorView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'settings':
        return <DataQualityAndSettings />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 font-sans text-zinc-100 antialiased overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body: Sidebar + Scrollable View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-950 pb-16 custom-scrollbar">
          <ModuleErrorBoundary fallbackTab={() => setActiveTab('dashboard')}>
            {renderPage()}
          </ModuleErrorBoundary>
        </main>
      </div>

      {/* Floating Drawers & Modals */}
      <AIAssistantDrawer />
      <DemoGuideModal />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3.5 shadow-xl text-xs backdrop-blur-md transition-all animate-slide-in ${
              toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
            }`}
          >
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />}
            {toast.type === 'error' && <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />}

            <div className="flex-1">
              <div className="font-bold">{toast.title}</div>
              <div className="text-[11px] opacity-90 mt-0.5">{toast.message}</div>
            </div>

            <button
              onClick={() => removeNotification(toast.id)}
              className="rounded p-1 hover:bg-black/20 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
