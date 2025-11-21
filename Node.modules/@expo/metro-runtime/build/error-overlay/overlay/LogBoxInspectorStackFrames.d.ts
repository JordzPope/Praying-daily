/**
 * Copyright (c) 650 Industries.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import type { StackType } from '../../../src/error-overlay/Data/LogBoxLog';
import type { Stack } from '../../../src/error-overlay/Data/LogBoxSymbolication';
type Props = {
    type: StackType;
    onRetry: () => void;
};
export declare function getCollapseMessage(stackFrames: Stack, collapsed: boolean): string;
export declare function LogBoxInspectorStackFrames({ onRetry, type }: Props): React.JSX.Element | null;
export {};
//# sourceMappingURL=LogBoxInspectorStackFrames.d.ts.map