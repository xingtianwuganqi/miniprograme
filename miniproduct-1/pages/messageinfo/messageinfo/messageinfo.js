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
    msg_type: null,
    content: null,
    isLoadEnd: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var msg_type = options.msg_type
    if (msg_type == 1) {
      this.data.content = "赞了这条帖子"
    }else if (msg_type == 2) {
      this.data.content = "收藏了这条帖子"
    }
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
    this.messageListNetworking(1)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.onBottom()
  },

  onBottom:function() {
    var page = this.data.page
    this.messageListNetworking(page)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**消息列表 */
  messageListNetworking(page) {
    if (this.data.isLoadEnd) {
      return 
    }
    var token = wx.getStorageSync('token')
    var that = this
    that.data.page = page
    wx.showLoading({
      title: '正在加载',
    })
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
      wx.hideLoading()
      if (res.data.code == 200) {
        var datas = res.data.data.map(model =>{
          var newModel = model
          if (that.data.msg_type == 1) {
            newModel.msg_content = "赞了这条帖子"
          }else if (that.data.msg_type == 2) {
            newModel.msg_content = "收藏了这条帖子" 
          }else {
            if (newModel.reply_type == 1) {
              newModel.msg_content = '评论说：' + newModel.commentInfo.content
            }else{
              newModel.msg_content = '回复说：' + newModel.replyInfo.content
            }
          }
          return newModel
        })
        if (page == 1) {
          that.setData({
            items: datas
          })
          if (datas.length == 10) {
            that.data.page = page + 1
          }else{
            that.data.isLoadEnd = true
          }
        }else{
          that.setData({
            items: that.data.concat(datas)
          })
          if (datas.length == 10) {
            that.data.page = page + 1
          }else{
            that.data.isLoadEnd = true
          }
        }
      }
    })
  },
  /**消息点击 跳转帖子详情 */
  messageClick(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../homeinfo/topicdetail/topicdetail?topic_id=' + id,
    })
  }
})