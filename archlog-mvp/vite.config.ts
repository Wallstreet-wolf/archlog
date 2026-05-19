import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from "weapp-tailwindcss/vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  // uni 官方插件在前；uvwt 在后处理产物（小程序等平台）
  plugins: [uni(), uvwt()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});
