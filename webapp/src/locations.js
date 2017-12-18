export default {
  root: '/',

  parcel: '/:x/:y',
  parcelDetail: (x, y) => `/${x}/${y}`,

  unsubscribe: '/unsubscribe',

  stats: '/stats',
  addressStats: '/stats/:address',

  faq: '/faq',

  error: '/error',
  walletError: '/walletError',
  addressError: '/addressError',
  serverError: '/serverError'
}
