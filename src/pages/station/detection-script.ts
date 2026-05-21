/**
 * 流式 AI 检测演示剧本数据
 *
 * 5 件物品 × 5 步推理过程，固定结局映射，便于反复演示与录屏。
 * 每件包含相机图、检测框（含 % 坐标 + OCR 芯片 + 出现阶段）、Agent 话术、综合判定数据。
 */

import { purchaseReceiveGuide } from '@/data/purchaseReceiveGuide';

export type Outcome = 'pass' | 'l2' | 'l1';

export interface OcrChip {
  label: string;
  value: string;
}

export interface DetectionBox {
  id: string;
  /** 百分比坐标，自适应相机面板尺寸 */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** 0-100，未知则不展示 */
  confidence?: number;
  type: 'pass' | 'warning' | 'danger';
  /** 浮在框右上角的 OCR 芯片，可选 */
  ocr?: OcrChip[];
  /** 该框在第几个推理步骤出现，1=视觉点数, 2=标签 OCR, 3=字段 OCR */
  appearAtStep: 1 | 2 | 3;
}

export interface SummaryLine {
  label: string;
  value: string;
}

export interface ScriptedItem {
  orderNo: string;
  materialName: string;
  qty: string;
  category: '关键件' | '标准件' | '特殊库';
  thumbUrl: string;
  cameraImageUrl: string;
  outcome: Outcome;
  /** 5 步推理过程展示文案，按顺序 */
  stepLines: [string, string, string, string, string];
  /** 每一步完成后追加的小数据芯片（与 stepLines 一一对应；可空数组） */
  stepChips: [OcrChip[], OcrChip[], OcrChip[], OcrChip[], OcrChip[]];
  /** 视觉/标签/字段阶段的检测框 */
  boxes: DetectionBox[];
  /** 综合判定卡数据 */
  summary: {
    title: string;
    confidence: string;
    latency: string;
    model: string;
    lines: SummaryLine[];
  };
  /** Agent 处置建议正文 */
  agentSuggestion: string;
  /** 关联编号（仅 L2 / L1 异常态展示） */
  badges?: {
    ae?: string;
    wo?: string;
    iq?: string;
    cl?: string;
  };
}

/** 7 个流水线 chip 的索引（与 StationIdle 中的 aiCapabilities 顺序一致） */
export const PIPELINE_INDEX = {
  visualCount: 0,
  labelCompliance: 1,
  modelOcr: 2,
  fieldOcr: 3,
  multiModal: 4,
  defect: 5,
  videoViolation: 6,
} as const;

/** 单步骤时间表（毫秒），所有物品共用 */
export const STEP_TIMELINE_MS = {
  start: 0,
  step0_receiveImage: 400,
  step1_visualCount: 1200,
  step2_labelOcr: 2000,
  step3_fieldOcr: 2600,
  step4_finalJudgment: 3400,
  /** L1 触发全屏告警的时刻 */
  l1AlertAt: 3500,
} as const;

// ─── 5 件物品剧本 ───

export const detectionScript: ScriptedItem[] = [
  // ① 采购到货整托纸箱 — 通过 ---------------------------------------------
  {
    orderNo: `${purchaseReceiveGuide.purchaseOrderNo} / 托码`,
    materialName: `整托纸箱 / ${purchaseReceiveGuide.scanMaterialName}`,
    qty: '6 箱 · 50 EA/箱',
    category: '标准件',
    thumbUrl: '/images/purchase-receive-station-overhead.png',
    cameraImageUrl: '/images/purchase-receive-station-overhead.png',
    outcome: 'pass',
    stepLines: [
      '接收图像数据流，分辨率 1920×1080 · 帧 ID #2026-052201',
      '执行视觉点数：识别到 6 个纸箱，箱规 50 EA/箱，计算整托零件总数 300 EA',
      `箱标检测：托码 ${purchaseReceiveGuide.palletCode} 与箱码 ${purchaseReceiveGuide.cartonCode} 已采集，贴标无破损、遮挡、倒置、错贴`,
      `关键字段 OCR 抽检：供应商编码 ${purchaseReceiveGuide.supplierCode}、批次 ${purchaseReceiveGuide.batchNo}、生产日期 ${purchaseReceiveGuide.productionDate}、料号 ${purchaseReceiveGuide.ocrPartNo} 均已读取`,
      '综合判定：箱数、箱标、箱规、字段与条码采集均通过',
    ],
    stepChips: [
      [{ label: '帧', value: '#052201' }],
      [
        { label: '箱数', value: '6/6' },
        { label: '总数', value: '300 EA' },
      ],
      [
        { label: '托码', value: '已采集' },
        { label: '箱码', value: 'CTN-007-001 起' },
      ],
      [
        { label: '供应商', value: purchaseReceiveGuide.supplierCode },
        { label: '料号', value: purchaseReceiveGuide.ocrPartNo },
        { label: '日期', value: purchaseReceiveGuide.productionDate },
      ],
      [{ label: '总耗时', value: '1.1s' }],
    ],
    boxes: [
      {
        id: 'carton-1',
        x: 33,
        y: 18,
        w: 12,
        h: 16,
        label: '纸箱 #1',
        confidence: 99.1,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-2',
        x: 46,
        y: 18,
        w: 12,
        h: 16,
        label: '纸箱 #2',
        confidence: 98.6,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-3',
        x: 33,
        y: 35,
        w: 12,
        h: 16,
        label: '纸箱 #3',
        confidence: 98.4,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-4',
        x: 46,
        y: 35,
        w: 12,
        h: 16,
        label: '纸箱 #4',
        confidence: 99.4,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-5',
        x: 33,
        y: 52,
        w: 12,
        h: 16,
        label: '纸箱 #5',
        confidence: 97.8,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-6',
        x: 46,
        y: 52,
        w: 12,
        h: 16,
        label: '纸箱 #6',
        confidence: 98.1,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'carton-label-top',
        x: 39,
        y: 25,
        w: 4.8,
        h: 5,
        label: '托码 PLT',
        confidence: 99.2,
        type: 'pass',
        ocr: [
          { label: '托码', value: 'PLT-20260315-007' },
          { label: '状态', value: '无倒置' },
        ],
        appearAtStep: 2,
      },
      {
        id: 'carton-label-mid',
        x: 52,
        y: 43,
        w: 4.8,
        h: 5,
        label: '箱标 #3',
        confidence: 98.9,
        type: 'pass',
        ocr: [
          { label: '箱码', value: purchaseReceiveGuide.cartonCode },
          { label: '数量', value: purchaseReceiveGuide.scanQty },
        ],
        appearAtStep: 3,
      },
    ],
    summary: {
      title: '检测通过',
      confidence: '98.4%',
      latency: '1.1s',
      model: 'Quality-v3.2',
      lines: [
        { label: '视觉点数', value: '6 / 6 箱' },
        { label: '箱规计算', value: '50 EA/箱 × 6 = 300 EA' },
        { label: '托码/箱码', value: '1 托 + 6 箱已采集' },
        { label: '关键字段', value: '供应商 / 批次 / 日期 / 料号已读取' },
        { label: '综合等级', value: '通过' },
      ],
    },
    agentSuggestion:
      '未发现异常，托码、箱码、箱规计算与 OCR 字段已记录。整托纸箱可继续进入后续上架任务。',
  },

  // ② 前保险杠 — L2 标签破损遮挡 ------------------------------------------
  {
    orderNo: `${purchaseReceiveGuide.purchaseOrderNo} / ${purchaseReceiveGuide.damagedCartonNo}`,
    materialName: purchaseReceiveGuide.damagedMaterialName,
    qty: `${purchaseReceiveGuide.damagedQty} 件`,
    category: '关键件',
    thumbUrl: '/images/purchase-receive-damaged-label.png',
    cameraImageUrl: '/images/purchase-receive-damaged-label.png',
    outcome: 'l2',
    stepLines: [
      '接收图像数据流，分辨率 1920×1080 · 帧 ID #2026-052202',
      '执行外观检测：识别到 1 个前保险杠外箱，箱体边角受压但主体完整',
      '标签 OCR 检测：标签右上角翘起，覆膜遮挡条码区，部分字段可读',
      `关键字段 OCR 抽检：料号 ${purchaseReceiveGuide.damagedPartNo}、数量 ${purchaseReceiveGuide.damagedQty}、采购单 ${purchaseReceiveGuide.purchaseOrderNo} 可读，条码区域置信度 78.4%`,
      '综合判定：标签完整性不满足入库要求，触发 L2 警示并转 PDA 人工复核',
    ],
    stepChips: [
      [{ label: '帧', value: '#052202' }],
      [{ label: '件数', value: '1/1' }],
      [
        { label: '标签', value: '破损' },
        { label: '遮挡', value: '覆膜' },
        { label: '倒置/错贴', value: '未发现' },
      ],
      [
        { label: '采购单', value: purchaseReceiveGuide.purchaseOrderNo },
        { label: '料号', value: purchaseReceiveGuide.damagedPartNo },
        { label: '箱序', value: purchaseReceiveGuide.damagedCartonNo },
      ],
      [
        { label: 'L2 警示', value: '标签破损' },
        { label: '总耗时', value: '1.3s' },
      ],
    ],
    boxes: [
      {
        id: 'bumper-carton',
        x: 5,
        y: 6,
        w: 88,
        h: 88,
        label: '外箱',
        confidence: 97.2,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'bumper-label-main',
        x: 25,
        y: 14,
        w: 55,
        h: 76,
        label: '箱标 · 覆膜遮挡',
        confidence: 78.4,
        type: 'warning',
        ocr: [
          { label: '料号', value: purchaseReceiveGuide.damagedPartNo },
          { label: '数量', value: purchaseReceiveGuide.damagedQty },
        ],
        appearAtStep: 2,
      },
      {
        id: 'bumper-label-curl',
        x: 63,
        y: 14,
        w: 18,
        h: 24,
        label: '标签翘起',
        confidence: 88.1,
        type: 'warning',
        appearAtStep: 2,
      },
      {
        id: 'bumper-barcode',
        x: 30,
        y: 55,
        w: 48,
        h: 13,
        label: '条码区 · 遮挡',
        confidence: 78.4,
        type: 'warning',
        ocr: [{ label: '置信度', value: '78.4%' }],
        appearAtStep: 3,
      },
      {
        id: 'bumper-po',
        x: 28,
        y: 70,
        w: 22,
        h: 6,
        label: '采购单字段',
        confidence: 94.6,
        type: 'pass',
        ocr: [{ label: 'PO', value: purchaseReceiveGuide.purchaseOrderNo }],
        appearAtStep: 3,
      },
    ],
    summary: {
      title: 'L2 警示 · 标签破损遮挡',
      confidence: '78.4%',
      latency: '1.3s',
      model: 'OCR-v2.1',
      lines: [
        { label: '视觉件数', value: '1 / 1' },
        { label: '问题标签', value: '破损 / 覆膜遮挡' },
        { label: '采购单', value: purchaseReceiveGuide.purchaseOrderNo },
        { label: '箱序', value: purchaseReceiveGuide.damagedCartonNo },
        { label: '倒置/错贴', value: '未发现' },
        { label: '综合等级', value: 'L2 警示' },
      ],
    },
    agentSuggestion:
      '标签破损且覆膜遮挡条码区，料号、数量和采购单仍可读。建议转 PDA 人工复核，复拍整改照片后再决定入库或隔离。',
    badges: { ae: 'AE-78910', wo: 'WO-78910', iq: 'IQ-78910' },
  },

  // ③ 5W-40 机油 — L2 OCR 模糊 -------------------------------------------
  {
    orderNo: 'PO-007 / 行6',
    materialName: '5W-40 机油',
    qty: '6 桶',
    category: '标准件',
    thumbUrl: '/images/inspect-oil-line-overhead.png',
    cameraImageUrl: '/images/inspect-oil-line-overhead.png',
    outcome: 'l2',
    stepLines: [
      '接收图像数据流，分辨率 1920×1080 · 帧 ID #2024-031603',
      '执行视觉件数与外观缺陷检测：识别到 6 桶机油，桶身完整；重力台估算 24.2kg / 4.03kg ≈ 6 桶',
      '标签 OCR 检测：标签贴标合规，整体可读',
      '关键字段 OCR 抽检：标准号识别置信度 61.3%，低于阈值',
      '综合判定：多模态与视频违规检测正常，字段 OCR 触发 L2 警示',
    ],
    stepChips: [
      [{ label: '帧', value: '#031603' }],
      [
        { label: '件数', value: '6/6' },
        { label: '重量估算', value: '6 桶' },
      ],
      [{ label: '标签', value: '完整' }],
      [
        { label: '标准号', value: 'API SN ?L?' },
        { label: '奇瑞料号', value: 'CHERY-OIL-540' },
        { label: '置信度', value: '61.3%' },
      ],
      [
        { label: 'L2 警示', value: 'OCR 模糊' },
        { label: '总耗时', value: '1.2s' },
      ],
    ],
    boxes: [
      {
        id: 'oil-drums',
        x: 21,
        y: 9,
        w: 58,
        h: 83,
        label: '机油桶 × 6',
        confidence: 97.4,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'oil-label',
        x: 64.5,
        y: 63,
        w: 16,
        h: 19,
        label: '标准号区域',
        confidence: 61.3,
        type: 'warning',
        ocr: [
          { label: '识别', value: 'API SN ?L?' },
          { label: '阈值', value: '< 80%' },
        ],
        appearAtStep: 2,
      },
      {
        id: 'oil-spec',
        x: 29,
        y: 32,
        w: 16,
        h: 12,
        label: '规格字段',
        confidence: 78.4,
        type: 'warning',
        ocr: [{ label: '规格', value: '5W-40 · 4L?' }],
        appearAtStep: 3,
      },
    ],
    summary: {
      title: 'L2 警示 · OCR 模糊',
      confidence: '61.3%',
      latency: '1.2s',
      model: 'OCR-v2.1',
      lines: [
        { label: '视觉件数', value: '6 / 6' },
        { label: '重量估算', value: '24.2 kg ÷ 4.03 kg = 6 桶' },
        { label: '标准号 OCR', value: '61.3% (低于阈值)' },
        { label: '规格 OCR', value: '78.4% (待复核)' },
        { label: '综合等级', value: 'L2 警示' },
      ],
    },
    agentSuggestion:
      'OCR 识别置信度不足（61.3% < 80%），可能因桶身反光或标签角度。建议：1）调整光照后重拍；2）切换桌面检测台高分辨率扫描；3）人工核对标准号与采购单。',
    badges: { ae: 'AE-005' },
  },

  // ④ 散装卡扣 — 通过 -----------------------------------------------------
  {
    orderNo: 'PO-010 / 行2',
    materialName: '散装卡扣',
    qty: '120 枚',
    category: '标准件',
    thumbUrl: '/images/inspect-shelf.jpg',
    cameraImageUrl: '/images/inspect-shelf.jpg',
    outcome: 'pass',
    stepLines: [
      '接收图像数据流，分辨率 1920×1080 · 帧 ID #2024-031605',
      '执行散装小件视觉点数：4 个分区分别识别 30、30、31、29 枚，合计 120 枚',
      '周转箱标签检测：箱标完整，未发现遮挡、倒置、错贴',
      '关键字段 OCR 抽检：供应商、批次、生产日期、数量字段均与单据一致',
      '综合判定：散装小件计数、标签、OCR 与条码采集均通过',
    ],
    stepChips: [
      [{ label: '帧', value: '#031605' }],
      [
        { label: '分区', value: '4 区' },
        { label: '合计', value: '120 枚' },
      ],
      [
        { label: '箱标', value: '完整' },
        { label: '错贴', value: '0' },
      ],
      [
        { label: '供应商', value: 'SUP-003' },
        { label: '批次', value: 'B20260521C' },
        { label: '数量', value: '120' },
      ],
      [{ label: '总耗时', value: '1.4s' }],
    ],
    boxes: [
      {
        id: 'clip-zone-a',
        x: 18,
        y: 20,
        w: 28,
        h: 24,
        label: 'A 区 30',
        confidence: 96.8,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'clip-zone-b',
        x: 49,
        y: 20,
        w: 28,
        h: 24,
        label: 'B 区 30',
        confidence: 96.4,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'clip-zone-c',
        x: 18,
        y: 48,
        w: 28,
        h: 24,
        label: 'C 区 31',
        confidence: 95.9,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'clip-zone-d',
        x: 49,
        y: 48,
        w: 28,
        h: 24,
        label: 'D 区 29',
        confidence: 95.6,
        type: 'pass',
        appearAtStep: 1,
      },
      {
        id: 'clip-box-label',
        x: 63,
        y: 28,
        w: 15,
        h: 12,
        label: '周转箱标签',
        confidence: 98.7,
        type: 'pass',
        ocr: [
          { label: '批次', value: 'B20260521C' },
          { label: '箱码', value: 'BIN-010-02' },
        ],
        appearAtStep: 2,
      },
      {
        id: 'clip-qty-field',
        x: 64,
        y: 45,
        w: 12,
        h: 9,
        label: '数量字段',
        confidence: 97.1,
        type: 'pass',
        ocr: [{ label: '数量', value: '120 枚' }],
        appearAtStep: 3,
      },
    ],
    summary: {
      title: '检测通过',
      confidence: '96.4%',
      latency: '1.4s',
      model: 'SmallPart-v1.2',
      lines: [
        { label: '散装计数', value: '30 + 30 + 31 + 29 = 120 枚' },
        { label: '标签检测', value: '完整，无遮挡/倒置/错贴' },
        { label: '条码采集', value: '周转箱码已采集' },
        { label: '关键字段', value: '供应商 / 批次 / 日期 / 数量匹配' },
        { label: '综合等级', value: '通过' },
      ],
    },
    agentSuggestion:
      '散装小件计数已通过。系统按分区计数降低遮挡影响，箱码和关键字段已归档，可移交上架。',
  },

  // ⑤ 动力电池组 — L1 多模态拦截 ------------------------------------------
  {
    orderNo: 'PO-007 / 行7',
    materialName: '动力电池组',
    qty: '2 件',
    category: '特殊库',
    thumbUrl: '/images/inspect-battery-line-overhead.png',
    cameraImageUrl: '/images/inspect-battery-line-overhead.png',
    outcome: 'l1',
    stepLines: [
      '接收图像数据流，分辨率 1920×1080 · 帧 ID #2024-031604',
      '执行视觉件数与外观缺陷检测：识别到 2 件电池模组，外观存在变色异常',
      '标签 OCR 检测：高压警示标签合规',
      '多模态交叉验证：重力台 +0.3kg / 红外 +12°C / VOC 超标',
      '综合判定：视频违规检测正常，多模态模块触发 L1 强拦截',
    ],
    stepChips: [
      [{ label: '帧', value: '#031604' }],
      [
        { label: '件数', value: '2/2' },
        { label: '外观', value: '变色异常' },
      ],
      [{ label: '高压标签', value: '合规' }],
      [
        { label: '重力差', value: '+0.3kg' },
        { label: '红外', value: '+12°C' },
        { label: 'VOC', value: '超标' },
      ],
      [
        { label: 'L1 拦截', value: '已触发' },
        { label: '消防联动', value: '已启动' },
      ],
    ],
    boxes: [
      {
        id: 'battery-1',
        x: 25.5,
        y: 14,
        w: 22,
        h: 66,
        label: '电池模组 #1',
        confidence: 96.8,
        type: 'danger',
        ocr: [{ label: '外观', value: '局部变色' }],
        appearAtStep: 1,
      },
      {
        id: 'battery-2',
        x: 52,
        y: 14,
        w: 22,
        h: 66,
        label: '电池模组 #2',
        confidence: 95.4,
        type: 'danger',
        ocr: [{ label: '外观', value: '轻微变色' }],
        appearAtStep: 1,
      },
      {
        id: 'battery-label',
        x: 36,
        y: 38,
        w: 6.5,
        h: 11,
        label: '高压警示标签',
        confidence: 99.2,
        type: 'pass',
        appearAtStep: 2,
      },
      {
        id: 'battery-thermal',
        x: 55,
        y: 58,
        w: 12,
        h: 16,
        label: '红外异常区',
        confidence: 92.1,
        type: 'danger',
        ocr: [
          { label: '温度', value: '+12°C' },
          { label: 'VOC', value: '超标' },
        ],
        appearAtStep: 3,
      },
    ],
    summary: {
      title: 'L1 强拦截 · 多模态异常',
      confidence: '92.1%',
      latency: '1.5s',
      model: 'MultiModal-v1.4',
      lines: [
        { label: '视觉异常', value: '2/2 件变色' },
        { label: '重力差', value: '+0.3 kg' },
        { label: '红外温度', value: '+12 °C' },
        { label: 'VOC 浓度', value: '超标' },
        { label: '综合等级', value: 'L1 强拦截' },
      ],
    },
    agentSuggestion:
      '多模态交叉验证全部触发：视觉变色 + 重力异常 + 红外超温 + VOC 超标。已自动联动消防系统并通知安全主管。请立即：1）疏散周边人员；2）启动应急预案；3）等待安全部门到场。切勿擅自处理。',
    badges: { ae: 'AE-006', wo: 'WO-005', iq: 'IQ-005', cl: 'CL-002' },
  },
];
