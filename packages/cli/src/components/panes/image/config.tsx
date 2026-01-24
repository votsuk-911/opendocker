import {
    createEffect,
    createSignal,
    For,
    Show,
} from 'solid-js';
import { TextAttributes } from '@opentui/core';
import { useApplication } from '@/context/application';
import type { Image } from '@/context/application';
import { Pane } from '@/ui/pane';
import { colors } from '@/util/colors';

type ConfigField = {
    label: string;
    value: () => string | undefined;
};

export default function Config() {
    const app = useApplication();
    const [image, setImage] = createSignal<Image>();
    
    createEffect(() => {
        setImage(app.images.find((image) => image.id === app.activeImage));
    });

    const fields: ConfigField[] = [
        { label: 'Image', value: () => image()?.name },
        { label: 'Tag', value: () => image()?.tag },
        { label: 'Size', value: () => image()?.size },
        { label: 'Created', value: () => image()?.created },
        { label: 'Id', value: () => image()?.id },
    ];

    return (
        <Pane title="Config" width="100%" flexGrow={0} flexShrink={0}>
            <box
                flexDirection="column"
                width="100%"
                paddingLeft={1}
                paddingRight={2}
                marginTop={1}
            >
                <Show when={app.activeImage} fallback={
                    <text fg={colors.textMuted}>No image selected</text>
                }>
                    <box>
                        <text>things go here</text>
                    </box>
                    {/* <table cellPadding={0}> */}
                    {/*     <tbody> */}
                    {/*         <For each={fields}> */}
                    {/*             {(field) => ( */}
                    {/*                 <tr> */}
                    {/*                     <td textAlign="left"> */}
                    {/*                         <text fg={colors.textMuted} attributes={TextAttributes.BOLD}> */}
                    {/*                             {field.label} */}
                    {/*                         </text> */}
                    {/*                     </td> */}
                    {/*                     <td textAlign="left"> */}
                    {/*                         <text fg={colors.text}>{field.value()}</text> */}
                    {/*                     </td> */}
                    {/*                 </tr> */}
                    {/*             )} */}
                    {/*         </For> */}
                    {/*     </tbody> */}
                    {/* </table> */}
                </Show>
            </box>
        </Pane>
    )
}
