import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AI Systems Master',
  tagline: 'AI Systems Engineer Playbook — From Prototype to Production',
  favicon: 'img/favicon.ico',

  url: 'https://andrelair-platform.github.io',
  baseUrl: '/aisystemmaster/',

  organizationName: 'andrelair-platform',
  projectName: 'aisystemmaster',

  future: {
    v4: true,
  },

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/andrelair-platform/aisystemmaster/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'AI Systems Master',
      items: [
        { to: '/playbook', label: 'Playbook', position: 'left' },
        { to: '/disciplines', label: 'Disciplines', position: 'left' },
        { to: '/projects', label: 'Projects', position: 'left' },
        {
          href: 'https://github.com/andrelair-platform/aisystemmaster',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Playbook',
          items: [
            { label: 'Overview', to: '/playbook' },
            { label: 'Projects', to: '/projects' },
          ],
        },
        {
          title: 'Platform',
          items: [
            { label: 'andrelair-platform', href: 'https://github.com/andrelair-platform' },
            { label: 'Platform Docs', href: 'https://andrelair-platform.github.io/minicloud-platform-docs/' },
          ],
        },
      ],
      copyright: `André Kanmegne — AI Systems Engineer`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'python', 'go', 'typescript'],
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
