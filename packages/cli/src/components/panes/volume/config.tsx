import {
    createEffect,
    createSignal,
    For,
    Show,
} from 'solid-js';
import { TextAttributes } from '@opentui/core';
import { useApplication } from '@/context/application';
import type { Volume } from '@/context/application';
import { Pane } from '@/ui/pane';
import { useTheme } from '@/context/theme';

type SimpleField = {
    label: string;
    value: () => string | undefined;
};

type RecordField = {
    label: string;
    value: () => Record<string, string> | null | undefined;
};

export default function Config() {
    const app = useApplication();
    const theme = useTheme().theme;
    const [volume, setVolume] = createSignal<Volume>();
    
    createEffect(() => {
        setVolume(app.volumes.find((v) => v.name === app.activeVolume));
    });

    const simpleFields: SimpleField[] = [
        { label: 'Name', value: () => volume()?.name },
        { label: 'Driver', value: () => volume()?.driver },
        { label: 'Scope', value: () => volume()?.scope },
        { label: 'Mountpoint', value: () => volume()?.mountpoint },
    ];

    const recordFields: RecordField[] = [
        { label: 'Labels', value: () => volume()?.labels },
        { label: 'Options', value: () => volume()?.options },
        { label: 'Status', value: () => volume()?.status },
    ];

    const maxLabelLength = Math.max(
        ...simpleFields.map(f => f.label.length),
        ...recordFields.map(f => f.label.length)
    );

    const getRecordEntries = (record: Record<string, string> | null | undefined) => {
        if (!record || Object.keys(record).length === 0) {
            return [];
        }
        return Object.entries(record);
    };

    return (
        <Pane title="Config" width="100%" flexGrow={0} flexShrink={0} active={true}>
            <box
                flexDirection="column"
                width="100%"
                paddingLeft={1}
                paddingRight={2}
                marginTop={1}
            >
                <Show when={app.activeVolume} fallback={
                    <text fg={theme.textMuted} paddingLeft={2}>
                        No volume selected
                    </text>
                }>
                    <For each={simpleFields}>
                        {(field) => (
                            <box flexDirection="row" gap={3}>
                                <text fg={theme.textMuted} attributes={TextAttributes.BOLD} flexShrink={0}>
                                    {field.label.padEnd(maxLabelLength)}
                                </text>
                                <text fg={theme.text}>{field.value()}</text>
                            </box>
                        )}
                    </For>
                    <For each={recordFields}>
                        {(field) => {
                            const entries = () => getRecordEntries(field.value());
                            return (
                                <>
                                    <box flexDirection="row" gap={3}>
                                        <text fg={theme.textMuted} attributes={TextAttributes.BOLD} flexShrink={0}>
                                            {field.label.padEnd(maxLabelLength)}
                                        </text>
                                        <Show when={entries().length === 0}>
                                            <text fg={theme.text}>None</text>
                                        </Show>
                                    </box>
                                    <Show when={entries().length > 0}>
                                        <box flexDirection="row" flexWrap="wrap" gap={2} marginLeft={2} marginBottom={1}>
                                            <For each={entries()}>
                                                {([key, value]) => (
                                                    <box flexDirection="column">
                                                        <text fg={theme.textMuted}>{key}</text>
                                                        <text fg={theme.text}>{value}</text>
                                                    </box>
                                                )}
                                            </For>
                                        </box>
                                    </Show>
                                </>
                            );
                        }}
                    </For>
                </Show>
            </box>
        </Pane>
    );
}
