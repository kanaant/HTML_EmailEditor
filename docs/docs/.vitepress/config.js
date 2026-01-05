export default {
  title: "HTML Email Editor",
  description: "User Guide for the HTML Email Editor",
  base: "/docs/",
  ignoreDeadLinks: true,
  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Editor", link: "https://maquifit.darksenses.com" },
    ],
    sidebar: [
      {
        text: "User Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Editing Basics", link: "/guide/editing-basics" },
          { text: "Templates & Saving", link: "/guide/templates" },
          { text: "Exporting", link: "/guide/exporting" },
        ],
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 HTML Email Editor",
    },
  },
};
