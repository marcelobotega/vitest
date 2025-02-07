import { ensurePackageInstalled } from '../node/pkg'
import type { BrowserProviderModule, ResolvedBrowserOptions } from '../types/browser'

interface Loader {
  root: string
  executeId: (id: string) => any
}

export async function getBrowserProvider(options: ResolvedBrowserOptions, loader: Loader): Promise<BrowserProviderModule> {
  if (options.provider == null || options.provider === 'webdriverio' || options.provider === 'playwright') {
    await ensurePackageInstalled('@vitest/browser', loader.root)
    const providers = await loader.executeId('@vitest/browser/providers') as {
      webdriverio: BrowserProviderModule
      playwright: BrowserProviderModule
    }
    const provider = (options.provider || 'webdriverio') as 'webdriverio' | 'playwright'
    return providers[provider]
  }

  let customProviderModule

  try {
    customProviderModule = await loader.executeId(options.provider) as { default: BrowserProviderModule }
  }
  catch (error) {
    throw new Error(`Failed to load custom BrowserProvider from ${options.provider}`, { cause: error })
  }

  if (customProviderModule.default == null)
    throw new Error(`Custom BrowserProvider loaded from ${options.provider} was not the default export`)

  return customProviderModule.default
}
