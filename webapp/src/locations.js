export default {
  root: '/',

  stats: '/stats',
  addressStats: '/addressStats/:address',
  addressDetails: address => `/addressStats/${address}`,

  parcel: '/:x/:y',
  parcelDetail: (x, y) => `/${x}/${y}`,

  unsubscribe: '/unsubscribe',

  faq: '/faq',

  error: '/error',
  walletError: '/walletError',
  balanceError: '/balanceError',
  addressError: '/addressError',
  serverError: '/serverError'
}
