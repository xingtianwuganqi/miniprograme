// pages/messageinfo/messageinfo/messageinfo.js
import network from '../../../config/network.js'
const api = require('../../../config/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    size: 10,
    items: [],
    msg_type: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var msg_type = options.msg_type
    this.data.msg_type = msg_type
    this.messageListNetworking(1)
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
  /**消息列表 */
  messageListNetworking(page) {
    var token = wx.getStorageSync('token')
    var that = this
    that.data.page = page
    network({
      url: api.messageInfo,
      data: {
        'token': token,
        'msg_type': that.data.msg_type,
        'page': page,
        'size': that.data.size
      }
    }).then(res=>{
      console.log(res.data)
      if (res.data.code == 200) {
        if (page == 1) {
          that.setData({
            items: res.data.data
          })
        }else{
          var newItems = res.data.data
          newItems.concat(res.data.data)
          that.setData({
            items: newItems
          })
        }
      }
    })
  }
})