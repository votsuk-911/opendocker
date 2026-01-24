import ContainerList from '@/components/panes/container/list';

export default function LeftSidebar() {
    return (
        <box flexDirection="column" width="30%" height="100%" gap={1} justifyContent="flex-start" alignItems="stretch">
            <ContainerList />
        </box>
    );
}
