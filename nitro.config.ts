import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  publicAssets: [
    {
      dir: "./dist/client",
      maxAge: 31536000,
    },
  ],
  handlers: [
    {
      route: "/**",
      handler: "./dist/server/server.js",
    },
  ],
});
