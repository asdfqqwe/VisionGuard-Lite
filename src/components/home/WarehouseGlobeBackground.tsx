import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color } from 'three';

/**
 * 3D 地球 + 飞线背景。基于 react-globe.gl。
 *
 * 视觉特征(对齐参考图):
 *  - 浅色调:白色半透明陆地 + 极浅蓝灰球面
 *  - 经纬网格(graticules)
 *  - 蓝色大气层光晕
 *  - 飞线低弧度贴球面 + dash 流动
 *  - 节点带涟漪辐射
 *
 * 业务语义: 供应商 → 上海主仓 → 工厂/出库/隔离/索赔
 */

// ─── 业务节点(真实经纬度) ───
const HUB = { lat: 31.23, lng: 121.47, name: '智见主仓' };

const SUPPLIERS = [
  { lat: 23.13, lng: 113.26, name: '华南供应商' },
  { lat: 39.9, lng: 116.41, name: '华北供应商' },
  { lat: 30.67, lng: 104.06, name: '西南供应商' },
  { lat: 35.69, lng: 139.69, name: '日本供应商' },
  { lat: 1.35, lng: 103.82, name: '东南亚供应商' },
];

const DOWNSTREAMS_NORMAL = [
  { lat: 30.59, lng: 114.31, name: '总装工厂' },
  { lat: 30.29, lng: 120.16, name: '出库放行' },
];

const DOWNSTREAMS_GOLD = [
  { lat: 32.06, lng: 118.78, name: '问题件隔离' },
  { lat: 39.13, lng: 117.2, name: '索赔协同' },
];

const COLOR_BLUE = '#3B82F6';
const COLOR_GOLD = '#EAB308';

interface WarehouseGlobeBackgroundProps {
  width?: number;
  height?: number;
}

interface CountryFeature {
  type: string;
  properties: { name?: string; [k: string]: unknown };
  geometry: { type: string; coordinates: unknown };
}

export function WarehouseGlobeBackground({
  width = 520,
  height = 520,
}: WarehouseGlobeBackgroundProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState<CountryFeature[]>([]);

  // 加载世界 GeoJSON(国家边界)
  useEffect(() => {
    fetch('/geo/world.json')
      .then((res) => res.json())
      .then((data) => setCountries(data.features ?? []))
      .catch((err) => console.warn('[WarehouseGlobe] load world.json failed', err));
  }, []);

  // 球面材质:冷灰蓝紫调海洋(参考图,接近 #C8D2E2)
  const globeMaterial = useMemo(() => {
    const m = new MeshPhongMaterial();
    m.color = new Color('#C8D2E2');
    m.emissive = new Color('#D6DEEC');
    m.emissiveIntensity = 0.18;
    m.shininess = 0.4;
    m.transparent = true;
    m.opacity = 1;
    return m;
  }, []);

  // 飞线
  const arcs = useMemo(() => {
    const blue = [
      ...SUPPLIERS.map((s) => ({
        startLat: s.lat,
        startLng: s.lng,
        endLat: HUB.lat,
        endLng: HUB.lng,
        color: COLOR_BLUE,
      })),
      ...DOWNSTREAMS_NORMAL.map((d) => ({
        startLat: HUB.lat,
        startLng: HUB.lng,
        endLat: d.lat,
        endLng: d.lng,
        color: COLOR_BLUE,
      })),
    ];
    const gold = DOWNSTREAMS_GOLD.map((d) => ({
      startLat: HUB.lat,
      startLng: HUB.lng,
      endLat: d.lat,
      endLng: d.lng,
      color: COLOR_GOLD,
    }));
    return [...blue, ...gold];
  }, []);

  // 节点辐射涟漪(参考图:中等强度,蓝色明显)
  const rings = useMemo(
    () => [
      { lat: HUB.lat, lng: HUB.lng, color: COLOR_GOLD, maxR: 4.5, period: 1600 },
      ...SUPPLIERS.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        color: COLOR_BLUE,
        maxR: 3.2,
        period: 2000,
      })),
      ...DOWNSTREAMS_NORMAL.map((d) => ({
        lat: d.lat,
        lng: d.lng,
        color: COLOR_BLUE,
        maxR: 3.2,
        period: 2000,
      })),
      ...DOWNSTREAMS_GOLD.map((d) => ({
        lat: d.lat,
        lng: d.lng,
        color: COLOR_GOLD,
        maxR: 3.6,
        period: 1800,
      })),
    ],
    []
  );

  // 节点亮点 — 比之前更大更醒目
  const points = useMemo(
    () => [
      { lat: HUB.lat, lng: HUB.lng, color: COLOR_GOLD, radius: 0.55 },
      ...SUPPLIERS.map((s) => ({ ...s, color: COLOR_BLUE, radius: 0.4 })),
      ...DOWNSTREAMS_NORMAL.map((d) => ({ ...d, color: COLOR_BLUE, radius: 0.4 })),
      ...DOWNSTREAMS_GOLD.map((d) => ({ ...d, color: COLOR_GOLD, radius: 0.45 })),
    ],
    []
  );

  // controls 设置
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = reduceMotion ? 0.25 : 0.55;
    controls.enableZoom = false;
    controls.enablePan = false;
    g.pointOfView({ lat: 22, lng: 110, altitude: 2.2 }, 0);
  }, [countries]);

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      // 球体
      showGlobe={true}
      globeMaterial={globeMaterial}
      // 经纬网格
      showGraticules={true}
      // 大气层
      showAtmosphere={true}
      atmosphereColor="#7AAEEC"
      atmosphereAltitude={0.22}
      // 国家边界 — 冷灰蓝紫陆地(参考图调,#9AA8C4 量级,带厚度)
      polygonsData={countries}
      polygonGeoJsonGeometry={(d: object) => (d as CountryFeature).geometry as never}
      polygonAltitude={0.03}
      polygonCapColor={() => 'rgba(154,168,196,0.95)'}
      polygonSideColor={() => 'rgba(108,124,158,0.55)'}
      polygonStrokeColor={() => 'rgba(125,143,180,0.45)'}
      // 飞线 — 弧度更明显,加粗,描边亮色
      arcsData={arcs}
      arcColor={(d: object) => (d as { color: string }).color}
      arcAltitude={0.28}
      arcStroke={0.6}
      arcDashLength={0.35}
      arcDashGap={1.2}
      arcDashAnimateTime={1800}
      arcAltitudeAutoScale={0.5}
      // 节点亮点 — 加大尺寸更醒目
      pointsData={points}
      pointColor={(d: object) => (d as { color: string }).color}
      pointAltitude={0.014}
      pointRadius={(d: object) => (d as { radius: number }).radius}
      pointResolution={10}
      // 节点辐射涟漪
      ringsData={rings}
      ringColor={(d: object) => () => (d as { color: string }).color}
      ringMaxRadius={(d: object) => (d as { maxR: number }).maxR}
      ringPropagationSpeed={2.5}
      ringRepeatPeriod={(d: object) => (d as { period: number }).period}
    />
  );
}

export default WarehouseGlobeBackground;
