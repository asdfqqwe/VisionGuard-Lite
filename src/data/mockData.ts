// =============================================================================
// 智见 — 仓储质检AI系统 · Mock Data Layer
// All mock data and TypeScript interfaces for the three-device system
// =============================================================================

// ─── Enums ───
export type MaterialCategory = '关键零部件' | '标准包装物资' | '低风险日用品' | '特殊库物资';
export type InspectionMode = '抽检' | '全检' | '仅扫码确认';
export type RiskAttribute = '常规' | '效期' | '防伪溯源' | '动力电池' | '油液';
export type AgentAction = '建议签收' | '建议暂缓' | '创建工单' | '提醒主管' | '催办处理' | '移入问题件区' | '发起索赔' | '退回拣货' | '盘点复点' | '提交异常上报' | '建议人工复核' | '立即隔离' | '触发消防预警' | '通知安全主管' | '暂缓签收' | '合规记录';
export type AgentStat = '待人工确认' | '已提醒' | '处理中' | '已处理';
export type DetectLevel = 'L1' | 'L2';
export type WarehouseState = '待检' | '待复核' | '已隔离' | '待索赔' | '已上架' | '已出库' | '已完结';

// ─── Delivery (收货) ───
export interface DeliveryItem {
  id: string;
  lineNo: number;
  materialName: string;
  category: MaterialCategory;
  inspectionMode: InspectionMode;
  quantity: number;
  unit: string;
  result: '合格' | '型号不符' | '外箱缺产品标识' | '标准号不清晰' | string;
  status: '通过' | '拦截' | '警示' | '不清晰' | '标签缺失' | '外观缺陷' | '多模态异常';
  detectLevel?: DetectLevel;
  batchNo?: string;
  followUp?: string;
  agentEventNo?: string;
  putawayTaskId?: string;
}

export interface DeliveryOrder {
  orderNo: string;
  supplier: string;
  supplierCode: string;
  orderDate: string;
  items: DeliveryItem[];
  status: WarehouseState;
  syncedToPurchase: boolean;
  purchaseOrderNo: string;
}

// ─── Outbound (出库) ───
export interface OutboundItem {
  id: string;
  lineNo: number;
  materialName: string;
  category: MaterialCategory;
  location: string;
  result: '合格' | '型号不符' | '数量不符' | string;
  status: '通过' | '拦截' | '警示';
  detectLevel?: DetectLevel;
  agentEventNo?: string;
}

export interface OutboundOrder {
  orderNo: string;
  orderDate: string;
  items: OutboundItem[];
  status: WarehouseState;
}

// ─── Inspection Task (巡检任务) ───
export interface InspectionTask {
  taskNo: string;
  location: string;
  materialName: string;
  category: MaterialCategory;
  riskAttr: RiskAttribute;
  status: '待执行' | '已完成' | '异常';
  result: string;
  systemQuantity: number;
  actualQuantity?: number;
  unit: string;
  agentEventNo?: string;
  workOrderId?: string;
}

// ─── Agent Event ───
export interface AgentEvent {
  eventNo: string;
  source: string;
  anomalyType: string;
  materialName: string;
  detectLevel: DetectLevel;
  suggestedActions: AgentAction[];
  status: AgentStat;
  linkedIds: {
    workOrderId?: string;
    problemItemNo?: string;
    claimNo?: string;
  };
  scenario: string; // A-H
}

// ─── Work Order (工单) ───
export interface WorkOrder {
  workOrderId: string;
  title: string;
  eventNo: string;
  anomalyType: string;
  materialName: string;
  level: DetectLevel;
  status: '待处理' | '处理中' | '已完结';
  createdAt: string;
  assignedTo: string;
  description: string;
  images?: string[];
}

// ─── Problem Item (问题件) ───
export interface ProblemItem {
  problemItemNo: string;
  materialName: string;
  anomalyType: string;
  tempLocation: string;
  warehouseState: WarehouseState;
  claimNo?: string;
  images: string[];
  createdAt: string;
  receiver?: string;
}

// ─── Claim (索赔) ───
export interface Claim {
  claimNo: string;
  title: string;
  materialName: string;
  amount: number;
  status: '待处理' | '处理中' | '已结案';
  createdAt: string;
  supplier: string;
  description: string;
  images: string[];
}

// ─── Putaway Task (上架任务) ───
export interface PutawayTask {
  taskNo: string;
  materialName: string;
  targetLocation: string;
  source: string;
  status: '待执行' | '已完成';
}

// ─── Return Inbound (生产退料入库) ───
export interface ReturnInboundItem {
  id: string;
  materialName: string;
  oldBarcode: string;
  newBarcode: string;
  expectedQty: number;
  actualQty: number;
  unit: string;
  category: '关键零部件' | '标准件' | '辅料';
  targetLocation: string;
  labelStatus: '完整' | '轻微磨损' | '缺失';
  ocrStatus: '通过' | '待复核';
  bindStatus: '已重绑' | '待重绑';
}

export interface ReturnInboundOrder {
  returnNo: string;
  workshop: string;
  reason: string;
  submitter: string;
  createdAt: string;
  auditStatus: '待审核' | '已通过' | '驳回';
  stationStatus: '待复检' | '复检中' | '复检通过';
  inboundStatus: '待入库' | '已入库';
  station: string;
  riskLevel: '低' | '中' | '高';
  items: ReturnInboundItem[];
  checks: {
    barcode: string;
    label: string;
    visualCount: string;
    ocr: string;
    storage: string;
  };
  auditTimeline: { role: string; action: string; time: string }[];
}

// ─── Pick Task (拣货任务) ───
export interface PickTask {
  taskNo: string;
  materialName: string;
  sourceLocation: string;
  quantity: number;
  unit: string;
  status: '待执行' | '已拣货';
}

// ─── Recount Task (盘点任务) ───
export interface RecountTask {
  taskNo: string;
  location: string;
  materialName: string;
  systemQuantity: number;
  unit: string;
  lastCountDate: string;
  triggerSource: '动碰' | '静态' | '巡检触发';
  status: '待执行' | '已完成' | '差异';
}

// ─── Appointment (到货预约) ───
export interface Appointment {
  appointmentNo: string;
  deliveryOrderNo: string;
  supplier: string;
  expectedArrival: string;
  skuList: { skuName: string; quantity: number; unit: string }[];
  carrier: string;
  packagingMethod: string;
  status: '待到货' | '已到货' | '已完结';
}

// ─── Trace Record (溯源记录) ───
export interface TraceRecord {
  traceNo: string;
  barcode: string;
  materialName: string;
  batchLot: string;
  status: '通过' | '伪造';
  sourceOrderNo: string;
  timeline: { stage: string; time: string }[];
  expiryDate?: string;
  isNewCode: boolean;
}

// ─── Supplier (供应商) ───
export interface Supplier {
  supplierCode: string;
  supplierName: string;
  contact: string;
  phone: string;
  totalDeliveries: number;
  anomalyCount: number;
  anomalyIn7Days: number;
  recentAnomalies: string[];
  riskLevel: '低风险' | '中风险' | '高风险';
}

// ─── Scenario Text (场景文案) ───
export interface ScenarioText {
  scenario: string; // A-H
  conclusion: string;
  suggestedAction: string;
  responsibleRole: string;
  level?: DetectLevel;
  eventNo?: string;
}

// =============================================================================
// MOCK DATA INSTANCES
// =============================================================================

// ─── Delivery Order PO-007 ───
export const deliveryOrderPO007: DeliveryOrder = {
  orderNo: 'PO-007',
  supplier: '江南华盛',
  supplierCode: 'SUP-001',
  orderDate: '2024-03-15',
  items: [
    {
      id: 'DI-001',
      lineNo: 1,
      materialName: '前轮轴承',
      category: '关键零部件',
      inspectionMode: '抽检',
      quantity: 20,
      unit: '件',
      result: '合格',
      status: '通过',
      batchNo: 'B20260310A',
      followUp: '生成上架任务 PUT-001',
      putawayTaskId: 'PUT-001',
    },
    {
      id: 'DI-002',
      lineNo: 2,
      materialName: '发动机线束',
      category: '关键零部件',
      inspectionMode: '抽检',
      quantity: 4,
      unit: '件',
      result: '型号不符',
      status: '拦截',
      detectLevel: 'L1',
      batchNo: 'B20260309C',
      followUp: 'AE-001，创建 WO-001 + IQ-001 + CL-001',
      agentEventNo: 'AE-001',
    },
    {
      id: 'DI-003',
      lineNo: 3,
      materialName: '矿泉水',
      category: '标准包装物资',
      inspectionMode: '抽检',
      quantity: 12,
      unit: '箱',
      result: '合格',
      status: '通过',
      followUp: '生成上架任务 PUT-003',
      putawayTaskId: 'PUT-003',
    },
    {
      id: 'DI-004',
      lineNo: 4,
      materialName: '一次性丁腈手套',
      category: '低风险日用品',
      inspectionMode: '仅扫码确认',
      quantity: 40,
      unit: '盒',
      result: '外箱缺产品标识',
      status: '标签缺失',
      detectLevel: 'L1',
      followUp: 'AE-004，创建 WO-004',
      agentEventNo: 'AE-004',
    },
    {
      id: 'DI-005',
      lineNo: 5,
      materialName: '前保险杠',
      category: '关键零部件',
      inspectionMode: '全检',
      quantity: 8,
      unit: '件',
      result: '合格',
      status: '通过',
      batchNo: 'B20260312D',
      followUp: '生成上架任务 PUT-005',
      putawayTaskId: 'PUT-005',
    },
    {
      id: 'DI-006',
      lineNo: 6,
      materialName: '5W-40机油',
      category: '标准包装物资',
      inspectionMode: '抽检',
      quantity: 6,
      unit: '桶',
      result: '标准号不清晰',
      status: '不清晰',
      detectLevel: 'L2',
      batchNo: 'B20260308E',
      followUp: 'AE-005，转人工复核',
      agentEventNo: 'AE-005',
    },
    {
      id: 'DI-007',
      lineNo: 7,
      materialName: '动力电池组',
      category: '特殊库物资',
      inspectionMode: '全检',
      quantity: 2,
      unit: '件',
      result: '合格（视觉 + 重力 + 红外三模验证通过）',
      status: '通过',
      batchNo: 'B20260307F',
      followUp: '生成上架任务 PUT-006，进入温控隔离区',
      putawayTaskId: 'PUT-006',
    },
  ],
  status: '待检',
  syncedToPurchase: false,
  purchaseOrderNo: 'PU-2024-007',
};

// ─── Outbound Order SO-031 ───
export const outboundOrderSO031: OutboundOrder = {
  orderNo: 'SO-031',
  orderDate: '2024-03-16',
  items: [
    {
      id: 'OI-001',
      lineNo: 1,
      materialName: '前轮轴承',
      category: '关键零部件',
      location: 'B-01-03',
      result: '合格',
      status: '通过',
    },
    {
      id: 'OI-002',
      lineNo: 2,
      materialName: '丁腈手套L',
      category: '低风险日用品',
      location: 'B-02-01',
      result: '合格',
      status: '通过',
    },
    {
      id: 'OI-003',
      lineNo: 3,
      materialName: '雨刮电机',
      category: '关键零部件',
      location: 'B-03-02',
      result: '实物与系统型号不符',
      status: '拦截',
      detectLevel: 'L1',
      agentEventNo: 'AE-002',
    },
  ],
  status: '待复核',
};

// ─── Inspection Tasks (5 tasks) ───
export const inspectionTasks: InspectionTask[] = [
  {
    taskNo: 'INS-001',
    location: 'A-01-02',
    materialName: '前轮轴承',
    category: '关键零部件',
    riskAttr: '常规',
    status: '已完成',
    result: '包装正常，标签匹配',
    systemQuantity: 20,
    actualQuantity: 20,
    unit: '件',
  },
  {
    taskNo: 'INS-002',
    location: 'A-03-05',
    materialName: '矿泉水',
    category: '标准包装物资',
    riskAttr: '常规',
    status: '异常',
    result: '系统12箱，现场10箱 → 触发盘点复点',
    systemQuantity: 12,
    actualQuantity: 10,
    unit: '箱',
    agentEventNo: 'AE-003',
    workOrderId: 'WO-003',
  },
  {
    taskNo: 'INS-003',
    location: 'A-04-01',
    materialName: '丁腈手套',
    category: '低风险日用品',
    riskAttr: '常规',
    status: '已完成',
    result: '正常',
    systemQuantity: 40,
    actualQuantity: 40,
    unit: '盒',
  },
  {
    taskNo: 'INS-004',
    location: 'A-06-03',
    materialName: '5W-40机油',
    category: '标准包装物资',
    riskAttr: '效期',
    status: '已完成',
    result: '效期临近预警',
    systemQuantity: 6,
    actualQuantity: 6,
    unit: '桶',
  },
  {
    taskNo: 'INS-005',
    location: 'B-07-01',
    materialName: '动力电池组',
    category: '特殊库物资',
    riskAttr: '动力电池',
    status: '已完成',
    result: '温控正常，红外无异常，重力记录匹配',
    systemQuantity: 2,
    actualQuantity: 2,
    unit: '件',
  },
];

// ─── Agent Events (6 events) ───
export const agentEvents: AgentEvent[] = [
  {
    eventNo: 'AE-001',
    source: 'Station 收货',
    anomalyType: '型号不符',
    materialName: '发动机线束',
    detectLevel: 'L1',
    suggestedActions: ['创建工单', '提醒主管', '移入问题件区', '发起索赔'],
    status: '待人工确认',
    linkedIds: { workOrderId: 'WO-001', problemItemNo: 'IQ-001', claimNo: 'CL-001' },
    scenario: 'B',
  },
  {
    eventNo: 'AE-002',
    source: 'Station 出库',
    anomalyType: '型号不符',
    materialName: '雨刮电机',
    detectLevel: 'L1',
    suggestedActions: ['退回拣货'],
    status: '处理中',
    linkedIds: { workOrderId: 'WO-002' },
    scenario: 'C',
  },
  {
    eventNo: 'AE-003',
    source: 'PDA 巡检',
    anomalyType: '库存差异',
    materialName: '矿泉水',
    detectLevel: 'L2',
    suggestedActions: ['盘点复点', '提交异常上报'],
    status: '处理中',
    linkedIds: { workOrderId: 'WO-003', problemItemNo: 'IQ-003' },
    scenario: 'D',
  },
  {
    eventNo: 'AE-004',
    source: 'Station 收货',
    anomalyType: '标签缺失',
    materialName: '丁腈手套',
    detectLevel: 'L1',
    suggestedActions: ['暂缓签收', '合规记录', '创建工单'],
    status: '待人工确认',
    linkedIds: { workOrderId: 'WO-004' },
    scenario: 'E',
  },
  {
    eventNo: 'AE-005',
    source: 'Station 收货',
    anomalyType: '标准号OCR不清晰',
    materialName: '5W-40机油',
    detectLevel: 'L2',
    suggestedActions: ['建议人工复核'],
    status: '已提醒',
    linkedIds: {},
    scenario: 'G',
  },
  {
    eventNo: 'AE-006',
    source: 'Station 收货',
    anomalyType: '多模态异常（视觉+重力不符）',
    materialName: '动力电池组',
    detectLevel: 'L1',
    suggestedActions: ['立即隔离', '触发消防预警', '创建工单', '通知安全主管'],
    status: '待人工确认',
    linkedIds: { workOrderId: 'WO-005', problemItemNo: 'IQ-005', claimNo: 'CL-002' },
    scenario: 'H',
  },
];

// ─── Work Orders (5 orders) ───
export const workOrders: WorkOrder[] = [
  {
    workOrderId: 'WO-001',
    title: '发动机线束型号不符处理',
    eventNo: 'AE-001',
    anomalyType: '型号不符',
    materialName: '发动机线束',
    level: 'L1',
    status: '待处理',
    createdAt: '2024-03-15 09:23',
    assignedTo: '收货主管-张',
    description: '发动机线束实物型号与送货单不符，需隔离并发起索赔',
    images: [],
  },
  {
    workOrderId: 'WO-002',
    title: '雨刮电机出库异常处理',
    eventNo: 'AE-002',
    anomalyType: '型号不符',
    materialName: '雨刮电机',
    level: 'L1',
    status: '处理中',
    createdAt: '2024-03-16 14:05',
    assignedTo: '复核员-李',
    description: '出库复核发现型号不符，需退回拣货',
  },
  {
    workOrderId: 'WO-003',
    title: '矿泉水库存差异处理',
    eventNo: 'AE-003',
    anomalyType: '库存差异',
    materialName: '矿泉水',
    level: 'L2',
    status: '处理中',
    createdAt: '2024-03-16 10:18',
    assignedTo: '巡检员-王',
    description: '现场数量少于系统记录，需盘点复点',
  },
  {
    workOrderId: 'WO-004',
    title: '丁腈手套标签缺失处理',
    eventNo: 'AE-004',
    anomalyType: '标签缺失',
    materialName: '丁腈手套',
    level: 'L1',
    status: '待处理',
    createdAt: '2024-03-15 11:30',
    assignedTo: '收货主管-张',
    description: '外箱缺产品标识标签，需暂缓签收并补标',
  },
  {
    workOrderId: 'WO-005',
    title: '动力电池组多模态异常处理',
    eventNo: 'AE-006',
    anomalyType: '多模态异常',
    materialName: '动力电池组',
    level: 'L1',
    status: '待处理',
    createdAt: '2024-03-15 16:45',
    assignedTo: '安全主管-赵',
    description: '视觉件数2件，重力读数异常，红外温度超限，需立即隔离',
  },
];

// ─── Problem Items (3 items) ───
export const problemItems: ProblemItem[] = [
  {
    problemItemNo: 'IQ-001',
    materialName: '发动机线束',
    anomalyType: '型号不符',
    tempLocation: 'TMP-Q01',
    warehouseState: '已隔离',
    claimNo: 'CL-001',
    images: ['pkg-photo-1.jpg', 'pkg-photo-2.jpg', 'pkg-photo-3.jpg'],
    createdAt: '2024-03-15 09:30',
  },
  {
    problemItemNo: 'IQ-003',
    materialName: '矿泉水',
    anomalyType: '库存差异',
    tempLocation: 'TMP-Q02',
    warehouseState: '待索赔',
    images: [],
    createdAt: '2024-03-16 10:25',
  },
  {
    problemItemNo: 'IQ-005',
    materialName: '动力电池组',
    anomalyType: '多模态异常',
    tempLocation: 'TMP-Q03',
    warehouseState: '已隔离',
    claimNo: 'CL-002',
    images: ['pkg-photo-1.jpg'],
    createdAt: '2024-03-15 16:50',
  },
];

// ─── Claims (2 claims) ───
export const claims: Claim[] = [
  {
    claimNo: 'CL-001',
    title: '发动机线束型号不符索赔',
    materialName: '发动机线束',
    amount: 12500,
    status: '待处理',
    createdAt: '2024-03-15 09:35',
    supplier: '江南华盛',
    description: '型号不符导致产线停线风险，索赔损失',
    images: ['pkg-photo-1.jpg', 'pkg-photo-2.jpg'],
  },
  {
    claimNo: 'CL-002',
    title: '动力电池组多模态异常索赔',
    materialName: '动力电池组',
    amount: 86000,
    status: '处理中',
    createdAt: '2024-03-15 16:55',
    supplier: '北方能源',
    description: '多模态交叉验证失败，安全隐患索赔',
    images: ['pkg-photo-1.jpg'],
  },
];

// ─── Putaway Tasks (5 tasks) ───
export const putawayTasks: PutawayTask[] = [
  { taskNo: 'PUT-001', materialName: '前轮轴承', targetLocation: 'A-01-02', source: '合格项', status: '待执行' },
  { taskNo: 'PUT-003', materialName: '矿泉水', targetLocation: 'A-03-05', source: '合格项', status: '待执行' },
  { taskNo: 'PUT-004', materialName: '丁腈手套L', targetLocation: 'A-04-01', source: '标签问题解决后生成', status: '待执行' },
  { taskNo: 'PUT-005', materialName: '前保险杠', targetLocation: 'A-05-02', source: '合格项', status: '待执行' },
  { taskNo: 'PUT-006', materialName: '动力电池组', targetLocation: 'B-07-01（温控隔离区）', source: '合格项，进入温控监控', status: '待执行' },
  { taskNo: 'PUT-RT-001', materialName: '生产退料混合批', targetLocation: 'R-02-01 / A-01-02', source: 'RT-001 退料复检通过', status: '待执行' },
];

// ─── Return Inbound Orders ───
export const returnInboundOrders: ReturnInboundOrder[] = [
  {
    returnNo: 'RT-001',
    workshop: '冲压车间',
    reason: '生产结余',
    submitter: '王班长',
    createdAt: '2026-05-21 09:18',
    auditStatus: '待审核',
    stationStatus: '复检中',
    inboundStatus: '待入库',
    station: 'Station-03',
    riskLevel: '中',
    items: [
      {
        id: 'RTI-001',
        materialName: '前轮轴承',
        oldBarcode: 'BC-OLD-001',
        newBarcode: 'BC-NEW-001',
        expectedQty: 12,
        actualQty: 12,
        unit: '件',
        category: '关键零部件',
        targetLocation: 'A-01-02',
        labelStatus: '完整',
        ocrStatus: '通过',
        bindStatus: '已重绑',
      },
      {
        id: 'RTI-002',
        materialName: '发动机线束',
        oldBarcode: 'BC-OLD-002',
        newBarcode: 'BC-NEW-002',
        expectedQty: 6,
        actualQty: 6,
        unit: '件',
        category: '关键零部件',
        targetLocation: 'IQ-TMP-01',
        labelStatus: '轻微磨损',
        ocrStatus: '待复核',
        bindStatus: '已重绑',
      },
      {
        id: 'RTI-003',
        materialName: '雨刮电机',
        oldBarcode: 'BC-OLD-003',
        newBarcode: 'BC-NEW-003',
        expectedQty: 3,
        actualQty: 3,
        unit: '件',
        category: '标准件',
        targetLocation: 'R-02-01',
        labelStatus: '完整',
        ocrStatus: '通过',
        bindStatus: '待重绑',
      },
    ],
    checks: {
      barcode: '2/3 已重绑，1 件待扫码确认',
      label: '2 件完整，1 件轻微磨损',
      visualCount: '21/21 件一致',
      ocr: '8 个字段中 1 个待人工复核',
      storage: '关键件入 A 区，待复核件入临时位',
    },
    auditTimeline: [
      { role: '车间', action: '提交退料单', time: '09:18' },
      { role: 'Admin', action: '等待仓储主管审核', time: '09:22' },
      { role: 'Station', action: '已接收复检任务', time: '09:25' },
    ],
  },
  {
    returnNo: 'RT-002',
    workshop: '总装车间',
    reason: '工艺变更剩余',
    submitter: '李工',
    createdAt: '2026-05-21 10:06',
    auditStatus: '已通过',
    stationStatus: '复检通过',
    inboundStatus: '待入库',
    station: 'Station-02',
    riskLevel: '低',
    items: [
      {
        id: 'RTI-004',
        materialName: '丁腈手套',
        oldBarcode: 'BC-OLD-014',
        newBarcode: 'BC-NEW-014',
        expectedQty: 20,
        actualQty: 20,
        unit: '盒',
        category: '辅料',
        targetLocation: 'A-04-01',
        labelStatus: '完整',
        ocrStatus: '通过',
        bindStatus: '已重绑',
      },
    ],
    checks: {
      barcode: '全部已重绑',
      label: '标签完整',
      visualCount: '20/20 盒一致',
      ocr: '全字段通过',
      storage: '辅料区 A-04-01',
    },
    auditTimeline: [
      { role: '车间', action: '提交退料单', time: '10:06' },
      { role: 'Admin', action: '审核通过', time: '10:10' },
      { role: 'Station', action: '复检通过', time: '10:15' },
    ],
  },
];

// ─── Pick Tasks ───
export const pickTasks: PickTask[] = [
  { taskNo: 'PK-001', materialName: '前轮轴承', sourceLocation: 'B-01-03', quantity: 10, unit: '件', status: '待执行' },
  { taskNo: 'PK-002', materialName: '丁腈手套L', sourceLocation: 'B-02-01', quantity: 20, unit: '盒', status: '待执行' },
  { taskNo: 'PK-003', materialName: '雨刮电机', sourceLocation: 'B-03-02', quantity: 5, unit: '件', status: '待执行' },
];

// ─── Recount Tasks ───
export const recountTasks: RecountTask[] = [
  { taskNo: 'RC-001', location: 'A-03-05', materialName: '矿泉水', systemQuantity: 12, unit: '箱', lastCountDate: '2024-03-10', triggerSource: '巡检触发', status: '待执行' },
  { taskNo: 'RC-002', location: 'A-01-02', materialName: '前轮轴承', systemQuantity: 20, unit: '件', lastCountDate: '2024-03-08', triggerSource: '动碰', status: '已完成' },
];

// ─── Appointments ───
export const appointments: Appointment[] = [
  {
    appointmentNo: 'APT-001',
    deliveryOrderNo: 'PO-007',
    supplier: '江南华盛',
    expectedArrival: '2024-03-15 08:00',
    skuList: [
      { skuName: '前轮轴承', quantity: 20, unit: '件' },
      { skuName: '发动机线束', quantity: 4, unit: '件' },
      { skuName: '矿泉水', quantity: 12, unit: '箱' },
      { skuName: '一次性丁腈手套', quantity: 40, unit: '盒' },
      { skuName: '前保险杠', quantity: 8, unit: '件' },
      { skuName: '5W-40机油', quantity: 6, unit: '桶' },
      { skuName: '动力电池组', quantity: 2, unit: '件' },
    ],
    carrier: '顺丰物流',
    packagingMethod: '整托+散装',
    status: '已到货',
  },
];

// ─── Trace Records ───
export const traceRecords: TraceRecord[] = [
  {
    traceNo: 'FX-2026-0331-8842',
    barcode: 'FX-2026-0331-8842',
    materialName: '前保险杠',
    batchLot: 'L20260315A',
    status: '通过',
    sourceOrderNo: 'PO-007',
    timeline: [
      { stage: '收货', time: '2024-03-15 09:00' },
      { stage: '上架', time: '2024-03-15 11:00' },
      { stage: '出库复核', time: '2024-03-18 14:00' },
      { stage: '打包', time: '2024-03-18 15:00' },
    ],
    expiryDate: '2028-03-15',
    isNewCode: true,
  },
];

// ─── Suppliers ───
export const suppliers: Supplier[] = [
  {
    supplierCode: 'SUP-001',
    supplierName: '江南华盛',
    contact: '王经理',
    phone: '138-0013-0001',
    totalDeliveries: 156,
    anomalyCount: 8,
    anomalyIn7Days: 3,
    recentAnomalies: ['型号不符-发动机线束', '型号不符-雨刮电机', '标签缺失-丁腈手套'],
    riskLevel: '高风险',
  },
  {
    supplierCode: 'SUP-002',
    supplierName: '北方能源',
    contact: '李总',
    phone: '139-0023-0002',
    totalDeliveries: 42,
    anomalyCount: 2,
    anomalyIn7Days: 1,
    recentAnomalies: ['多模态异常-动力电池组'],
    riskLevel: '中风险',
  },
  {
    supplierCode: 'SUP-003',
    supplierName: '精工汽配',
    contact: '陈经理',
    phone: '137-0033-0003',
    totalDeliveries: 230,
    anomalyCount: 3,
    anomalyIn7Days: 0,
    recentAnomalies: ['外观缺陷-前轮轴承', '数量偏差-矿泉水'],
    riskLevel: '低风险',
  },
  {
    supplierCode: 'SUP-004',
    supplierName: '环球物流',
    contact: '赵主管',
    phone: '136-0043-0004',
    totalDeliveries: 89,
    anomalyCount: 1,
    anomalyIn7Days: 0,
    recentAnomalies: ['包装破损-纸箱'],
    riskLevel: '低风险',
  },
];

// ─── Scenario Texts (8 scenarios A-H) ───
export const scenarioTexts: ScenarioText[] = [
  {
    scenario: 'A',
    conclusion: '型号、条码、批次一致',
    suggestedAction: '建议签收',
    responsibleRole: '收货员',
  },
  {
    scenario: 'B',
    conclusion: '实物型号与送货单不符',
    suggestedAction: '创建工单 + 移问题件 + 发起索赔',
    responsibleRole: '收货主管',
    level: 'L1',
    eventNo: 'AE-001',
  },
  {
    scenario: 'C',
    conclusion: '出库复核发现型号不符',
    suggestedAction: '退回拣货',
    responsibleRole: '复核员',
    level: 'L1',
    eventNo: 'AE-002',
  },
  {
    scenario: 'D',
    conclusion: '现场数量少于系统记录',
    suggestedAction: '盘点复点 + 异常上报',
    responsibleRole: '巡检员',
    level: 'L2',
    eventNo: 'AE-003',
  },
  {
    scenario: 'E',
    conclusion: '外箱缺产品执行标准标识',
    suggestedAction: '暂缓签收 + 创建工单',
    responsibleRole: '收货主管',
    level: 'L1',
    eventNo: 'AE-004',
  },
  {
    scenario: 'F',
    conclusion: '全检8件全部合格',
    suggestedAction: '建议签收',
    responsibleRole: '收货员',
  },
  {
    scenario: 'G',
    conclusion: 'OCR识别率61%',
    suggestedAction: '建议人工复核',
    responsibleRole: '质检员',
    level: 'L2',
    eventNo: 'AE-005',
  },
  {
    scenario: 'H',
    conclusion: '视觉件数2件，重力读数异常，红外温度超限',
    suggestedAction: '立即隔离 + 消防预警 + 通知安全主管',
    responsibleRole: '安全主管',
    level: 'L1',
    eventNo: 'AE-006',
  },
];

// =============================================================================
// AGENT RULES (13 If-Then rules from Chapter 8)
// =============================================================================
export interface AgentRule {
  id: number;
  condition: string;
  actions: AgentAction[];
  level?: DetectLevel;
}

export const agentRules: AgentRule[] = [
  { id: 1, condition: '关键零部件异常', actions: ['创建工单', '提醒主管', '移入问题件区', '发起索赔'], level: 'L1' },
  { id: 2, condition: '标准包装物资数量异常', actions: ['建议暂缓'] },
  { id: 3, condition: '标签缺失/破损/遮挡', actions: ['创建工单', '合规记录', '建议暂缓'] },
  { id: 4, condition: '贴标位置不合规', actions: ['建议人工复核', '合规记录'] },
  { id: 5, condition: '包装外观异常', actions: ['建议人工复核'] },
  { id: 6, condition: '关键字段OCR不清晰或缺失', actions: ['建议人工复核'], level: 'L2' },
  { id: 7, condition: '外观缺陷（NG件）', actions: ['创建工单'] },
  { id: 8, condition: '条码无效/重复/无法识别', actions: ['创建工单', '建议人工复核'] },
  { id: 9, condition: '批次时效异常（过期/错批）', actions: ['移入问题件区', '创建工单'] },
  { id: 10, condition: '同一供应商连续异常≥3次/7日', actions: ['提醒主管'] },
  { id: 11, condition: '条码识别失败但OCR抽检一致且计数正确', actions: ['建议人工复核'], level: 'L2' },
  { id: 12, condition: '多模态异常（动力电池/油液）', actions: ['立即隔离', '触发消防预警', '通知安全主管', '创建工单', '发起索赔'], level: 'L1' },
  { id: 13, condition: '视频违规检测', actions: ['创建工单'] },
];

// =============================================================================
// DASHBOARD DATA
// =============================================================================
export interface DashboardData {
  todayInterceptCount: number;
  todayInterceptValue: number;
  aiAccuracy: number;
  onlineStations: number;
  onlinePDAs: number;
  pendingExceptions: number;
  l1Intercepting: number;
  aiVsHuman: {
    metric: string;
    manual: string;
    aiAssist: string;
    change: string;
  }[];
}

export const dashboardData: DashboardData = {
  todayInterceptCount: 1247,
  todayInterceptValue: 386000,
  aiAccuracy: 99.7,
  onlineStations: 4,
  onlinePDAs: 12,
  pendingExceptions: 3,
  l1Intercepting: 0,
  aiVsHuman: [
    { metric: '平均耗时/件', manual: '45秒', aiAssist: '12秒', change: '-73%' },
    { metric: '拦截率', manual: '82%', aiAssist: '113%（+31%）', change: '+31个百分点' },
    { metric: '错误率', manual: '万分之一（按单）', aiAssist: '百万分之一（按单）', change: '-90%' },
    { metric: '本月拦截起数', manual: '—', aiAssist: '20起', change: '—' },
    { metric: '预估挽回成本', manual: '—', aiAssist: '¥23.6万', change: '—' },
  ],
};

// =============================================================================
// COLLECTION OF ALL DATA
// =============================================================================
export const allDeliveryOrders: DeliveryOrder[] = [deliveryOrderPO007];
export const allOutboundOrders: OutboundOrder[] = [outboundOrderSO031];

// Helper functions
export function getDeliveryOrder(orderNo: string): DeliveryOrder | undefined {
  return allDeliveryOrders.find(o => o.orderNo === orderNo);
}

export function getAgentEvent(eventNo: string): AgentEvent | undefined {
  return agentEvents.find(e => e.eventNo === eventNo);
}

export function getWorkOrder(workOrderId: string): WorkOrder | undefined {
  return workOrders.find(w => w.workOrderId === workOrderId);
}

export function getProblemItem(problemItemNo: string): ProblemItem | undefined {
  return problemItems.find(p => p.problemItemNo === problemItemNo);
}

export function getClaim(claimNo: string): Claim | undefined {
  return claims.find(c => c.claimNo === claimNo);
}

export function getSupplier(supplierCode: string): Supplier | undefined {
  return suppliers.find(s => s.supplierCode === supplierCode);
}

export function getScenarioText(scenario: string): ScenarioText | undefined {
  return scenarioTexts.find(s => s.scenario === scenario);
}

export function getEventsBySupplier(supplierName: string): AgentEvent[] {
  return agentEvents.filter(e => {
    const order = allDeliveryOrders.find(o => o.supplier === supplierName);
    return order?.items.some(i => i.agentEventNo === e.eventNo);
  });
}

export function getItemsByStatus(order: DeliveryOrder, status: DeliveryItem['status']): DeliveryItem[] {
  return order.items.filter(i => i.status === status);
}
