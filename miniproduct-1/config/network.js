export default function(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: options.method || 'POST',
      data: options.data || {},
      success: resolve,
      fail: reject
    })
  })
}