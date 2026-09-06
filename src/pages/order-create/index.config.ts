export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '确认订单' })
  : { navigationBarTitleText: '确认订单' }
