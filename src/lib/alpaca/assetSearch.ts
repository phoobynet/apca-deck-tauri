import { type Asset, getAssets } from '@phoobynet/alpaca-services'
import Fuse from 'fuse.js'

let fuse: Fuse<Asset>

export const assetSearch = async (query: string = ''): Promise<Asset[]> => {
  if (!fuse) {
    const assets = await getAssets()

    fuse = new Fuse<Asset>(assets, {
      keys: ['symbol', 'name'],
    })
  }

  return fuse.search(query, {
    limit: 20,
  }).flatMap(({ item }) => item)
}