import { TextAttributes } from '@opentui/core';
import { useKeyboard } from '@opentui/solid';
import {
    createEffect,
    createSignal,
    For,
    Match,
    onMount,
    Switch,
    onCleanup,
    Show,
} from 'solid-js';
import { useApplication } from '@/context/application';
import type { Image } from '@/context/application';
import { Pane } from '@/ui/pane';
import { colors } from '@/util/colors';
import { Loader } from '@/ui/loader';

export default function List() {
    const app = useApplication();
    const [loaded, setLoaded] = createSignal<boolean>(false);
    const [active, setActive] = createSignal<boolean>(false);

    function validateActiveImage(images: Array<Image>, activeId: string | null) {
        if (!activeId) return images[0]?.id;
        const exists = images.find((i: Image) => i.id === activeId);
        return exists ? activeId : images[0]?.id;
    }

    async function imagePulse() {
        const d = app.docker;
        if (!d) return;

        const fetchedImages = await d?.streamImages() || [];
        app.setImages(fetchedImages);

        const validActiveId = validateActiveImage(fetchedImages, app.activeImage);
        if (validActiveId !== app.activeImage) {
            app.setActiveImage(validActiveId);
        }

        setLoaded(true);
    }

    onMount(() => {
        imagePulse();

        const intervalId = setInterval(() => {
            imagePulse();
        }, 1000);

        onCleanup(() => {
            clearInterval(intervalId);
        });
    });

    function getSelectedIndex() {
        if (!app.activeImage) {
            return -1;
        }

        return app.images.findIndex(i => i.id === app.activeImage);
    }

    useKeyboard(key => {
        if (app.filtering) return;
        if (app.activePane !== 'images') return;

        if (key.name === 'k') {
            const index = getSelectedIndex();
            if (index === -1 && app.images.length > 0) {
                app.setActiveImage(app.images[app.images.length - 1].id);
                return;
            }

            if (index <= 0) {
                return;
            }

            const newSelected = app.images[index - 1];
            app.setActiveImage(newSelected.id);
        }

        if (key.name === 'j') {
            const index = getSelectedIndex();

            if (index === -1 && app.images.length > 0) {
                app.setActiveImage(app.images[0].id);
                return;
            }

            if (index >= app.images.length - 1) {
                return;
            }

            const newSelected = app.images[index + 1];
            app.setActiveImage(newSelected.id);
        }
    });

    createEffect(() => {
        if (!app.activeImage && app.images.length > 0) {
            app.setActiveImage(app.images[0].id);
        }
    });

    createEffect(() => {
        setActive(app.activePane === 'images');
    });

    return (
        <Pane
            title="Images"
            width="100%"
            flexGrow={active() ? 1 : 0}
            flexShrink={1}
            borderColor={() => active() ? colors.success : colors.backgroundPanel}
            active={active()}
        >
            <Show when={active()}>
                <Switch>
                    <Match when={app.images.length > 0}>
                        <box flexDirection="column" width="100%">
                            <For each={app.images}>
                                {(image: Image) => {
                                    const isActive = () => app.activeImage === image.id;
                                    return (
                                        <box
                                            backgroundColor={isActive() ? colors.success : undefined}
                                            flexDirection="row"
                                            gap={1}
                                            paddingLeft={1}
                                            paddingRight={1}
                                        >
                                            <text
                                                fg={
                                                    isActive()
                                                        ? colors.backgroundPanel
                                                        : colors.textMuted
                                                }
                                                attributes={
                                                    isActive() ? TextAttributes.BOLD : undefined
                                                }
                                                flexShrink={1}
                                                flexGrow={1}
                                                wrapMode='none'
                                            >
                                                {image.name}
                                            </text>
                                        </box>
                                    );
                                }}
                            </For>
                        </box>
                    </Match>
                    <Match when={app.images.length === 0 && loaded()}>
                        <box flexDirection="column" width="100%">
                            <box paddingLeft={1} paddingRight={1} paddingBottom={1}>
                                <text fg={colors.textMuted}>No images found</text>
                                <text fg={colors.textMuted}>
                                    Try: docker pull hello-world to get started
                                </text>
                            </box>
                        </box>
                    </Match>
                    <Match when={app.images.length === 0 && !loaded()}>
                        <box width="100%" paddingLeft={1} paddingRight={1}>
                            <Loader />
                        </box>
                    </Match>
                </Switch>
            </Show>
        </Pane>
    );
}
