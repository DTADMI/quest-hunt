/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Allow all domains, you can restrict this in production
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        optimizeCss: true,
        scrollRestoration: true,
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {exclude: ['error']} : false,
    },
    poweredByHeader: false,
    generateEtags: true,
    compress: true,
    swcMinify: true,
    productionBrowserSourceMaps: false,
    async headers() {
        const securityHeaders = [
            {
                key: 'X-DNS-Prefetch-Control',
                value: 'on',
            },
            {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
            },
            {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN',
            },
            {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
            },
            {
                key: 'Referrer-Policy',
                value: 'origin-when-cross-origin',
            },
            {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
            },
        ];

        if (process.env.NODE_ENV === 'production') {
            securityHeaders.push({
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
            });
        }

        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
    webpack: (config, {isServer}) => {
        // Important: return the modified config
        return config;
    },
};

// Injected content via Sentry wizard below

module.exports = nextConfig;
