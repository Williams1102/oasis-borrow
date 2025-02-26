import { getCoinbaseTickers } from 'server/services/coinbase'
import { getCoingeckoTickers } from 'server/services/coingecko'
import { getCoinPaprikaTickers } from 'server/services/coinPaprika'

export async function tokenTickers() {
  const results = await Promise.all([
    getCoinPaprikaTickers(),
    getCoinbaseTickers(),
    getCoingeckoTickers(),
  ])
  const mergedTickers = results.reduce((acc, el) => ({ ...acc, ...el }), {})

  return mergedTickers
}
