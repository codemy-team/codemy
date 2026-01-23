// CSS Module type declaration
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Vite env types
interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
