import { Node } from '@tiptap/core';

export interface IframeOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; width?: string; height?: string }) => ReturnType;
    };
  }
}

export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',

  group: 'block',

  atom: true,

  draggable: true,

  selectable: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: '400' },
      frameborder: { default: '0' },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => true,
        renderHTML: (attrs) => {
          if (!attrs.allowfullscreen) return;
          return 'allowfullscreen';
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'iframe-wrapper',
        'data-iframewrapper': '',
        style: 'position:relative;width:100%;padding-bottom:56.25%;margin:1rem 0;border-radius:8px;overflow:hidden;border:1px solid var(--border);background:#000',
      },
      ['iframe', { ...HTMLAttributes, style: 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px' }],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string; width?: string; height?: string }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});
