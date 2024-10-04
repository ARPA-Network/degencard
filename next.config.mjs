import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

nextConfig.rewrites = async () => [
  {
    source: '/v1/:profile',
    destination: `${baseUrl}/v1/:profile`,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  async rewrites() {
    return [
      {
        source: "/v1/:profile",
        destination:
          `${baseUrl}/v1/:profile`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
