// pages/message/message.js
const util = require('../../../utils/util.js')
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      list: [
        // {img:'../../../icons/icon_message_sys.png',title: '系统消息',num: 0,id: 0},
        {img:'../../../icons/icon_message_like.png',title: '点赞',num: '',id: 1},
        {img:'../../../icons/icon_message_collect.png',title: '收藏',num: '',id: 2},
        {img:'../../../icons/icon_message_com.png',title: '评论',num: '',id: 3},
      ]
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
    this.unreadMsgNumNetworking();
    console.log('onshow')
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
    this.unreadMsgNumNetworking();
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
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
  /**消息点击 */
  messageClick: function(e) {
    if (util.checkIsNotLogin()) {
      return 
    }
    var id = e.currentTarget.dataset.id
    console.log(e)
    if (id == 1 || id == 2 || id == 3) {
      wx.navigateTo({
        url: '../messageinfo/messageinfo?msg_type=' + id,
      })
    }else{
      wx.navigateTo({
        url: '../system/systemmsg',
      })
    }
  },
  unreadMsgNumNetworking() {
    var that = this
    var token = wx.getStorageSync('token')
    if (token == null || token.length == 0) {
      var datas = that.data.list.map(model=>{
        model.num = ''
        return model
      })
      that.setData({
        list:datas
      })
      wx.removeTabBarBadge({
        index: 1,
      })
      return 
    }
    network({
      url: api.unreadMsgNum,
      data: {
        "token": token
      }
    }).then(res=>{
      console.log(res.data.data)
      wx.hideNavigationBarLoading({
        success: (res) => {},
      })
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      if (res.data.code == 200) {
        var like_unread = res.data.data.like_unread
        var collec_unread = res.data.data.collec_unread
        var com_unread = res.data.data.com_unread
        var datas = that.data.list.map(model=>{
          if (model.title == '点赞') {
            if (like_unread > 99) {
              model.num = '99+'
            }else if (like_unread > 0) {
              model.num = like_unread.toString()
            }else{
              model.num = ''
            }
          }else if (model.title == '收藏') {
            if (collec_unread > 99) {
              model.num = '99+'
            }else if (collec_unread > 0) {
              model.num = collec_unread.toString()
            }else{
              model.num = ''
            }
          }else if (model.title == '评论') {
            if (com_unread > 99) {
              model.num = '99+'
            }else if (com_unread > 0) {
              model.num = com_unread.toString()
            }else{
              model.num = ''
            }
          }
          return model
        })
        that.setData({
          list: datas
        })
        let total_num = like_unread + collec_unread + com_unread
        if (total_num > 99) {
          wx.setTabBarBadge({
            index: 1,
            text: '99+',
          })
        }else if (total_num > 0) {
          wx.setTabBarBadge({
            index: 1,
            text: total_num.toString(),
          })
        }else{
          wx.removeTabBarBadge({
            index: 1,
          })
        }
      }
    })
  }
})