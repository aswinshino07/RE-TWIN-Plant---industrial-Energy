import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlantConfig,
  PlantAsset,
  TelemetryReading,
  DashboardKpi,
  WasteEvent,
  SimulatorFaultState,
  UserRole,
  AppLanguage,
} from '../types';
import { api } from '../services/api';

export type ActiveTab =
  | 'dashboard'
  | 'live_plant'
  | 'sec'
  | 'baseline'
  | 'waste'
  | 'health'
  | 'twin'
  | 'scheduler'
  | 'decision'
  | 'mv'
  | 'carbon'
  | 'simulator'
  | 'architecture'
  | 'settings'
  | 'reports';

interface NotificationToast {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  plant: PlantConfig | null;
  assets: PlantAsset[];
  readings: TelemetryReading[];
  kpi: DashboardKpi | null;
  activeWaste: WasteEvent[];
  activeFaults: SimulatorFaultState;
  simSpeed: 1 | 5 | 10;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  startHackathonDemo: () => Promise<void>;
  advanceDemoStep: () => Promise<void>;
  resetHackathonDemo: () => Promise<void>;
  notifications: NotificationToast[];
  addNotification: (toast: Omit<NotificationToast, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  triggerFault: (fault: keyof SimulatorFaultState, active: boolean, severity?: number) => Promise<void>;
  changeSpeed: (speed: 1 | 5 | 10) => Promise<void>;
  resetPlantSimulation: () => Promise<void>;
  refreshTelemetry: () => Promise<void>;
}

const defaultFaults: SimulatorFaultState = {
  compressorLeakage: { active: false, severity: 0.6 },
  compressorIdleRunning: { active: false, severity: 0.5 },
  furnaceInefficientHolding: { active: false, severity: 0.7 },
  motorDegradation: { active: false, severity: 0.8 },
  lowPowerFactor: { active: false, severity: 0.75 },
  demandSpike: { active: false, severity: 0.6 },
  sensorDropout: { active: false, severity: 0.5 },
  productionDrop: { active: false, severity: 0.5 },
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [role, setRole] = useState<UserRole>('plant_manager');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [plant, setPlant] = useState<PlantConfig | null>(null);
  const [assets, setAssets] = useState<PlantAsset[]>([]);
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [activeWaste, setActiveWaste] = useState<WasteEvent[]>([]);
  const [activeFaults, setActiveFaults] = useState<SimulatorFaultState>(defaultFaults);
  const [simSpeed, setSimSpeed] = useState<1 | 5 | 10>(1);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  const addNotification = useCallback((toast: Omit<NotificationToast, 'id' | 'timestamp'>) => {
    const newToast: NotificationToast = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Fetch initial plant & assets
  useEffect(() => {
    api.getPlant().then((data) => setPlant(data.plant)).catch(console.error);
    api.getAssets().then((data) => setAssets(data.assets)).catch(console.error);
  }, []);

  // Telemetry poller (every 2.5 seconds)
  const refreshTelemetry = useCallback(async () => {
    try {
      const [readingsData, dashData] = await Promise.all([
        api.getReadings(),
        api.getDashboard(),
      ]);
      setReadings(readingsData.readings);
      setActiveFaults(readingsData.simulator_state.active_faults);
      setSimSpeed(readingsData.simulator_state.speed);
      setKpi(dashData.kpi);
      setActiveWaste(dashData.active_waste_events);
    } catch (err) {
      console.warn('Telemetry polling error:', err);
    }
  }, []);

  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 2500);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  const triggerFault = async (fault: keyof SimulatorFaultState, active: boolean, severity = 0.6) => {
    try {
      await api.injectFault(fault, active, severity);
      await refreshTelemetry();
      addNotification({
        type: active ? 'warning' : 'info',
        title: active ? `Fault Injected: ${fault}` : `Fault Cleared: ${fault}`,
        message: active
          ? `Injected ${fault} at ${(severity * 100).toFixed(0)}% severity. Watch telemetry response.`
          : `Deactivated ${fault} simulation. Restoring nominal operation.`,
      });
    } catch (err: any) {
      console.error('Failed to trigger fault:', err);
    }
  };

  const changeSpeed = async (speed: 1 | 5 | 10) => {
    try {
      await api.setSimulatorSpeed(speed);
      setSimSpeed(speed);
      addNotification({
        type: 'info',
        title: 'Simulation Speed Changed',
        message: `Telemetry accelerator adjusted to ${speed}x real-time.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetPlantSimulation = async () => {
    try {
      await api.resetSimulator();
      await refreshTelemetry();
      addNotification({
        type: 'success',
        title: 'Simulation Reset',
        message: 'Plant telemetry and faults reset to nominal baseline state.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 8-Step Hackathon Demo Automation
  const startHackathonDemo = async () => {
    setIsDemoModalOpen(true);
    setDemoStep(1);
    await resetPlantSimulation();
    setActiveTab('dashboard');
    addNotification({
      type: 'info',
      title: 'Hackathon Demo Mode Initialized',
      message: 'Step 1/8: Observing normal baseline operation in Kolhapur Foundry demo.',
    });
  };

  const advanceDemoStep = async () => {
    const next = demoStep + 1;
    if (next > 8) {
      setIsDemoModalOpen(false);
      setDemoStep(1);
      return;
    }

    setDemoStep(next);

    switch (next) {
      case 2:
        // Step 2: Inject compressor leakage
        await triggerFault('compressorLeakage', true, 0.75);
        setActiveTab('live_plant');
        break;
      case 3:
        // Step 3: Observe energy anomaly
        setActiveTab('waste');
        break;
      case 4:
        // Step 4: Single-meter compressor leakage diagnosis
        setActiveTab('waste');
        break;
      case 5:
        // Step 5: Digital Twin simulation
        setActiveTab('twin');
        break;
      case 6:
        // Step 6: Decision Center
        setActiveTab('decision');
        break;
      case 7:
        // Step 7: Statistically verify savings (M&V)
        setActiveTab('mv');
        break;
      case 8:
        // Step 8: Carbon Passport
        setActiveTab('carbon');
        break;
      default:
        break;
    }
  };

  const resetHackathonDemo = async () => {
    setDemoStep(1);
    await resetPlantSimulation();
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        role,
        setRole,
        language,
        setLanguage,
        plant,
        assets,
        readings,
        kpi,
        activeWaste,
        activeFaults,
        simSpeed,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isDemoModalOpen,
        setIsDemoModalOpen,
        demoStep,
        setDemoStep,
        startHackathonDemo,
        advanceDemoStep,
        resetHackathonDemo,
        notifications,
        addNotification,
        removeNotification,
        triggerFault,
        changeSpeed,
        resetPlantSimulation,
        refreshTelemetry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
