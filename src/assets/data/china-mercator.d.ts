// 定义 CRS（坐标参考系统）接口
interface CrsProperties {
  name: string;
}

interface Crs {
  type: "name";
  properties: CrsProperties;
}

// 定义 Feature 属性接口
interface FeatureProperties {
  adcode: number;
  name: string;
  adchar?: null; // 可能为 null，使用 optional property
  childrenNum: number;
  level: string;
  subFeatureIndex: number;
  parent: {
    adcode: number;
  };
}

interface GeometryCoordinates {
  // 这里需要根据具体的坐标数据结构进行定义，以下是一个示例
  type: "MultiPolygon";
  coordinates: number[][][][]; // 多边形坐标数组，具体维度根据实际数据结构调整
}

interface Feature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: GeometryCoordinates;
}

// 定义 FeatureCollection 接口
interface FeatureCollection {
  type: "FeatureCollection";
  crs: Crs;
  features: Feature[];
}
