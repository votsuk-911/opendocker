import { createMemo, createEffect, createSignal } from 'solid-js';
import { useApplication } from '@/context/application';
import type { Container } from '@/context/application';
import { Pane } from '@/ui/pane';
import { getColorForContainerState } from '@/util/colors';
import { TextAttributes } from '@opentui/core';
import { colors } from '@/util/colors';

export default function Header() {
    const app = useApplication();
    const [selected, setSelected] = createSignal<Container>();

    createEffect(() => {
        setSelected(
            app.containers.find((c: Container) => c.id === app.activeContainer)
        );
    });

    const highlight = createMemo(() => {
        return getColorForContainerState(
            false,
            selected()?.status,
            selected()?.state
        );
    });

    return (
        <Pane width="100%" height="auto" flexShrink={0}>
            <box paddingLeft={1} paddingRight={1} flexDirection='column' gap={1}>
                <box height={2} flexDirection='row' justifyContent='space-between'>
                    <box flexDirection='row' gap={1}>
                        <box>
                            <text fg={colors.textMuted} attributes={TextAttributes.BOLD}>
                                Container
                            </text>
                            <text>{selected()?.name}</text>
                        </box>
                        <box>
                            <text fg={colors.textMuted} attributes={TextAttributes.BOLD}>
                                Status
                            </text>
                            <text fg={highlight()}>
                                {selected()?.status}
                            </text>
                        </box>
                        <box>
                            <text fg={colors.textMuted} attributes={TextAttributes.BOLD}>
                                State
                            </text>
                            <text fg={highlight()}>
                                {selected()?.state}
                            </text>
                        </box>
                    </box>
                </box>
            </box>
        </Pane>
    );
}
