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
import { Pane } from '@/ui/pane';
import { colors } from '@/util/colors';
import { Loader } from '@/ui/loader';
import { useApplication } from '@/context/application';
import type { Volume } from '@/context/application';

export default function List() {
    const app = useApplication();
    const [loaded, setLoaded] = createSignal<boolean>(false);
    const [active, setActive] = createSignal<boolean>(false);
    const maxDriverLength = () => Math.max(...app.volumes.map(v => v.driver.length), 0);

    function validateActiveVolume(volumes: Array<Volume>, activeVolume: string | null) {
        if (!activeVolume) return volumes[0]?.name;
        const exists = volumes.find((v: Volume) => v.name === activeVolume);
        return exists ? activeVolume : volumes[0]?.name;
    }

    async function volumePulse() {
        const d = app.docker;
        if (!d) return;

        const fetchedVolumes = await d?.streamVolumes() || [];
        app.setVolumes(fetchedVolumes);

        const validActiveVolume = validateActiveVolume(fetchedVolumes, app.activeVolume);
        if (validActiveVolume !== app.activeVolume) {
            app.setActiveVolume(validActiveVolume);
        }

        setLoaded(true);
    }

    onMount(() => {
        volumePulse();

        const intervalId = setInterval(() => {
            volumePulse();
        }, 1000);

        onCleanup(() => {
            clearInterval(intervalId);
        });
    });

    function getSelectedIndex() {
        if (!app.activeVolume) {
            return -1;
        }

        return app.volumes.findIndex(v => v.name === app.activeVolume);
    }

    useKeyboard(key => {
        if (app.filtering) return;
        if (app.activePane !== 'volumes') return;

        if (key.name === 'k') {
            const index = getSelectedIndex();
            if (index === -1 && app.volumes.length > 0) {
                app.setActiveVolume(app.volumes[app.volumes.length - 1].name);
                return;
            }

            if (index <= 0) {
                return;
            }

            const newSelected = app.volumes[index - 1];
            app.setActiveVolume(newSelected.name);
        }

        if (key.name === 'j') {
            const index = getSelectedIndex();

            if (index === -1 && app.volumes.length > 0) {
                app.setActiveVolume(app.volumes[0].name);
                return;
            }

            if (index >= app.volumes.length - 1) {
                return;
            }

            const newSelected = app.volumes[index + 1];
            app.setActiveVolume(newSelected.name);
        }
    });

    createEffect(() => {
        if (!app.activeVolume && app.volumes.length > 0) {
            app.setActiveVolume(app.volumes[0].name);
        }
    });

    createEffect(() => {
        setActive(app.activePane === 'volumes');
    });

    return (
        <Pane
            title="Volumes"
            width="100%"
            flexGrow={active() ? 1 : 0}
            flexShrink={1}
            borderColor={() => active() ? colors.accent : colors.backgroundPanel}
            active={active()}
        >
            <Show when={active()}>
                <Switch>
                    <Match when={app.volumes.length > 0}>
                        <box flexDirection="column" width="100%">
                            <For each={app.volumes}>
                                {(volume: Volume) => {
                                    const isActive = () => app.activeVolume === volume.name;
                                    return (
                                        <box
                                            backgroundColor={isActive() ? colors.accent : undefined}
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
                                                flexShrink={0}
                                            >
                                                {volume.driver.padEnd(maxDriverLength())}
                                            </text>
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
                                                {volume.name}
                                            </text>
                                        </box>
                                    );
                                }}
                            </For>
                        </box>
                    </Match>
                    <Match when={app.volumes.length === 0 && loaded()}>
                        <box flexDirection="column" width="100%">
                            <box paddingLeft={1} paddingRight={1} paddingBottom={1}>
                                <text fg={colors.textMuted}>No volumes found</text>
                                <text fg={colors.textMuted}>
                                    Try: docker volume create my-volume to get started
                                </text>
                            </box>
                        </box>
                    </Match>
                    <Match when={app.volumes.length === 0 && !loaded()}>
                        <box width="100%" paddingLeft={1} paddingRight={1}>
                            <Loader />
                        </box>
                    </Match>
                </Switch>
            </Show>
        </Pane>
    );
}
