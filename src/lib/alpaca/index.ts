import { options } from '@phoobynet/alpaca-services'
import { invoke } from '@tauri-apps/api'
import { assetRepository } from './assetRepository'

let ready = false

export const initAlpaca = async () => {
  if (ready) return

  const key = 'get_environment_variable'

  try {

    const APCA_API_KEY_ID = await invoke(key,
      { name: 'APCA_API_KEY_ID' })

    const APCA_API_SECRET_KEY = await invoke(key,
      { name: 'APCA_API_SECRET_KEY' })

    options.set({
      key: APCA_API_KEY_ID as string,
      secret: APCA_API_SECRET_KEY as string,
      paper: true,
    })

    options.patch({
      assetRepository
    })
  } catch (e) {
    console.log('Error initializing Alpaca configuration:', e)
  }
}

