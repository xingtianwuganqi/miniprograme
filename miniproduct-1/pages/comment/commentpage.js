// pages/comment/commentpage.js
import { commentList, replyComment } from '../../config/api.js';
import network from '../../config/network.js'
const api = require('../../config/api.js')
const util = require('../../utils/util.js')
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_id: null,
    topic_type: null,
    topic_uid: null,
    page: 1,
    size: 10,
    items: [],
    bottomHeight: 0,
    inputPlaceholder: "请输入评论",
    inputType: 1, // 1.回复帖子，2.回复评论，3.回复回复
    isFocus: false,
    isLoadEnd: false,
    currentCommentInfo: null,
    currentReplyInfo: null,
    inputText: '',// 输入时的文字
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
    var topic_uid = options.topic_uid
    this.data.topic_id = topic_id
    this.data.topic_type = topic_type
    this.data.topic_uid = topic_uid
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
    util.checkIsLogin() // 检测登录
    var item = e.currentTarget.dataset.id
    this.setData({
      inputType: 2,
      inputPlaceholder:"回复" + item.userInfo.username,
      isFocus: true,
      currentCommentInfo: item,
    })
    // reply_id 与 comment_id 传同一个id
  },
  /**点击回复的回复按钮 */
  replyBtnClick: function(e) {
    util.checkIsLogin()
    // var comment = e.currentTarget.dataset.item
    var reply = e.currentTarget.dataset.id
    // console.log('comment',comment)
    console.log('reply',reply)
    this.setData({
      inputType: 3,
      inputPlaceholder: '回复'+reply.fromInfo.username,
      isFocus: true,
      // currentCommentInfo: comment,
      currentReplyInfo: reply
    })
    // reply_id 与 comment_id 传不同的id
  },
  /**开始输入 */
  inputChange: function(e) {
    var text = e.detail.value
    this.setData({
      isSearching: false,
      inputText: text
    })
  },
  /**点击发送按钮 */
  confirmClick: function(event) {
    util.checkIsLogin() // 检测登录
    // 获取输入的文本
    var text = event.detail.value
    if (text.length == 0) {
      wx.showToast({
        title: '请输入内容',
        icon:'none'
      })
      return 
    }
    if (this.data.inputType == 1) { // 发表评论，回复的帖子
      this.commentAction(text)
    }else if (this.data.inputType == 2) { // 发表的回复，回复的评论
      var comment_id = this.data.currentCommentInfo.comment_id
      var reply_id = comment_id
      var to_uid = this.data.currentCommentInfo.userInfo.id
      this.commentReplyNetworking(text,comment_id,reply_id,to_uid)
    }else if (this.data.inputType == 3) {
      var comment_id = this.data.currentReplyInfo.comment_id
      var reply_id = this.data.currentReplyInfo.id
      var to_uid = this.data.currentReplyInfo.fromInfo.id
      this.commentReplyNetworking(text,comment_id,reply_id,to_uid)
    }
  },
  /**输入框失去焦点 */
  inputDisappear:function(event) {
    this.setData({
      inputType: 1,
      inputPlaceholder:"请输入评论",
      isFocus: false,
      inputText: '',
      currentCommentInfo:null,
      currentReplyInfo:null,
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
  },
  /**发送按钮点击 */
  sendButtonClick(event){
    // 获取输入的文本
    var text = this.data.inputText
    if (text.length == 0) {
       wx.showToast({
        title: '请输入内容',
        icon:'none'
      })
      return 
    }
    
    if (this.data.inputType == 1) { // 发表评论，回复的帖子
      this.commentAction(text)
    }else if (this.data.inputType == 2) { // 发表的回复，回复的评论
      var comment_id = this.data.currentCommentInfo.comment_id
      var reply_id = comment_id
      var to_uid = this.data.currentCommentInfo.userInfo.id
      this.commentReplyNetworking(text,comment_id,reply_id,to_uid)
    }else if (this.data.inputType == 3) {
      var comment_id = this.data.currentReplyInfo.comment_id
      var reply_id = this.data.currentReplyInfo.id
      var to_uid = this.data.currentReplyInfo.fromInfo.id
      this.commentReplyNetworking(text,comment_id,reply_id)
    }
  },
  /** 发表评论 */
  commentAction(text) {
    var that = this
    var token = wx.getStorageSync('token')
    var userInfo = wx.getStorageSync('userInfo')
    var from_uid = userInfo.id
    /**
     * token
     * topic_id
     * content
     * topic_type
     * from_uid
     * to_uid
     */
    var param = {
      'token': token,
      'topic_id': that.data.topic_id,
      'topic_type': that.data.topic_type,// topic_type 回复类型 1.帖子回复，2 秀宠回复
      'content': text,
      'from_uid': from_uid,
      'to_uid': that.data.topic_uid
    }
    network({
      url: api.commentAction,
      data: param
    }).then(res=>{
      console.log('发表评论')
      console.log(res.data)
      if (res.data.code == 200) { // 回复成功，将数据加到数组顶部
        console.log(res.data.data)
        that.data.items.unshift(res.data.data)
        that.setData({
          items: that.data.items
        })
      }
    })
  },

  /**发表回复的网络请求 */
  commentReplyNetworking(text,comment_id,reply_id,to_uid) {
    /**
     * token
     * content
     * comment_id
     * reply_id
     * reply_type
     * to_uid
     * from_uid
     */
    var that = this
    var token = wx.getStorageSync('token')
    var from_uid = wx.getStorageSync('userInfo').id
    var comment_id = comment_id
    var reply_id = reply_id
    var to_uid = to_uid
    var reply_type = 1
    var param = {
      'token': token,
      'content': text,
      'comment_id': comment_id,
      'reply_id': reply_id,
      'reply_type': reply_type,
      'to_uid': to_uid,
      'from_uid': from_uid
    }
    console.log('回复param')
    console.log(param)
    network({
      url:api.replyComment,
      data: param
    }).then(res=>{
      console.log(res.data)
      if (res.data.code == 200) { // 回复成功，将数据插入到replys
        var newItems = that.data.items.map(model=>{
          if (model.comment_id == res.data.data.comment_id) {
            model.replys.unshift(res.data.data)
          }
          return model
        })
        that.setData({
          items: newItems
        })
        
      }else{
        wx.showToast({
          title: '回复失败',
          icon: 'none'
        })
      }
    })
  }
})