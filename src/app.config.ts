export default typeof defineAppConfig === 'function'
  ? defineAppConfig({
    pages: [
      'pages/index/index',
      'pages/products/index',
      'pages/ai-chat/index',
      'pages/profile/index',
      'pages/product-detail/index',
      'pages/order-create/index',
      'pages/order-list/index',
      'pages/scan-tea/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#4a7c59',
      navigationBarTitleText: '茗香茶庄',
      navigationBarTextStyle: 'white',
    },
    tabBar: {
      color: '#999999',
      selectedColor: '#4a7c59',
      backgroundColor: '#ffffff',
      borderStyle: 'black',
      list: [
        {
          pagePath: 'pages/index/index',
          text: '首页',
          iconPath: './assets/tabbar/house.png',
          selectedIconPath: './assets/tabbar/house-active.png',
        },
        {
          pagePath: 'pages/products/index',
          text: '茶品',
          iconPath: './assets/tabbar/leaf.png',
          selectedIconPath: './assets/tabbar/leaf-active.png',
        },
        {
          pagePath: 'pages/ai-chat/index',
          text: 'AI问茶',
          iconPath: './assets/tabbar/message-circle.png',
          selectedIconPath: './assets/tabbar/message-circle-active.png',
        },
        {
          pagePath: 'pages/profile/index',
          text: '我的',
          iconPath: './assets/tabbar/user.png',
          selectedIconPath: './assets/tabbar/user-active.png',
        },
      ],
    },
  })
  : {
    pages: [
      'pages/index/index',
      'pages/products/index',
      'pages/ai-chat/index',
      'pages/profile/index',
      'pages/product-detail/index',
      'pages/order-create/index',
      'pages/order-list/index',
      'pages/scan-tea/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#4a7c59',
      navigationBarTitleText: '茗香茶庄',
      navigationBarTextStyle: 'white',
    },
    tabBar: {
      color: '#999999',
      selectedColor: '#4a7c59',
      backgroundColor: '#ffffff',
      borderStyle: 'black',
      list: [
        {
          pagePath: 'pages/index/index',
          text: '首页',
          iconPath: './assets/tabbar/house.png',
          selectedIconPath: './assets/tabbar/house-active.png',
        },
        {
          pagePath: 'pages/products/index',
          text: '茶品',
          iconPath: './assets/tabbar/leaf.png',
          selectedIconPath: './assets/tabbar/leaf-active.png',
        },
        {
          pagePath: 'pages/ai-chat/index',
          text: 'AI问茶',
          iconPath: './assets/tabbar/message-circle.png',
          selectedIconPath: './assets/tabbar/message-circle-active.png',
        },
        {
          pagePath: 'pages/profile/index',
          text: '我的',
          iconPath: './assets/tabbar/user.png',
          selectedIconPath: './assets/tabbar/user-active.png',
        },
      ],
    },
  }
