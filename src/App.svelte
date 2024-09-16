<script lang="ts">
    import "./app.css";

    import { errorMessage, serverHost, infoMessage } from "./stores";

    import DropFileContainer from "./containers/DropFileContainer.svelte";
    import SidebarContainer from "./containers/SidebarContainer.svelte";
    import GalleryContainer from "./containers/GalleryContainer.svelte";
    import NotificationToastComponent from "./components/NotificationToastComponent.svelte";
</script>

<main class="dark h-full flex flex-row">
    <NotificationToastComponent
        bind:message={$errorMessage}
        type="error"
        timeout={8}
    />
    <NotificationToastComponent
        bind:message={$infoMessage}
        type="info"
        timeout={4}
    />
    <DropFileContainer />
    <SidebarContainer />
    <GalleryContainer />
</main>
