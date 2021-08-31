// pages/myinfo/userinfo/userinfo.js
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {img:'../../../icons/icon_view_hist.png',title: '浏览记录',num: 0,id: 1},
      {img:'../../../icons/icon_mi_publish.png',title: '我的发布',num: 0,id: 2},
      {img:'../../../icons/icon_mi_collection.png',title: '我的收藏',num: 0,id: 3},
      {img:'../../../icons/icon_mi_xy.png',title: '用户协议',num: 0,id: 1},
      {img:'../../../icons/icon_pravicy.png',title: '隐私政策',num: 0,id: 2},
      {img:'../../../icons/icon_mi_about.png',title: '关于我们',num: 0,id: 3},
    ],
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userinfo = wx.getStorageSync('userInfo')
    if (userinfo != null) {
      this.setData({
        userInfo: userinfo
      })
    }
    
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
  /**点击登录 */
  userInfoClick: function() {
    util.checkIsLogin()
  }
})