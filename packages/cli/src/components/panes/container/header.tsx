import { createMemo, createEffect, createSignal } from 'solid-js';
import { useApplication } from '@/context/application';
import type { Container } from '@/context/application';
import { Pane } from '@/ui/pane';
import { getColorForContainerState } from '@/util/colors';
import { TextAttributes } from '@opentui/core';
import { useTheme } from '@/context/theme';

export default function Header() {
    const theme = useTheme().theme;
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
                            <text fg={theme.textMuted} attributes={TextAttributes.BOLD}>
                                Container
                            </text>
                            <text fg={theme.text}>{selected()?.name}</text>
                        </box>
                        <box>
                            <text fg={theme.textMuted} attributes={TextAttributes.BOLD}>
                                Status
                            </text>
                            <text fg={highlight()}>
                                {selected()?.status}
                            </text>
                        </box>
                        <box>
                            <text fg={theme.textMuted} attributes={TextAttributes.BOLD}>
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
