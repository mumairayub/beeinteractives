import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  // Menu items jump to sections of the home page (src/pages/index.astro).
  links: [
    { text: 'Home', href: getPermalink('/') },
    {
      text: 'Services',
      links: [
        { text: 'Google Ads', href: getPermalink('/google-ads-services') },
        { text: 'Meta Ads', href: getPermalink('/meta-ads-services') },
        { text: 'Microsoft Ads', href: getPermalink('/microsoft-ads-services') },
      ],
    },
    { text: 'About', href: getPermalink('/#about') },
    { text: 'Case', href: getPermalink('/#results') },
    { text: 'Blog', href: getBlogPermalink() },
    { text: 'Contact', href: getPermalink('/#contact') },
  ],
  actions: [{ variant: 'primary' as const, text: 'Free PPC Audit', href: getPermalink('/#contact') }],
};

export const footerData = {
  links: [
    {
      title: 'Explore',
      links: [
        { text: 'Results', href: getPermalink('/#results') },
        { text: 'Portfolio', href: getPermalink('/#portfolio') },
        { text: 'Services', href: getPermalink('/#services') },
        { text: 'Blog', href: getBlogPermalink() },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Documentation', href: 'https://github.com/arthelokyo/astrowind#readme' },
        { text: 'Skills for AI agents', href: 'https://github.com/arthelokyo/astrowind/tree/main/.agents/skills' },
        { text: 'Releases', href: 'https://github.com/arthelokyo/astrowind/releases' },
        { text: 'Discussions', href: 'https://github.com/arthelokyo/astrowind/discussions' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Report an issue', href: 'https://github.com/arthelokyo/astrowind/issues' },
        { text: 'License', href: 'https://github.com/arthelokyo/astrowind/blob/main/LICENSE.md' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/beeinteractives/' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'X (Twitter)', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://arthelokyo.com"> Arthelokyo</a> · All rights reserved.
  `,
};
