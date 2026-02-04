import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seedfy/ui", "@seedfy/shared"],
  reactCompiler: true,
};

export default nextConfig;
