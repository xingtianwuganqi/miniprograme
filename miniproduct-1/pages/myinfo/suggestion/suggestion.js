// pages/myinfo/suggestion/suggestion.js
const api = require('../../../config/api.js')
import network from '../../../config/network'
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: null,
    contact: null,
    contactFocus: false,
    contactFocus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  /**监测内容输入 */
  bindTextAreaBlur: function(e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },
  /**监测联系方式输入 */
  contactInput:function(e){
    console.log(e.detail.value);
    this.setData({
      contact:e.detail.value
    })
  },
  /**确定按钮点击 */
  contentConfirmClick(e) {
    this.setData({
      contentFocus: false,
      contactFocus: false
    })
  },
  /**确认按钮点击 */
  contactConfirmClick(e) {
    this.setData({
      contentFocus: false,
      contactFocus: false
    })
  },
  /**提交意见网络请求 */
  suggestionNetworking() {
    this.setData({
      contentFocus: false,
      contactFocus: false
    })
    if (util.checkIsNotLogin()) {
      return 
    }
    if (this.data.content == null || this.data.content.length == 0) {
      wx.showToast({
        title: '请输入意见或建议',
        icon: 'none'
      })
      return 
    }
    if (this.data.contact == null || this.data.contact.length == 0) {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      })
      return 
    }
    var that = this
    var token = wx.getStorageSync('token')
    var data = {
      'token': token,
      'content': that.data.content,
      'contact': that.data.contact,
      'phone_type': 'miniprograme'
    }
    wx.showLoading({
      title: '提交中',
    })
    network({
      url: api.suggestion,
      data: data
    }).then(res=>{
      wx.hideLoading({
        success: (res) => {},
      })
      console.log(res.data)
      if (res.data.code == 200) {
        wx.showToast({
          title: '提交成功',
        })
        setTimeout( function() {
          wx.navigateBack({
            delta: 1,
          })
        },1500)
      }else{
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        })
      }
    })
  }
})