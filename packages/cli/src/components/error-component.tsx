import { TextAttributes } from '@opentui/core';
import { useTheme } from '@/context/theme';

interface ErrorComponentProps {
    error: Error;
}

export function ErrorComponent(props: ErrorComponentProps) {
    const theme = useTheme().theme;

    return (
        <box flexDirection="column" gap={2}>
            <box>
                <text attributes={TextAttributes.BOLD} fg={theme.warning}>
                    There's been a woopsie!
                </text>
                <text fg={theme.textMuted}>
                    If this problem persists, please reach out to me on X @swe_steeve
                </text>
            </box>
            <box flexDirection="column" gap={1}>
                <box>
                    <text fg={theme.error} attributes={TextAttributes.BOLD}>
                        Error message:
                    </text>
                    <text fg={theme.textMuted}>{props.error.message}</text>
                </box>
                <box>
                    <text fg={theme.error} attributes={TextAttributes.BOLD}>
                        Stack trace:
                    </text>
                    <text fg={theme.textMuted}>{props.error.stack}</text>
                </box>
            </box>
        </box>
    );
}
