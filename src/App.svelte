<script lang="ts">
    import "./app.css";

    import { spawnWebSocketListener } from "./lib/ws";
    import { errorMessage, serverHost } from "./stores";

    import ErrorToastComponent from "./components/ErrorToastComponent.svelte";
    import DropFileContainer from "./containers/DropFileContainer.svelte";
    import SidebarContainer from "./containers/SidebarContainer.svelte";
    import GalleryContainer from "./containers/GalleryContainer.svelte";
</script>

<main class="dark h-full flex flex-row">
    <ErrorToastComponent bind:error={$errorMessage} timeout={8} />
    <DropFileContainer />
    <SidebarContainer />
    <GalleryContainer />
</main>
