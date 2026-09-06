export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '茶品' })
  : { navigationBarTitleText: '茶品' }
