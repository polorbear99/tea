export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'AI问茶' })
  : { navigationBarTitleText: 'AI问茶' }
