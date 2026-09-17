import LandingPageClient from '@/components/LandingPageClient';

export const metadata = {
  title: "DevPipe - Write once. Syndicate everywhere.",
  description: "DevPipe is a tool for open-source maintainers to draft, format, and publish release notes to GitHub, Dev.to, Hashnode, and Reddit simultaneously.",
  openGraph: {
    title: "DevPipe - Write once. Syndicate everywhere.",
    description: "AI-powered release notes for developers.",
  }
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DevPipe",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
    </>
  );
}
