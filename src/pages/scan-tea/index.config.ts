export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '扫码识茶' })
  : { navigationBarTitleText: '扫码识茶' }
