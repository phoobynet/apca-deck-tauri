<script lang="ts">
  import Tags from './lib/components/Tags.svelte'
  import { onMount } from 'svelte'
  import { initAlpaca } from './lib/alpaca'
  import { assetSearch } from './lib/alpaca/assetSearch'

  let options = new Map<string, string>()
  let tags: string[] = []

  const placeholder = 'Search for a company'

  const onQuery = async (e: CustomEvent<string>) => {
    if (!e.detail) {
      options = new Map<string, string>()
      return
    }

    const assets = await assetSearch(e.detail)

    const newOptions = new Map<string, string>()

    assets.forEach((x) => {
      newOptions.set(x.symbol, `${x.symbol} ${x.name}`)
    })

    options = newOptions
  }

  const onSelected = (e: CustomEvent<string>) => {
    tags = [...tags, e.detail]
    options = new Map<string, string>()
  }

  const onDeleted = (e: CustomEvent<string>) => {
    tags = tags.filter((tag) => tag !== e.detail)
  }

  onMount(async () => {
    await initAlpaca()
  })
</script>

<main>
  <Tags
    {options}
    {tags}
    {placeholder}
    on:query={onQuery}
    on:selected={onSelected}
    on:deleted={onDeleted}
  />
</main>

<style lang="scss">
  main {
    margin: 1rem 2rem;
  }
</style>