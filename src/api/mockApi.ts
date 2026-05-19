// =============================================================================
// 智见 — 仓储质检AI系统 · Mock API Layer
// Simulates all 8 API endpoints with network delay and random errors
// =============================================================================

import type {
  AgentAction,
  AgentStat,
  DetectLevel,
} from '@/data/mockData';
import {
  deliveryOrderPO007,
  agentEvents,
  workOrders,
} from '@/data/mockData';

// ─── API Response Types ───
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface DetectResult {
  detectId: string;
  isPass: boolean;
  anomalyType: string | null;
  confidence: number;
  aiSummary: string;
}

export interface ConfirmResult {
  orderStatus: string;
  putawayTaskIds: string[];
}

export interface WorkOrderResult {
  workOrderId: string;
  iqNo: string | null;
  clNo: string | null;
}

export interface AgentActionResult {
  agentActions: AgentAction[];
  agentStat: AgentStat;
  suggestedHandler: string;
}

export interface PurchaseSyncResult {
  purchaseOrderStatus: string;
  syncedAt: string;
  cached?: boolean;
}

export interface PurchaseQueryResult {
  purchaseOrderNo: string;
  status: string;
  expectedItems: { skuName: string; quantity: number; unit: string }[];
  discrepancies: { item: string; expected: number; actual: number }[];
}

export interface InventoryUpdateResult {
  newBalance: number;
  updateTime: string;
}

export interface ExceptionTriageResult {
  suggestedAction: string;
  targetHandler: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Simulated error rate: 10% ───
const ERROR_RATE = 0.1;
const MIN_DELAY = 200;
const MAX_DELAY = 500;

// ─── Internal state for idempotency ───
const syncedDeliveryOrders = new Set<string>();
const syncCache = new Map<string, PurchaseSyncResult>();

// ─── Utility: simulate network delay ───
function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Utility: simulate random error ───
function maybeError<T>(data: T, errorCode = 5001): Promise<ApiResponse<T>> {
  if (Math.random() < ERROR_RATE) {
    console.error(`[MockAPI] Simulated error ${errorCode}`);
    return Promise.resolve({
      code: errorCode,
      message: '服务暂不可用，请稍后重试',
      data: {} as T,
    });
  }
  return Promise.resolve({ code: 0, message: 'success', data });
}

// ─── Log helper ───
function logApi(method: string, endpoint: string, payload?: unknown): void {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] MockAPI ${method} ${endpoint}`, payload ? JSON.stringify(payload) : '');
}

// =============================================================================
// API Endpoint 1: POST /receive/detect
// Submit vision detection results
// =============================================================================
export async function postReceiveDetect(params: {
  deliveryOrderNo: string;
  materialCode: string;
  images: string[];
  detectType: string;
}): Promise<ApiResponse<DetectResult>> {
  logApi('POST', '/receive/detect', params);
  await delay();

  // Find matching item in PO-007
  const item = deliveryOrderPO007.items.find(
    i => i.materialName === params.materialCode || i.id === params.materialCode
  );

  const result: DetectResult = {
    detectId: `DET-${Date.now()}`,
    isPass: item ? item.status === '通过' : true,
    anomalyType: item?.status !== '通过' ? item?.result ?? null : null,
    aiSummary: item
      ? `检测完成：${item.materialName}，结果：${item.result}${item.detectLevel ? `，等级：${item.detectLevel}` : ''}`
      : '检测完成：未找到匹配物资',
    confidence: 85 + Math.floor(Math.random() * 15),
  };

  return maybeError(result);
}

// =============================================================================
// API Endpoint 2: POST /receive/confirm
// Confirm receipt (full or partial)
// =============================================================================
export async function postReceiveConfirm(params: {
  deliveryOrderNo: string;
  confirmType: 'full' | 'partial';
  anomalyIds: string[];
}): Promise<ApiResponse<ConfirmResult>> {
  logApi('POST', '/receive/confirm', params);
  await delay();

  const order = deliveryOrderPO007;
  const passedItems = order.items.filter(i => i.status === '通过');
  const putawayTaskIds = passedItems.map(i => i.putawayTaskId).filter(Boolean) as string[];

  const result: ConfirmResult = {
    orderStatus: params.confirmType === 'full' ? '已完结' : '部分签收',
    putawayTaskIds,
  };

  return maybeError(result);
}

// =============================================================================
// API Endpoint 3: POST /workorder/create
// Create work order from anomaly event
// =============================================================================
export async function postWorkOrderCreate(params: {
  eventNo: string;
  anomalyType: string;
  materialCode: string;
  level: DetectLevel;
  images: string[];
}): Promise<ApiResponse<WorkOrderResult>> {
  logApi('POST', '/workorder/create', params);
  await delay();

  // Find existing work order for this event
  const existing = workOrders.find(w => w.eventNo === params.eventNo);

  if (existing) {
    const result: WorkOrderResult = {
      workOrderId: existing.workOrderId,
      iqNo: existing.workOrderId.replace('WO', 'IQ'),
      clNo: existing.level === 'L1' ? existing.workOrderId.replace('WO', 'CL') : null,
    };
    return Promise.resolve({ code: 0, message: 'success', data: result });
  }

  // Generate new IDs
  const newId = workOrders.length + 1;
  const result: WorkOrderResult = {
    workOrderId: `WO-00${newId}`,
    iqNo: `IQ-00${newId}`,
    clNo: params.level === 'L1' ? `CL-00${newId}` : null,
  };

  return maybeError(result);
}

// =============================================================================
// API Endpoint 4: GET /agent/action
// Get Agent action suggestions
// =============================================================================
export async function getAgentAction(params: {
  eventNo?: string;
  anomalyType?: string;
  deliveryOrderNo?: string;
}): Promise<ApiResponse<AgentActionResult>> {
  logApi('GET', '/agent/action', params);
  await delay();

  // Find matching event
  const event = params.eventNo
    ? agentEvents.find(e => e.eventNo === params.eventNo)
    : agentEvents[0];

  const result: AgentActionResult = {
    agentActions: event?.suggestedActions ?? ['建议人工复核'],
    agentStat: event?.status ?? '待人工确认',
    suggestedHandler: getSuggestedHandler(event?.anomalyType ?? ''),
  };

  return maybeError(result);
}

function getSuggestedHandler(anomalyType: string): string {
  if (anomalyType.includes('多模态')) return '安全主管';
  if (anomalyType.includes('标签')) return '收货主管';
  if (anomalyType.includes('型号')) return '收货主管';
  if (anomalyType.includes('库存')) return '巡检员';
  if (anomalyType.includes('外观')) return '质检员';
  return '收货员';
}

// =============================================================================
// API Endpoint 5: POST /purchase/sync-status
// Idempotent! Tracks synced delivery orders in a Set
// =============================================================================
export async function postPurchaseSyncStatus(params: {
  deliveryOrderNo: string;
  syncPhase: 'appointment' | 'received' | 'completed' | 'claim';
  syncData: Record<string, unknown>;
}): Promise<ApiResponse<PurchaseSyncResult>> {
  logApi('POST', '/purchase/sync-status', params);
  await delay();

  const cacheKey = `${params.deliveryOrderNo}-${params.syncPhase}`;

  // Idempotency check: if already synced, return cached result
  if (syncedDeliveryOrders.has(cacheKey)) {
    const cached = syncCache.get(cacheKey);
    if (cached) {
      console.log(`[MockAPI] Idempotent: ${cacheKey} already synced, returning cached result`);
      return Promise.resolve({
        code: 0,
        message: 'success (cached)',
        data: { ...cached, cached: true },
      });
    }
  }

  const phaseMap: Record<string, string> = {
    appointment: '待到货',
    received: '已收货',
    completed: '已完结',
    claim: '索赔中',
  };

  const result: PurchaseSyncResult = {
    purchaseOrderStatus: phaseMap[params.syncPhase] ?? '未知',
    syncedAt: new Date().toISOString(),
  };

  // Track synced order for idempotency
  syncedDeliveryOrders.add(cacheKey);
  syncCache.set(cacheKey, result);

  console.log(`[MockAPI] Synced: ${cacheKey} -> ${result.purchaseOrderStatus}`);
  return maybeError(result);
}

// =============================================================================
// API Endpoint 6: GET /purchase/sync-query
// Query purchase order status
// =============================================================================
export async function getPurchaseSyncQuery(params: {
  deliveryOrderNo: string;
}): Promise<ApiResponse<PurchaseQueryResult>> {
  logApi('GET', '/purchase/sync-query', params);
  await delay();

  const order = deliveryOrderPO007;
  const discrepancies = order.items
    .filter(i => i.status !== '通过')
    .map(i => ({
      item: i.materialName,
      expected: i.quantity,
      actual: 0,
    }));

  const result: PurchaseQueryResult = {
    purchaseOrderNo: order.purchaseOrderNo,
    status: order.syncedToPurchase ? '已同步' : '待同步',
    expectedItems: order.items.map(i => ({
      skuName: i.materialName,
      quantity: i.quantity,
      unit: i.unit,
    })),
    discrepancies,
  };

  return maybeError(result);
}

// =============================================================================
// API Endpoint 7: POST /inventory/update
// Update inventory
// =============================================================================
export async function postInventoryUpdate(params: {
  materialCode: string;
  locationCode: string;
  quantity: number;
  operationType: 'in' | 'out' | 'adjust';
}): Promise<ApiResponse<InventoryUpdateResult>> {
  logApi('POST', '/inventory/update', params);
  await delay();

  const baseBalance = 100;
  const adjustment = params.operationType === 'in' ? params.quantity : -params.quantity;

  const result: InventoryUpdateResult = {
    newBalance: baseBalance + adjustment,
    updateTime: new Date().toISOString(),
  };

  return maybeError(result);
}

// =============================================================================
// API Endpoint 8: POST /exception/triage
// Exception triage
// =============================================================================
export async function postExceptionTriage(params: {
  anomalyType: string;
  materialCategory: string;
  level: DetectLevel;
  images: string[];
}): Promise<ApiResponse<ExceptionTriageResult>> {
  logApi('POST', '/exception/triage', params);
  await delay();

  const priorityMap: Record<DetectLevel, 'high' | 'medium' | 'low'> = {
    L1: 'high',
    L2: 'medium',
  };

  const suggestedAction = getTriageAction(params.anomalyType, params.materialCategory);
  const targetHandler = getTriageHandler(params.anomalyType);

  const result: ExceptionTriageResult = {
    suggestedAction,
    targetHandler,
    priority: priorityMap[params.level],
  };

  return maybeError(result);
}

function getTriageAction(anomalyType: string, materialCategory: string): string {
  if (materialCategory === '特殊库物资') return '立即隔离 + 触发消防预警';
  if (anomalyType.includes('标签')) return '暂缓签收 + 补标重检';
  if (anomalyType.includes('型号')) return '创建工单 + 移入问题件区';
  if (anomalyType.includes('库存')) return '盘点复点';
  return '人工复核';
}

function getTriageHandler(anomalyType: string): string {
  if (anomalyType.includes('多模态')) return '安全主管';
  if (anomalyType.includes('型号')) return '收货主管';
  if (anomalyType.includes('标签')) return '收货主管';
  return '质检员';
}

// =============================================================================
// Export all API functions as a single object for convenience
// =============================================================================
export const mockApi = {
  postReceiveDetect,
  postReceiveConfirm,
  postWorkOrderCreate,
  getAgentAction,
  postPurchaseSyncStatus,
  getPurchaseSyncQuery,
  postInventoryUpdate,
  postExceptionTriage,
};

export default mockApi;
