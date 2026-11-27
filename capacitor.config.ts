import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.artify.music",
  appName: "Artify",
  webDir: "dist",
  backgroundColor: "#07070c",
  android: { allowMixedContent: false },
};

export default config;
