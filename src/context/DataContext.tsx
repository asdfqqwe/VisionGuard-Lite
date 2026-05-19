import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type {
  DeliveryOrder,
  OutboundOrder,
  InspectionTask,
  AgentEvent,
  WorkOrder,
  ProblemItem,
  Claim,
  PutawayTask,
  PickTask,
  RecountTask,
  Appointment,
  TraceRecord,
  Supplier,
  ScenarioText,
} from '@/data/mockData';
import {
  allDeliveryOrders,
  allOutboundOrders,
  inspectionTasks,
  agentEvents,
  workOrders,
  problemItems,
  claims,
  putawayTasks,
  pickTasks,
  recountTasks,
  appointments,
  traceRecords,
  suppliers,
  scenarioTexts,
  dashboardData,
} from '@/data/mockData';
import { mockApi } from '@/api/mockApi';

// ─── Context Type ───
export interface DataContextType {
  // All mock data collections
  deliveryOrders: DeliveryOrder[];
  outboundOrders: OutboundOrder[];
  inspectionTasks: InspectionTask[];
  agentEvents: AgentEvent[];
  workOrders: WorkOrder[];
  problemItems: ProblemItem[];
  claims: Claim[];
  putawayTasks: PutawayTask[];
  pickTasks: PickTask[];
  recountTasks: RecountTask[];
  appointments: Appointment[];
  traceRecords: TraceRecord[];
  suppliers: Supplier[];
  scenarioTexts: ScenarioText[];
  dashboardData: typeof dashboardData;

  // Getters
  getDeliveryOrder: (orderNo: string) => DeliveryOrder | undefined;
  getAgentEvent: (eventNo: string) => AgentEvent | undefined;
  getWorkOrder: (workOrderId: string) => WorkOrder | undefined;
  getProblemItem: (problemItemNo: string) => ProblemItem | undefined;
  getClaim: (claimNo: string) => Claim | undefined;
  getSupplier: (supplierCode: string) => Supplier | undefined;
  getScenario: (scenario: string) => ScenarioText | undefined;

  // Setters / Updaters
  updateDeliveryOrder: (order: DeliveryOrder) => void;
  updateWorkOrder: (order: WorkOrder) => void;
  updateAgentEvent: (event: AgentEvent) => void;

  // Cross-device linkage
  linkedData: {
    pdaSubmittedReports: string[];
    stationDetections: string[];
    adminViewedEvents: string[];
  };
  linkPdaReport: (eventNo: string) => void;
  linkStationDetection: (eventNo: string) => void;
  linkAdminView: (eventNo: string) => void;

  // Mock API functions
  api: typeof mockApi;
}

// ─── Create Context ───
const DataContext = createContext<DataContextType | null>(null);

// ─── Provider ───
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  // Data collections
  const [deliveryOrdersState, setDeliveryOrders] = useState<DeliveryOrder[]>(allDeliveryOrders);
  const [workOrdersState, setWorkOrders] = useState<WorkOrder[]>(workOrders);
  const [agentEventsState, setAgentEvents] = useState<AgentEvent[]>(agentEvents);

  // Cross-device linkage state
  const [linkedData, setLinkedData] = useState({
    pdaSubmittedReports: [] as string[],
    stationDetections: [] as string[],
    adminViewedEvents: [] as string[],
  });

  // Getters
  const getDeliveryOrder = useCallback((orderNo: string) => {
    return deliveryOrdersState.find(o => o.orderNo === orderNo);
  }, [deliveryOrdersState]);

  const getAgentEvent = useCallback((eventNo: string) => {
    return agentEventsState.find(e => e.eventNo === eventNo);
  }, [agentEventsState]);

  const getWorkOrder = useCallback((workOrderId: string) => {
    return workOrdersState.find(w => w.workOrderId === workOrderId);
  }, [workOrdersState]);

  const getProblemItem = useCallback((problemItemNo: string) => {
    return problemItems.find(p => p.problemItemNo === problemItemNo);
  }, []);

  const getClaim = useCallback((claimNo: string) => {
    return claims.find(c => c.claimNo === claimNo);
  }, []);

  const getSupplier = useCallback((supplierCode: string) => {
    return suppliers.find(s => s.supplierCode === supplierCode);
  }, []);

  const getScenario = useCallback((scenario: string) => {
    return scenarioTexts.find(s => s.scenario === scenario);
  }, []);

  // Updaters
  const updateDeliveryOrder = useCallback((order: DeliveryOrder) => {
    setDeliveryOrders(prev => prev.map(o => o.orderNo === order.orderNo ? order : o));
  }, []);

  const updateWorkOrder = useCallback((order: WorkOrder) => {
    setWorkOrders(prev => prev.map(w => w.workOrderId === order.workOrderId ? order : w));
  }, []);

  const updateAgentEvent = useCallback((event: AgentEvent) => {
    setAgentEvents(prev => prev.map(e => e.eventNo === event.eventNo ? event : e));
  }, []);

  // Cross-device link functions
  const linkPdaReport = useCallback((eventNo: string) => {
    setLinkedData(prev => ({
      ...prev,
      pdaSubmittedReports: [...prev.pdaSubmittedReports, eventNo],
    }));
  }, []);

  const linkStationDetection = useCallback((eventNo: string) => {
    setLinkedData(prev => ({
      ...prev,
      stationDetections: [...prev.stationDetections, eventNo],
    }));
  }, []);

  const linkAdminView = useCallback((eventNo: string) => {
    setLinkedData(prev => ({
      ...prev,
      adminViewedEvents: [...prev.adminViewedEvents, eventNo],
    }));
  }, []);

  const value: DataContextType = {
    deliveryOrders: deliveryOrdersState,
    outboundOrders: allOutboundOrders,
    inspectionTasks,
    agentEvents: agentEventsState,
    workOrders: workOrdersState,
    problemItems,
    claims,
    putawayTasks,
    pickTasks,
    recountTasks,
    appointments,
    traceRecords,
    suppliers,
    scenarioTexts,
    dashboardData,
    getDeliveryOrder,
    getAgentEvent,
    getWorkOrder,
    getProblemItem,
    getClaim,
    getSupplier,
    getScenario,
    updateDeliveryOrder,
    updateWorkOrder,
    updateAgentEvent,
    linkedData,
    linkPdaReport,
    linkStationDetection,
    linkAdminView,
    api: mockApi,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// ─── Hook ───
export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export default DataContext;
