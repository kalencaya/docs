import * as path from 'path';
import {defineConfig} from 'rspress/config';
import mermaid from 'rspress-plugin-mermaid';

export default defineConfig({
    root: path.join(__dirname, 'docs'),
    base: '/docs/',
    title: '文档',
    description: '分享知识、技能和经验',
    icon: '/rspress-icon.png',
    logo: '/rspress-icon.png',
    lang: 'zh',
    multiVersion: {
        default: '2026',
        versions: ['2026', '2025', '2024', '2023'],
    },
    plugins: [mermaid({
        mermaidConfig: {
            theme: 'forest',
        },
    })],
    themeConfig: {
        lastUpdated: true,
        socialLinks: [
            {icon: 'github', mode: 'link', content: 'https://github.com/kalencaya/docs'},
            {icon: 'wechat', mode: 'img', content: '/wechat.png'},
        ],
        locales: [
            {
                lang: 'zh',
                label: '简体中文',
                editLink: {
                    docRepoBaseUrl:
                        'https://github.com/kalencaya/docs/tree/main/docs',
                    text: '📝 在 GitHub 上编辑此页',
                },
                prevPageText: '上一篇',
                nextPageText: '下一篇',
                outlineTitle: '目录',
            },
            {
                lang: 'en',
                label: 'English',
                editLink: {
                    docRepoBaseUrl:
                        'https://github.com/kalencaya/docs/tree/main/docs',
                    text: '📝 Edit this page on GitHub',
                },
            },
        ],
    },
    markdown: {
        checkDeadLinks: false
    }
});
