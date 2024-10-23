// vite.config.ts
import { defineConfig } from "file:///mnt/c/Users/Freecs/Desktop/M2/DAAR/again/Collectible-Card-Game/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/Freecs/Desktop/M2/DAAR/again/Collectible-Card-Game/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: { outDir: "build", sourcemap: true },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }]
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import 'index.css';`
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvVXNlcnMvRnJlZWNzL0Rlc2t0b3AvTTIvREFBUi9hZ2Fpbi9Db2xsZWN0aWJsZS1DYXJkLUdhbWUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9GcmVlY3MvRGVza3RvcC9NMi9EQUFSL2FnYWluL0NvbGxlY3RpYmxlLUNhcmQtR2FtZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvRnJlZWNzL0Rlc2t0b3AvTTIvREFBUi9hZ2Fpbi9Db2xsZWN0aWJsZS1DYXJkLUdhbWUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBidWlsZDogeyBvdXREaXI6ICdidWlsZCcsIHNvdXJjZW1hcDogdHJ1ZSB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbeyBmaW5kOiAnQCcsIHJlcGxhY2VtZW50OiAnL3NyYycgfV0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgY3NzOiB7XHJcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAaW1wb3J0ICdpbmRleC5jc3MnO2AsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwWSxTQUFTLG9CQUFvQjtBQUN2YSxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE9BQU8sRUFBRSxRQUFRLFNBQVMsV0FBVyxLQUFLO0FBQUEsRUFDMUMsU0FBUztBQUFBLElBQ1AsT0FBTyxDQUFDLEVBQUUsTUFBTSxLQUFLLGFBQWEsT0FBTyxDQUFDO0FBQUEsRUFDNUM7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLEtBQUs7QUFBQSxRQUNILGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
