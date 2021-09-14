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
    searchKeyword: '',
    isLoadEnd: false,
    isEmpty: false
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
    // this.onBottom()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
//  //触底响应函数
//   onBottom(){
//     if (this.data.isSearching) {
//       this.searchNetworking(this.data.searchKeyword,this.data.page)
//     }
//   },
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
    this.setData({
      searchKeyword: keyword
    })
  },
  keywordSearch(text){
    this.searchNetworking(text,1)
    this.setData({
      isLoadEnd: false
    })
  },
  searchNetworking(keyword,page) {
    this.data.page = page
    var that = this
    var token = wx.getStorageSync('token')
    var data = {
      'keyword': keyword,
      'page': that.data.page,
      'size': that.data.size,
      'token': token
    }
    console.log(keyword,data)
    wx.showLoading({
      title: '正在加载',
    })
    network({
      url: api.searchAction,
      data: data
    }).then(res => {
      console.log(res.data)
      wx.hideLoading()
      if (res.data.code == 200) {
        if (page == 1) {
          if (res.data.data.length > 0) {
            that.setData({
              isSearching: true,
              items: res.data.data,
            })
            that.data.page += 1

          }else{
            that.setData({
              isEmpty: true
            })
          }
        }else{
          if (res.data.data.length > 0) {
            var orginData = that.data.items;
            that.setData({
              isSearching: true,
              items: orginData.concat(res.data.data)
            })
            that.data.page += 1

          }else{
            that.setData({
              isLoadEnd: true
            })
          }
        }
      }
      
    })
  },
  /**开始输入 */
  searchInput: function(e) {
    this.setData({
      isSearching: false
    })
  },
  /**点击搜索 */
  searchBegin: function(event) {
    var keyword = event.detail.value
    console.log(event.detail.value)
    this.data.searchKeyword = keyword
    this.keywordSearch(keyword)
    this.setData({
      isLoadEnd: false
    })
  },
  /**加载更多 */
  loadMore: function() {
    if (this.data.isSearching) {
      if (this.data.isLoadEnd==true) {
        return 
      }
      this.searchNetworking(this.data.searchKeyword,this.data.page)
    }
  },

  /**触发点赞 */
  likeMarkAction(e) {
    var id = e.detail.topic
    var mark = e.detail.mark
    var items = this.data.items.map((item) =>{
      if (item.topic_id == id) {
        var newItem = item
        if (mark == 1) {
          newItem.liked = true
          newItem.likes_num = newItem.likes_num + 1
        }else{
          newItem.liked = false
          if (newItem.likes_num > 0) {
            newItem.likes_num = newItem.likes_num - 1
          }
        }
        return newItem
      }else{
        return item
      }
    })
    this.setData({
      items: items
    })
  },
  collectMarkAcion(e) {
    var id = e.detail.topic
    var mark = e.detail.mark
    var items = this.data.items.map((item) =>{
      if (item.topic_id == id) {
        var newItem = item
        if (mark == 1) {
          newItem.collectioned = true
          newItem.collection_num = newItem.collection_num + 1
        }else{
          newItem.collectioned = false
          if (newItem.collection_num > 0) {
            newItem.collection_num = newItem.collection_num - 1
          }
        }
        return newItem
      }else{
        return item
      }
    })
    this.setData({
      items: items
    })
  },
  /**点击了评论按钮 */
  commentBtnClick(e) {
    var item = e.detail.topic
    var id = item.topic_id
    var topic_uid = item.userInfo.id
    console.log('id 的值为',id)
    wx.navigateTo({
      url: '../../comment/commentpage?topic_id='+id+'&topic_type='+'1'+'&topic_uid='+topic_uid,
    })
  },
  /**整个cell点击 */
  cellDidSelect(e) {
    var id = e.detail.topic
    console.log('id 的值为',id)
    var that = this
    wx.navigateTo({
      url: '../../homeinfo/topicdetail/topicdetail?topic_id=' + id,
      events: {
        statusChanged: (item) => {
          that.topicItemStatusChanged(item)
        }
      }
    })
  },
  /**更多按钮点击 */
  moreButtonClick(e) {
    var id = e.detail.topic
    console.log(id)
    wx.navigateTo({
      url: '../../myinfo/reportpage/reportpage?report_id=' + id,
    })
  },
})