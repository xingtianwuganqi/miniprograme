// pages/comment/commentpage.js
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
    items: [],
    bottomHeight: 0,
    inputPlaceholder: "请输入评论",
    inputType: 1, // 1.回复帖子，2.回复其他人
    isFocus: false,
    isLoadEnd: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.data.bottomHeight)
    if (app.isFullScreen) {
      this.setData({
        bottomHeight: 150
      })
    }else{
      this.setData({
        bottomHeight: 100
      })
    }
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
    this.onBottom()
  },

  //触底响应函数
  onBottom(){
    if (this.data.isLoadEnd == true) {
      return 
    }
    this.commentListNetworking(this.data.page);
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
    wx.showLoading({
      title: '正在加载',
    })
    network({
      url: api.commentList,
      data: {
        'topic_type': that.data.topic_type,
        'topic_id': that.data.topic_id,
        'page': that.data.page,
        'size': that.data.size
      }
    }).then(res=>{
      wx.hideLoading({
        success: (res) => {},
      })
      console.log('commentList')
      console.log(res.data)
      if (res.data.code == 200 && res.data.data.length > 0) {
        var datas = res.data.data
        datas = datas.map(data => {
          data['next'] = 2
          if (data.reply_count > data.replys.length) {
            data['isOpen'] = false
          }else{
            data['isOpen'] = true
          }
          return data
        })
        if (page == 1) {
          that.setData({
            items: datas
          })
        }else{
          var orginData = that.data.items
          that.setData({
            items: orginData.concat(datas)
          })
        }
        that.data.page += 1
        if (res.data.data.length < 10) {
          that.data.isLoadEnd = true
        }
      }
    })
  },
  /**点击评论的回复按钮 */
  commentBtnClick:function(e) {
    var item = e.currentTarget.dataset.id
    this.setData({
      inputType: 2,
      inputPlaceholder:"回复" + item.userInfo.username,
      isFocus: true
    })
  },
  /**点击回复的回复按钮 */
  replyBtnClick: function(e) {
    var item = e.currentTarget.dataset.id
    this.setData({
      inputType: 2,
      inputPlaceholder: '回复'+item.fromInfo.username,
      isFocus: true
    })
  },
  /**开始输入 */
  inputChange: function(e) {
    this.setData({
      isSearching: false
    })
  },
  /**点击搜索按钮 */
  confirmClick: function(event) {
    var keyword = event.detail.value
    console.log(event.detail.value)
    this.data.searchKeyword = keyword
    this.keywordSearch(keyword)
    this.setData({
      isLoadEnd: false
    })
  },
  /**输入框失去焦点 */
  inputDisappear:function(event) {
    this.setData({
      inputType: 1,
      inputPlaceholder:"请输入评论",
      isFocus: false
    })
  },
  /**加载更多回复 */
  loadMoreReply(commentItem) {
    var item = commentItem.currentTarget.dataset.id
    var next_page = item.next
    var commentId = item.comment_id
    console.log(next_page,commentId)
    var that = this
    network({
      url: api.loadMoreReply,
      data: {
        "comment_id": commentId,
        "page": next_page
      }
    }).then(res=> {
      // 将加载的回复添加到数据源
      console.log(res.data)
      if (res.data.code == 200 && res.data.data.length > 0) {
        var datas = that.data.items
        datas = datas.map(data => { 
          if (data.comment_id == commentId) {
            var newData = data
            var newReplys = newData.replys.concat(res.data.data)
            newData.replys = newReplys
            if (newData.reply_count > newReplys.length) {
              newData['isOpen'] = false
            }else{
              newData['isOpen'] = true
            }
            newData['next'] = newData.next + 1
            return newData
          }else{
            return data
          }
        })
        that.setData({
          items: datas
        })
      }
    })
  }
})