// pages/homeinfo/searchpage/searchpage.js
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
const app = getApp().globalData;
var token = wx.getStorageSync('token')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSearching: false,
    keywords: null,
    page: 1,
    size: 10,
    items: null,
    searchKeyword: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.keywordsNetworking()
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
    this.onBottom()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
 //触底响应函数
  onBottom(){
    if (this.data.isSearching) {
      this.searchNetworking(this.data.searchKeyword,this.data.page)
    }
  },
  /**搜索关键字 */
  keywordsNetworking: function() {
    var that = this
    network({
      url: api.searchKeyWords,
      method: 'GET'
    }).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        that.setData({
          keywords:res.data.data,
        })
      }
    })
  },
  keywordClick: function(event) {
    var keyword = event.currentTarget.dataset.id
    this.searchNetworking(keyword,1)
  },
  keywordSearch(text){
    this.searchNetworking(text,1)
  },
  searchNetworking(keyword,page) {
    this.data.page = page
    var that = this
    var data = {
      'keyword': keyword,
      'page': that.data.page,
      'size': that.data.size,
    }
    console.log(keyword,data)
    network({
      url: api.searchAction,
      data: data
    }).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        that.setData({
          isSearching: true,
          items: res.data.data,
        })
        that.data.page += 1
      }
    })
  },
  /**开始输入 */
  searchInput: function(e) {
    this.setData({
      isSearching: false
    })
    var value = e.detail.value
    var pos = e.detail.cursor
    var left
    if (pos !== -1) {
      // 光标在中间
      left = e.detail.value.slice(0, pos)
      // 计算光标的位置
      pos = left.replace(/11/g, '2').length
    }

    // 直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
    return {
      value: value.replace(/11/g, '2'),
      cursor: pos
    }
  },
  /**点击搜索 */
  searchBegin: function(event) {
    var keyword = event.detail.value
    console.log(event.detail.value)
    this.data.searchKeyword = keyword
    this.keywordSearch(keyword)
  }
})