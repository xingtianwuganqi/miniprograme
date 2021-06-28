// pages/homepage/homepage.js
let page = 1;
let size = 10
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.listNetworking(page)
  },

  listNetworking: function(page) {
    var that = this;
    wx.request({
      url: 'https://test.rxswift.cn/api/v1/topiclist/',
      data:{
        'page':page,
        'size': size,
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success(res) {
          console.log(res.data)
          if (res.data['code'] == 200) {
            that.setData({
              items: res.data.data,
            })
          }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})