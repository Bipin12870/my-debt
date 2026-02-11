import type { NextConfig } from 'next';

declare module 'next-pwa' {
    export interface PWAConfig {
        dest: string;
        disable?: boolean;
        register?: boolean;
        skipWaiting?: boolean;
        scope?: string;
        sw?: string;
        runtimeCaching?: any[];
        publicExcludes?: string[];
        buildExcludes?: string[];
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
    }

    export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
