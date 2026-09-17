export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://devpipe.example.com/sitemap.xml',
  };
}
