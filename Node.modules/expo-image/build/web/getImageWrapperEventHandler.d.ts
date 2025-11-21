import type { SyntheticEvent } from 'react';
import type { ImageWrapperEvents } from '../../src/web/ImageWrapper.types';
import type { ImageSource } from '../../src/Image.types';
export declare function getImageWrapperEventHandler(events: ImageWrapperEvents | undefined, source: ImageSource): {
    onLoad: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
    onTransitionEnd: () => void | undefined;
    onError: () => void;
};
//# sourceMappingURL=getImageWrapperEventHandler.d.ts.map