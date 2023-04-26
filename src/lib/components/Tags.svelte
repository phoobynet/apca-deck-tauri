<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { derived, writable } from 'svelte/store'
  import { clickOutside } from '../actions/clickOutside'

  export let tags: string[] = []
  export let options = new Map<string, string>()
  export let placeholder = ''

  const dispatch = createEventDispatcher()

  let inputValue = writable('')
  let selectedPosition = -1
  let selectedValue = ''
  let tagsRef: HTMLDivElement
  let inputRef: HTMLInputElement
  let timeout: ReturnType<typeof setTimeout>
  let query = derived(inputValue, ($inputValue, set) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      set($inputValue)
    }, 500)
  })

  const onClickOutside = () => {
    clearSelection()
    clearInput()
  }

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch('query', '')
      inputRef?.select()
    }
  }

  const clearSelection = () => {
    selectedPosition = -1
    selectedValue = ''
  }

  const clearInput = () => {
    $inputValue = ''
  }

  $: hasOptions = options.size > 0

  type SelectListItem = {
    key: string
    value: string
  }

  $: dispatch('query', $query)

  $: selectList = Array.from(options.entries()).map(([key, value]) => ({
    key,
    value
  })) as SelectListItem[]

  $: hasTags = tags.length > 0

  $: {
    if (options) {
      clearSelection()
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        onDownKey()
        break
      case 'ArrowUp':
        onUpKey()
        break
      case 'Enter':
        onEnterKey()
        break
    }
  }

  const onDownKey = () => {
    if (hasOptions) {
      const nextPosition = selectedPosition + 1

      if (nextPosition <= options.size - 1) {
        selectedPosition = nextPosition
        selectedValue = selectList[selectedPosition].key
      }
    } else {
      selectedPosition = -1
    }
  }

  const onUpKey = () => {
    if (hasOptions) {
      if (selectedPosition > 0) {
        selectedPosition = selectedPosition - 1
        selectedValue = selectList[selectedPosition].key
      }
    } else {
      selectedPosition = -1
    }
  }

  const onEnterKey = () => {
    if (hasOptions) {
      if (selectedPosition >= 0) {
        dispatch('selected', selectedValue)
        clearSelection()
        clearInput()
      }
    }
  }

  const onSelected = (key: string) => {
    dispatch('selected', key)
    clearSelection()
    clearInput()
  }
</script>

<svelte:window on:keydown={onKeyUp} />

<div class="tags" bind:this={tagsRef} use:clickOutside on:click_outside={onClickOutside}>
  <div class="tags-container">
    <input
      type="text"
      class="tags-container-input"
      bind:this={inputRef}
      bind:value={$inputValue}
      {placeholder}
      on:keydown={onKeyDown}
    />
    {#if hasTags}
      <ul class="tags-selected-container" transition:fade>
        {#each tags as tag}
          <li class="tags-selected-container-item">
            <div>{tag}</div>
            <div on:click={() => dispatch('deleted', tag)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="20px"
                height="20px"
                style="cursor: pointer"
                fill="#585858"
              >
                <path
                  d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z"
                />
              </svg>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  {#if hasOptions}
    <div class="tags-options-container" transition:fade={{ duration: 200 }}>
      <ul>
        {#each selectList as item}
          <li
            class="tags-options-list-item"
            class:tags-options-list-item-selected={selectedValue === item.key}
            on:click={() => onSelected(item.key)}
          >
            {item.value}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style lang="scss">
  .tags {
    position: relative;
  }

  .tags-container {
    border: 2px solid #e4e4e4;
    border-radius: 0.2rem;
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .tags-container-input {
    background-color: #f4f7fe;
    border: none;
    outline: none;
    width: 100%;
    height: 2rem;
    padding: 5px;

    &::placeholder {
      color: #405fe3;
    }
  }

  .tags-selected-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2rem;
    list-style: none;
    padding: 0;
  }

  .tags-selected-container-item {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    border: 2px solid #e4e4e4;
    border-radius: 0.2rem;
    align-items: center;
    padding: 0.1rem 0.3rem;
    font-weight: bold;
    color: #585858;
    cursor: default;
  }

  .tags-options-container {
    position: absolute;
    background-color: white;
    border: 2px solid #e4e4e4;
    border-radius: 0.2rem;
    width: 100%;

    ul {
      list-style: none;
      padding: 0.5rem 0.5rem;
    }
  }

  .tags-options-list-item {
    &:hover {
      cursor: pointer;
      background-color: #e4e4e4;
      color: black;
    }
  }

  .tags-options-list-item-selected {
    background-color: cornflowerblue;
    color: white;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }

  .list-enter-from {
    opacity: 0;
    transform: translateX(-10px);
  }

  .list-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }
</style>