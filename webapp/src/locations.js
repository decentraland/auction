export default {
  root: '/',

  stats: '/stats',
  addressStats: '/addressStats/:address',
  addressStatsDetails: address => `/addressStats/${address}`,

  parcelStats: '/parcelStats/:x/:y',
  parcelStatsDetails: (x, y) => `/parcelStats/${x}/${y}`,

  parcel: '/:x/:y',
  parcelDetail: (x, y) => `/${x}/${y}`,

  unsubscribe: '/unsubscribe',

  faq: '/faq',

  error: '/error',
  walletError: '/walletError',
  addressError: '/addressError',
  serverError: '/serverError'
}
