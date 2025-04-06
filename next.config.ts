import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["bfv-vsa.fra1.digitaloceanspaces.com"], // ✅ Hier deine erlaubte Domain eintragen
  },
};

export default nextConfig;
