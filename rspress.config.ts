import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import mermaid from 'rspress-plugin-mermaid';
import pluginFileTree from 'rspress-plugin-file-tree';
import { transformerCompatibleMetaHighlight } from '@rspress/core/shiki-transformers';
import {
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationFocus,
    transformerNotationHighlight,
    transformerRemoveNotationEscape
} from '@shikijs/transformers';

export default defineConfig({
    root: path.join(__dirname, 'docs'),
    base: '/docs/',
    title: '文档',
    description: '分享知识、技能和经验',
    icon: '/rspress-icon.png',
    logo: {
        light: '/rspress-light-logo.png',
        dark: '/rspress-dark-logo.png',
    },
    lang: 'zh',
    multiVersion: {
        default: '2026',
        versions: ['2026', '2025'],
    },
    search: {
        versioned: false,
    },
    locales: [
        {
            lang: 'en',
            label: 'English'
        },
        {
            lang: 'zh',
            label: '简体中文'
        },
    ],
    plugins: [
        mermaid({
            mermaidConfig: {
                theme: 'forest',
            }
        }),
        pluginFileTree(),
    ],
    themeConfig: {
        lastUpdated: true,
        editLink: {
            docRepoBaseUrl:
                'https://github.com/kalencaya/docs/docs',
            text: '📝 在 GitHub 上编辑此页',
        },
        socialLinks: [
            {
                icon: 'github',
                mode: 'github-stars',
                content: 'https://github.com/kalencaya/docs',
            },
            { icon: 'wechat', mode: 'img', content: '/wechat.png' },
        ],
    },
    markdown: {
        defaultWrapCode: true,
        showLineNumbers: true,
        link: {
            checkDeadLinks: false,
        },
        shiki: {
            langs: [
                'markdown',
                'mdx',
                'tsx',
                'json',
                'bash',
                'yaml',
                'ts',
                'js',
                'css',
                'html'
            ],
            transformers: [
                transformerNotationDiff(),
                transformerNotationErrorLevel(),
                transformerNotationHighlight(),
                transformerNotationFocus(),
                transformerCompatibleMetaHighlight(),
                transformerRemoveNotationEscape(),
            ],
        }
    },
    llms: true,
});
