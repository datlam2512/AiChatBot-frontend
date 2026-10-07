import type { Config } from "tailwindcss";
// Dark mode follows the OS setting (default "media" strategy).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
