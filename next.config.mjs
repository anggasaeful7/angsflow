import withNextIntl from 'next-intl/plugin';

const plugin = withNextIntl('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default plugin(nextConfig);
