import * as path from 'path';
import {defineConfig} from 'rspress/config';

export default defineConfig({
    root: path.join(__dirname, 'docs'),
    base: '/docs/',
    title: 'Docs',
    description: '个人文档仓库，分享知识、技能和经验',
    icon: '/rspress-icon.png',
    logo: '/rspress-icon.png',
    lang: 'zh',
    multiVersion: {
        default: '2023',
        versions: ['2023'],
    },
    themeConfig: {
        lastUpdated: true,
        socialLinks: [
            {icon: 'github', mode: 'link', content: 'https://github.com/flowerfine/scaleph'},
            {icon: 'wechat', mode: 'img', content: '/wechat.jpg'},
        ],
        locales: [
            {
                lang: 'zh',
                label: '简体中文',
                editLink: {
                    docRepoBaseUrl:
                        'https://github.com/flowerfine/scaleph-repress-site/tree/main/docs',
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
                        'https://github.com/flowerfine/scaleph-repress-site/tree/main/docs',
                    text: '📝 Edit this page on GitHub',
                },
            },
        ],
    },
    markdown: {
        checkDeadLinks: false
    }
});
