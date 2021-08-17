// pages/comment/commentpage.js
import { commentList } from '../../config/api.js';
import network from '../../config/network.js'
const api = require('../../config/api.js')
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_id: null,
    topic_type: null,
    page: 1,
    size: 10,
    items: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var topic_id = options.topic_id
    var topic_type = options.topic_type
    this.data.topic_id = topic_id
    this.data.topic_type = topic_type
    this.commentListNetworking(1)
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
  /**加载评论列表 */
  commentListNetworking(page) {
    this.data.page = page
    var that = this
    network({
      url: api.commentList,
      data: {
        'topic_type': that.data.topic_type,
        'topic_id': that.data.topic_id,
        'page': that.data.page,
        'size': that.data.size
      }
    }).then(res=>{
      console.log('commentList')
      console.log(res.data)
      if (res.data.code == 200 && res.data.data.length > 0) {
        if (page == 1) {
          that.setData({
            items: res.data.data
          })
        }else{
          var orginData = that.data.items
          that.setData({
            items: orginData.concat(res.data.data)
          })
        }
        that.data.page += 1
      }
    })
  }
})