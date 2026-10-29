import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 舊版網址（書籤、分享連結）統一導到合併後的新位置
  async redirects() {
    return [
      { source: '/recall', destination: '/review', permanent: true },
      { source: '/play/decode', destination: '/decode', permanent: true },
      { source: '/play/alchemist', destination: '/', permanent: true },
      { source: '/learn/stage1', destination: '/', permanent: true },
      { source: '/learn/:lessonId/play', destination: '/learn/:lessonId', permanent: true },
    ];
  },
};

export default nextConfig;
