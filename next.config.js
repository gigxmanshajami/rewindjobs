/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com', 'upload.wikimedia.org', 'firebasestorage.googleapis.com'], // Add the external domain here
    },
    productionBrowserSourceMaps: true,
}

module.exports = nextConfig
