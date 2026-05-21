import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import { CanvasTexture, Color, MeshPhongMaterial, RepeatWrapping } from 'three';

/**
 * 3D 地球 + 飞线背景。基于 react-globe.gl。
 *
 * 视觉特征(参考设计图):
 *  - 浅色调:白色半透明陆地 + 极浅蓝灰球面
 *  - 经纬网格(graticules)
 *  - 蓝色大气层光晕
 *  - 飞线低弧度贴球面 + dash 流动
 *  - 节点带涟漪辐射
 *
 * 业务语义: 全球供应节点 → 中国主仓 → 区域质检与处置节点
 */

// ─── 业务节点(真实经纬度) ───
const HUB = { lat: 31.23, lng: 121.47, name: '中国主仓' };

const SUPPLIERS = [
  { lat: 51.51, lng: -0.13, name: '英国供应商' },
  { lat: 43.65, lng: -79.38, name: '加拿大供应商' },
  { lat: 28.61, lng: 77.21, name: '印度供应商' },
  { lat: 1.35, lng: 103.82, name: '新加坡供应商' },
  { lat: 35.69, lng: 139.69, name: '日本供应商' },
  { lat: 23.13, lng: 113.26, name: '华南供应商' },
  { lat: 39.9, lng: 116.41, name: '华北供应商' },
];

const DOWNSTREAMS_NORMAL = [
  { lat: 22.32, lng: 114.17, name: '香港复核' },
  { lat: 13.75, lng: 100.5, name: '泰国出库' },
  { lat: 37.57, lng: 126.98, name: '韩国工厂' },
];

const DOWNSTREAMS_GOLD = [
  { lat: 19.08, lng: 72.88, name: '印度问题件隔离' },
  { lat: 51.51, lng: -0.13, name: '英国索赔协同' },
  { lat: 49.28, lng: -123.12, name: '加拿大异常协同' },
];

interface WarehouseGlobeBackgroundProps {
  width?: number;
  height?: number;
}

interface CountryFeature {
  type: string;
  properties: { name?: string; [k: string]: unknown };
  geometry: { type: string; coordinates: unknown };
}

function createOceanGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, '#EAF4FF');
  bg.addColorStop(0.48, '#DCEBFF');
  bg.addColorStop(1, '#F5FBFF');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineCap = 'round';

  for (let lng = -180; lng <= 180; lng += 15) {
    const x = ((lng + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.strokeStyle =
      lng % 45 === 0 ? 'rgba(88, 141, 213, 0.18)' : 'rgba(88, 141, 213, 0.1)';
    ctx.lineWidth = lng % 45 === 0 ? 1.1 : 0.75;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.strokeStyle =
      lat % 45 === 0 ? 'rgba(88, 141, 213, 0.16)' : 'rgba(88, 141, 213, 0.09)';
    ctx.lineWidth = lat % 45 === 0 ? 1.05 : 0.7;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.anisotropy = 4;
  return texture;
}

function createLandWeaveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.fillStyle = 'rgba(190, 216, 252, 0.72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x <= canvas.width; x += 3) {
    ctx.beginPath();
    ctx.strokeStyle =
      x % 12 === 0 ? 'rgba(38, 91, 184, 0.66)' : 'rgba(38, 91, 184, 0.46)';
    ctx.lineWidth = x % 12 === 0 ? 1.55 : 1.08;
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.62;
    ctx.moveTo(x + 1.5, 0);
    ctx.lineTo(x + 1.5, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 3) {
    ctx.beginPath();
    ctx.strokeStyle =
      y % 12 === 0 ? 'rgba(38, 91, 184, 0.58)' : 'rgba(38, 91, 184, 0.4)';
    ctx.lineWidth = y % 12 === 0 ? 1.4 : 0.96;
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(canvas.width, y + 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.62;
    ctx.moveTo(0, y + 1.5);
    ctx.lineTo(canvas.width, y + 1.5);
    ctx.stroke();
  }

  for (let x = 0; x <= canvas.width; x += 6) {
    for (let y = 0; y <= canvas.height; y += 6) {
      ctx.fillStyle = 'rgba(29, 78, 168, 0.34)';
      ctx.fillRect(x, y, 1.85, 1.85);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2.9, 2.9);
  texture.needsUpdate = true;
  texture.anisotropy = 8;
  return texture;
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

  // 球面材质:浅冰蓝玻璃感,让陆地和飞线像浮在球体内部。
  const globeMaterial = useMemo(() => {
    const m = new MeshPhongMaterial();
    m.map = createOceanGridTexture();
    m.color = new Color('#FFFFFF');
    m.emissive = new Color('#C7DCFF');
    m.emissiveIntensity = 0.28;
    m.specular = new Color('#FFFFFF');
    m.shininess = 22;
    m.transparent = true;
    m.opacity = 0.76;
    m.depthWrite = false;
    return m;
  }, []);

  const landMaterial = useMemo(() => {
    const m = new MeshPhongMaterial();
    m.map = createLandWeaveTexture();
    m.color = new Color('#FFFFFF');
    m.emissive = new Color('#9FC4FF');
    m.emissiveIntensity = 0.07;
    m.specular = new Color('#F8FBFF');
    m.shininess = 10;
    m.transparent = true;
    m.opacity = 0.92;
    return m;
  }, []);

  // 飞线
  const arcs = useMemo(() => {
    const blue = [
      ...SUPPLIERS.map((s, index) => ({
        startLat: s.lat,
        startLng: s.lng,
        endLat: HUB.lat,
        endLng: HUB.lng,
        color: ['rgba(124,174,255,0.16)', 'rgba(74,140,255,0.95)', 'rgba(255,255,255,0.72)'],
        altitude: index < 2 ? 0.2 : 0.13,
        stroke: index < 2 ? 0.86 : 0.62,
        dashGap: index < 2 ? 0.72 : 0.95,
      })),
      ...DOWNSTREAMS_NORMAL.map((d, index) => ({
        startLat: HUB.lat,
        startLng: HUB.lng,
        endLat: d.lat,
        endLng: d.lng,
        color: ['rgba(255,255,255,0.22)', 'rgba(74,140,255,0.86)', 'rgba(124,174,255,0.24)'],
        altitude: index === 0 ? 0.08 : 0.1,
        stroke: 0.54,
        dashGap: 1.1,
      })),
    ];
    const gold = DOWNSTREAMS_GOLD.map((d, index) => ({
      startLat: HUB.lat,
      startLng: HUB.lng,
      endLat: d.lat,
      endLng: d.lng,
      color: ['rgba(255,255,255,0.24)', 'rgba(247,184,74,0.95)', 'rgba(255,224,149,0.3)'],
      altitude: index === 2 ? 0.18 : 0.12,
      stroke: 0.62,
      dashGap: 0.86,
    }));
    return [...blue, ...gold];
  }, []);

  // 节点辐射涟漪(参考图:中等强度,蓝色明显)
  const rings = useMemo(
    () => [
      { lat: HUB.lat, lng: HUB.lng, color: 'rgba(247,184,74,0.46)', maxR: 4.2, period: 1700 },
      ...SUPPLIERS.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        color: 'rgba(74,140,255,0.38)',
        maxR: 3,
        period: 2000,
      })),
      ...DOWNSTREAMS_NORMAL.map((d) => ({
        lat: d.lat,
        lng: d.lng,
        color: 'rgba(74,140,255,0.38)',
        maxR: 3,
        period: 2000,
      })),
      ...DOWNSTREAMS_GOLD.map((d) => ({
        lat: d.lat,
        lng: d.lng,
        color: 'rgba(247,184,74,0.42)',
        maxR: 3.4,
        period: 1800,
      })),
    ],
    []
  );

  // 节点亮点 — 比之前更大更醒目
  const points = useMemo(
    () => [
      { lat: HUB.lat, lng: HUB.lng, color: '#FFE08B', radius: 0.36 },
      ...SUPPLIERS.map((s) => ({ ...s, color: '#6AA6FF', radius: 0.26 })),
      ...DOWNSTREAMS_NORMAL.map((d) => ({ ...d, color: '#6AA6FF', radius: 0.26 })),
      ...DOWNSTREAMS_GOLD.map((d) => ({ ...d, color: '#FFD16A', radius: 0.3 })),
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
    controls.autoRotateSpeed = reduceMotion ? 0.32 : 0.9;
    controls.enableZoom = false;
    controls.enablePan = false;
    g.pointOfView({ lat: 24, lng: -62, altitude: 2.42 }, 0);
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
      // 经纬线由球面贴图控制,颜色更接近参考图。
      showGraticules={false}
      // 大气层
      showAtmosphere={true}
      atmosphereColor="#D7E8FF"
      atmosphereAltitude={0.08}
      // 国家边界:低饱和蓝白,保留半透明的浮雕感。
      polygonsData={countries}
      polygonGeoJsonGeometry={(d: object) => (d as CountryFeature).geometry as never}
      polygonAltitude={0.018}
      polygonCapMaterial={landMaterial}
      polygonCapCurvatureResolution={1.2}
      polygonSideColor={() => 'rgba(122,157,214,0.22)'}
      polygonStrokeColor={() => 'rgba(93,139,214,0.24)'}
      // 飞线:更细、更亮,像原型图里的浅色轨迹。
      arcsData={arcs}
      arcColor={(d: object) => (d as { color: string[] }).color}
      arcAltitude={(d: object) => (d as { altitude: number }).altitude}
      arcStroke={(d: object) => (d as { stroke: number }).stroke}
      arcCurveResolution={72}
      arcDashLength={0.76}
      arcDashGap={(d: object) => (d as { dashGap: number }).dashGap}
      arcDashAnimateTime={2100}
      arcAltitudeAutoScale={0.34}
      // 节点亮点
      pointsData={points}
      pointColor={(d: object) => (d as { color: string }).color}
      pointAltitude={0.018}
      pointRadius={(d: object) => (d as { radius: number }).radius}
      pointResolution={16}
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
