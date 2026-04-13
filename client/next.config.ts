import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-app-output",
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
