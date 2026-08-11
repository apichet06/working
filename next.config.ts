import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // อนุญาตให้เครื่องอื่นในวง LAN เข้า dev server ผ่าน IP นี้ได้ ไม่งั้น Next.js จะบล็อก
  // request ของ JS bundle/HMR เพราะ origin ไม่ตรง localhost (หน้าเว็บขึ้นแต่กดอะไรไม่ได้)
  allowedDevOrigins: ["192.168.100.249", "203.144.243.99"],
};

export default nextConfig;
