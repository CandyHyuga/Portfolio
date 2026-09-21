export type TagVariant =
  | "three"
  | "websockets"
  | "react"
  | "redis"
  | "gray"
  | "html"
  | "css"
  | "javascript"
  | "node"
  | "next"
  | "kubernetes"
  | "postgresql"
  | "ogl"
  | "glsl"
  | "ai"
  | "vue"
  | "tailwind"
  | "nuxt"
  | "maps"
  | "flutter"
  | "typescript"
  | "blender"
  | "steam"
  | "unreal"
  | "unity"
  | "coop"
  | "youngbuffalostudio";

export const tagLabels = {
  three: "Three.js",
  websockets: "WebSockets",
  react: "React",
  redis: "Redis",
  gray: "Gray",
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  node: "Node.js",
  next: "Next.js",
  kubernetes: "Kubernetes",
  postgresql: "PostgreSQL",
  ogl: "OGL.js",
  glsl: "GLSL",
  ai: "AI / LLM",
  vue: "Vue.js",
  tailwind: "Tailwind CSS",
  nuxt: "Nuxt.js",
  maps: "Google Maps",
  flutter: "Flutter",
  typescript: "TypeScript",
  blender: "Blender 3D",
  steam: "Steam",
  unreal: "Unreal Engine",
  unity: "Unity",
  coop: "Co-op",
  youngbuffalostudio: "YoungBuffaloStudio",
} as const satisfies Record<TagVariant, string>;
