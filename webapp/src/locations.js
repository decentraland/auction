export default {
  root: '/',

  parcel: '/:x/:y',
  parcelDetail: (x, y) => `/${x}/${y}`,

  unsubscribe: '/unsubscribe',

  stats: '/stats',

  error: '/error',
  walletError: '/walletError',
  addressError: '/addressError',
  serverError: '/serverError',
  faq: '/faq'
}
