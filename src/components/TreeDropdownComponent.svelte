<script lang="ts" generics="T">
    import { createEventDispatcher } from "svelte";
    import type { DeepReadonly } from "ts-essentials";

    import { Dropdown, DropdownItem, Search } from "flowbite-svelte";
    import { ChevronRightOutline } from "flowbite-svelte-icons";

    import type { PickerTree } from "../lib/picker";

    export let tree: DeepReadonly<PickerTree<T>>;
    export let nested: boolean = false;
    export let searchResultLimit: number = 10;

    let search: string = "";
    let open: boolean = false;

    const dispatch = createEventDispatcher<{ select: DeepReadonly<T> }>();

    function onSelect(value: DeepReadonly<T>) {
        open = false;
        dispatch("select", value);
    }

    function focusSearch(el: HTMLDivElement) {
        el.querySelector("input")?.focus();
    }

    function filterTree(
        tree: DeepReadonly<PickerTree<T>>,
        search: string,
    ): [string, DeepReadonly<T>][] {
        const results: [string, DeepReadonly<T>][] = [];
        const regex = new RegExp(search, "i");

        function visit(node: DeepReadonly<PickerTree<T>>) {
            for (const key in node.subtrees) {
                visit(node.subtrees[key]);
            }
            for (const key in node.leaves) {
                if (key.search(regex) !== -1) {
                    results.push([key, node.leaves[key]]);
                }
            }
        }

        visit(tree);
        return results;
    }
</script>

{#if nested}
    <Dropdown bind:open placement="right-start" shadow={true}>
        {#each Object.entries(tree.subtrees) as [name, subtree]}
            <DropdownItem class="flex items-center justify-between">
                {name}
                <ChevronRightOutline class="ms-2" />
            </DropdownItem>
            <svelte:self
                tree={subtree}
                nested
                on:select={(e) => onSelect(e.detail)}
            />
        {/each}
        {#each Object.entries(tree.leaves) as [name, value]}
            <DropdownItem on:click={() => onSelect(value)}>
                {name}
            </DropdownItem>
        {/each}
    </Dropdown>
{:else}
    <Dropdown bind:open shadow={true}>
        <div slot="header" class="p-2" use:focusSearch>
            <Search size="sm" bind:value={search} />
        </div>
        {#if search}
            {#each filterTree(tree, search).slice(0, searchResultLimit) as [name, value]}
                <DropdownItem on:click={() => onSelect(value)}>
                    {name}
                </DropdownItem>
            {/each}
        {:else}
            {#each Object.entries(tree.subtrees) as [name, subtree]}
                <DropdownItem class="flex items-center justify-between">
                    {name}
                    <ChevronRightOutline class="ms-2" />
                </DropdownItem>
                <svelte:self
                    tree={subtree}
                    nested
                    on:select={(e) => onSelect(e.detail)}
                />
            {/each}
            {#each Object.entries(tree.leaves) as [name, value]}
                <DropdownItem on:click={() => onSelect(value)}>
                    {name}
                </DropdownItem>
            {/each}
        {/if}
    </Dropdown>
{/if}
