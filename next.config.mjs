import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: false,   // 👈 asta rezolvă eroarea de pe Vercel
};

export default withPWA(nextConfig);
