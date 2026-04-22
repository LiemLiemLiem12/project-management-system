import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.fsgn5-12.fna.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      // Bạn có thể thêm các hostname khác của Facebook/Meta tại đây
      {
        protocol: "https",
        hostname: "**.fbcdn.net", // Cho phép tất cả subdomain của fbcdn.net
      },
    ],
  },
};

export default nextConfig;
