export default function(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: options.method || 'POST',
      data: options.data || {},
      success: (res) => {
        if (res.data.code == 401) {
          console.log('认证有误')
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.navigateTo({
            url: '../../login/login',
          })
          wx.showToast({
            title: '认证有误',
            icon: "none"
          })
          return 
        }
        resolve(res)
      },
      fail: reject
    })
  })
}