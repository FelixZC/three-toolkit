declare module "*.gltf" {
  const value: string;
  export default value;
}

declare module "*.glb" {
  const value: string;
  export default value;
}


// 声明图片资源的类型
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

// 通用 JSON 接口
interface JsonData {
  [key: string]: any;
}

// 声明模块类型
declare module '*.json' {
  const value: JsonData;
  export default value;
}
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.eot' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.otf' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.flac' {
  const src: string;
  export default src;
}



declare module '*.woff' {
  const src: string;
  export default src;
}
