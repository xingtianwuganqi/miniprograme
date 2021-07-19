Page({
 
  data: {
    windowHeight: 0,
    // locationArr: ['山东省', '青岛市', '黄岛区']
    locationArr: ['', '', '']
  },
 
  onLoad: function(options) {
    var that = this
    console.log(options)
    //获得dialog组件
    this.getAddress = this.selectComponent("#getAddress");
 
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.pixelRatio) //设备像素比
        console.log(res.windowWidth) //可使用窗口宽度
        console.log(res.windowHeight) //可使用窗口高度
 
        that.setData({
          windowWidth: res.windowWidth, //可使用窗口宽度
          windowHeight: res.windowHeight, //可使用窗口高度
        })
      }
    })
  },
 
  onShow: function() {
 
  },
 
  //选择地址
  chooseAddress: function(e) {
    var that = this
 
    this.getAddress.showsGoodsDetail();
  },
 
  //组件回调
  resultEvent: function(e) {
    var that = this
 
    console.log(e)
    console.log(e.detail.nameArr)
    that.setData({
      locationArr: e.detail.nameArr
    })
  }
 
})