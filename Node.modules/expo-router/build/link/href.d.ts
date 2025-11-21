import { UrlObject } from '../../src/LocationProvider';
import { LinkToOptions } from '../../src/global-state/routing';
import { Href } from '../../src/types';
/** Resolve an href object into a fully qualified, relative href. */
export declare const resolveHref: (href: Href) => string;
export declare function resolveHrefStringWithSegments(href: string, { segments, params }?: Partial<UrlObject>, { relativeToDirectory }?: LinkToOptions): string;
//# sourceMappingURL=href.d.ts.map