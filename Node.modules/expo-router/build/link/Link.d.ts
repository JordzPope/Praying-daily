import { LinkMenuAction, LinkPreview, LinkTrigger } from '../../src/link/elements';
import type { LinkProps, WebAnchorProps } from '../../src/link/useLinkHooks';
export declare const Link: ((props: LinkProps) => import("react").JSX.Element) & {
    resolveHref: (href: import("../../src").Href) => string;
    Menu: import("react").FC<import("../../src/link/elements").LinkMenuProps>;
    Trigger: typeof LinkTrigger;
    Preview: typeof LinkPreview;
    MenuAction: typeof LinkMenuAction;
};
export type LinkComponent = typeof Link;
export { LinkProps, WebAnchorProps };
export { Redirect, RedirectProps } from '../../src/link/Redirect';
//# sourceMappingURL=Link.d.ts.map