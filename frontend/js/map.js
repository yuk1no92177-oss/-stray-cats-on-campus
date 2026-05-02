// Leaflet 地图逻辑

// 河海大学江宁校区中心坐标（主校区）
const HHU_CENTER = [31.9139, 118.7862];

// 初始化地图
function initMap(containerId, options = {}) {
  const map = L.map(containerId, {
    center: options.center || HHU_CENTER,
    zoom: options.zoom || 15,
    zoomControl: options.zoomControl !== false,
    attributionControl: true
  });

  // OpenStreetMap 瓦片
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  return map;
}

// 获取猫咪状态对应的图标颜色
function getCatMarkerColor(healthStatus) {
  switch (healthStatus) {
    case '健康': return '#22c55e'; // green
    case '需关注': return '#f59e0b'; // amber
    case '需救助': return '#ef4444'; // red
    case '受伤': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
}

// 创建猫咪自定义图标
function createCatIcon(color, isEmergency = false) {
  const size = isEmergency ? 40 : 32;
  const html = `
    <div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ${isEmergency ? 'animation: pulse 1.5s infinite;' : ''}
    ">
      <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l3 5h-2v2h-2v-2h-2zm-2 13h4v3h-4zm-5-5h3v2h-3zm11 0h3v2h-3z"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
    popupAnchor: [0, -(size + 6) / 2]
  });
}

// 在地图上加载猫咪点位
async function loadCatMarkers(map) {
  const res = await API.get('/cats');
  if (res.code !== 200) return;

  const catMarkers = {};

  res.data.forEach(cat => {
    if (!cat.longitude || !cat.latitude) return;

    const color = getCatMarkerColor(cat.health_status);
    const isEmergency = cat.health_status === '需救助' || cat.health_status === '受伤';
    const icon = createCatIcon(color, isEmergency);

    const marker = L.marker([cat.latitude, cat.longitude], { icon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width:200px;font-family:sans-serif;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            ${cat.photo_url ? `<img src="${cat.photo_url}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">` : ''}
            <div>
              <div style="font-weight:bold;font-size:16px;">${cat.cat_name}</div>
              <div style="font-size:12px;color:#666;">${cat.location}</div>
            </div>
          </div>
          <div style="margin-bottom:8px;">
            <span style="background:${color};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${cat.health_status}</span>
            <span style="background:#f3f4f6;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:4px;">${cat.gender}</span>
            <span style="background:#f3f4f6;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:4px;">${cat.color}</span>
          </div>
          <a href="detail.html?id=${cat.id}" style="display:block;text-align:center;background:#f97316;color:white;text-decoration:none;padding:6px;border-radius:8px;font-size:12px;font-weight:bold;">查看档案</a>
        </div>
      `);

    catMarkers[cat.id] = marker;
  });

  return catMarkers;
}

// 添加热力图图层
function addHeatLayer(map, points) {
  if (!L.heatLayer) {
    console.warn('L.heatLayer not available, skipping heatmap');
    return null;
  }
  const heat = L.heatLayer(points, {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: { 0.4: '#22c55e', 0.6: '#f59e0b', 0.8: '#ef4444' }
  });
  return heat;
}

// 创建打卡记录图标（小圆点）
function createReportIcon() {
  return L.divIcon({
    html: `<div style="width:12px;height:12px;background:#f97316;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
}

// 在地图上加载已通过的打卡点位
async function loadReportMarkers(map) {
  try {
    const res = await API.get('/reports/map');
    if (res.code !== 200) return [];

    const markers = [];
    res.data.forEach(r => {
      if (!r.longitude || !r.latitude) return;
      const marker = L.marker([r.latitude, r.longitude], { icon: createReportIcon() })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px;font-family:sans-serif;font-size:13px;">
            <div style="font-weight:bold;margin-bottom:4px;">${r.cat_name || '未知猫咪'}</div>
            <div style="color:#666;font-size:12px;">${r.location || '未知位置'} · ${r.report_type || '打卡'}</div>
            <div style="color:#999;font-size:11px;margin-top:4px;">${new Date(r.create_time).toLocaleString('zh-CN')}</div>
            ${r.description ? `<div style="color:#4b5563;font-size:12px;margin-top:4px;border-top:1px solid #f3f4f6;padding-top:4px;">${r.description}</div>` : ''}
          </div>
        `);
      markers.push(marker);
    });
    return markers;
  } catch (e) {
    return [];
  }
}

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  .custom-marker { background: none !important; border: none !important; }
  .leaflet-popup-content-wrapper { border-radius: 12px !important; }
  .leaflet-popup-content { margin: 12px; }
`;
document.head.appendChild(style);
