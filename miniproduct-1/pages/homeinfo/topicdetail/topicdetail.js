// pages/TopicDetail/TopicDetail.js
const app = getApp().globalData;
const util = require('../../../utils/util.js')
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topicInfo: null,
    bottomHeight: null,
    contactStatus: 0, // 0 点击获取联系方式，1 显示联系方式，2 已完成领养
    contactInfo: '点击获取联系方式'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.isFullScreen) {
      this.setData({
        bottomHeight: 210
      })
    }else{
      this.setData({
        bottomHeight: 180
      })
    }
    console.log(options);
    var topic_id = options.topic_id;
    this.topicDetailNetworking(topic_id);
    this.addViewHistoryNetworking(topic_id);
  },

  topicDetailNetworking: function (topic_id) {
    let that = this;
    var token = wx.getStorageSync('token')
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: app.baseUrl + '/api/v1/topicdetail/',
      data:{
        'topic_id':topic_id,
        'token': token
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success(res){
        console.log(res.data);
        wx.hideLoading({
          success: (res) => {},
        })
        if (res.data.code == 200) {
          var contactStatus = 0
          var contactInfo = ''
          if (res.data.data.is_complete == true) {
            contactStatus = 2
            contactInfo = '已完成领养'
          }else if (res.data.data.getedcontact == true && res.data.data.is_complete == false) {
            contactStatus = 1
            contactInfo = res.data.data.contact_info
          }else{
            contactStatus = 0
            contactInfo = "点击获取联系方式"
          }
          that.setData({
            topicInfo: res.data.data,
            contactStatus: contactStatus,
            contactInfo: contactInfo
          })
        }
      },fail(error){
        wx.hideLoading({
          success: (res) => {},
        })
      }
    });
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
  /**点赞按钮点击 */
  likeButtonClick:function(event) {
    if (util.checkIsNotLogin()) {
      return 
    }
    var topic_id = event.currentTarget.dataset.id
    var mark = event.currentTarget.dataset.mark
    var token = wx.getStorageSync('token')
    console.log('topicid',topic_id,'likeMark:',mark,'token:',token)
    
    this.likeNetworking(topic_id,mark,token);
    
  },
  likeNetworking:function(id,likeMark,token) {
    var that = this;
    var mark = 0
    if (likeMark == true) {
      mark = 1
    }
    console.log('topicid',id,'likeMark:',mark,'token:',token)
    network({
      url: api.LikeAction,
      data: {
        'token': token,
        'like_mark': mark,
        'topic_id': id
      }
    }).then(res => {
      if (res.data.code == 200) {
        // 点赞成功
        that.changeLikeStatus(mark)
      }
    })
  },
  /**改变点赞状态 */
  changeLikeStatus(mark) {
    var newItem = this.data.topicInfo
    if (mark == 1) {
      newItem.liked = true
      newItem.likes_num = newItem.likes_num += 1
    }else{
      newItem.liked = false
      if (newItem.likes_num >= 1) {
        newItem.likes_num = newItem.likes_num -= 1
      }else{
        newItem.likes_num = 0
      }
    }
    this.setData({
      topicInfo: newItem
    })
    // 回调
    let eventChannel = this.getOpenerEventChannel()
    // statusChanged 这个方法需要上一个页面的支持, 上一个页面在navigateTo方法中的events数据中定义这个方法来接收数据
    var dic = {
      'type': 'like',
      'mark': mark,
      'topic_id': this.data.topicInfo.topic_id
    }
    eventChannel.emit('statusChanged', dic)
  },
  /** 收藏按钮点击 */
  collectButtonClick: function(event) {
    if (util.checkIsNotLogin()) {
      return 
    }
    var topic_id = event.currentTarget.dataset.id
    var mark = event.currentTarget.dataset.mark
    var token = wx.getStorageSync('token')
    this.collectNetworking(topic_id,mark,token);
    
  },
  /**收藏网络请求 */
  collectNetworking:function(id,collect_mark,token) {
    
    var that = this;
    var mark = 0
    if (collect_mark == true) {
      mark = 1
    }
    network({
      url: api.collectionAction,
      data: {
        'token': token,
        'collect_mark': mark,
        'topic_id': id
      }
    }).then(res => {
      if (res.data.code == 200) {
        that.changeCollectionStatus(mark)
      }
    }) 
  },
  /**改变收藏状态 */
  changeCollectionStatus(mark) {
    var newItem = this.data.topicInfo
    if (mark == 1) {
      newItem.collectioned = true
      newItem.collection_num = newItem.collection_num += 1
    }else{
      newItem.collectioned = false
      if (newItem.collection_num >= 1) {
        newItem.collection_num = newItem.collection_num -= 1
      }else{
        newItem.collection_num = 0
      }
    }
    this.setData({
      topicInfo: newItem
    })
    // 回调
    let eventChannel = this.getOpenerEventChannel()
    // statusChanged 这个方法需要上一个页面的支持, 上一个页面在navigateTo方法中的events数据中定义这个方法来接收数据
    var dic = {
      'type': 'collect',
      'mark': mark,
      'topic_id': this.data.topicInfo.topic_id
    }
    eventChannel.emit('statusChanged', dic)
  },
  /**点击了评论按钮 */
  commentBtnClick(e) {
    var item = e.currentTarget.dataset.id
    var id = item.topic_id
    var topic_uid = item.userInfo.id;
    wx.navigateTo({
      url: '../../comment/commentpage?topic_id='+id+'&topic_type='+'1'+'&topic_uid='+topic_uid,
    })
  },
  /**获取联系方式 */
  getContactNetworking() {
    // 验证登录
    if (util.checkIsNotLogin()) {
      return 
    }
    var that = this;
    if (that.data.contactStatus == 1) {
      // copy到剪贴板
      wx.setClipboardData({
        data: that.data.contactInfo,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '复制成功',
                icon: 'none'
              })
            }
          })
        }
      })
      return 
    }
    if (this.data.contactStatus == 2) {
      wx.showToast({
        title: '已完成领养',
        icon: 'none'
      })
      return 
    }
    if (util.checkIsNotLogin()) {
      return 
    }
    var token = wx.getStorageSync('token')
    network({
      url: api.getContact,
      data: {
        'token': token,
        'topic_id': that.data.topicInfo.topic_id,
      }
    }).then(res => {
      if (res.data.code == 200) {
        console.log(res.data)
        // 获取联系方式成功
        var newItem = that.data.topicInfo
        newItem.contact_info = res.data.data.contact
        newItem.getedcontact = true
        that.setData({
          topicInfo: newItem,
          contactStatus: 1,
          contactInfo: res.data.data.contact
        })
      }
    })
  },
  addViewHistoryNetworking(topic_id) {
    var token = wx.getStorageSync('token')
    if (token.length > 0) {
      network({
        url: api.addViewHistory,
        data: {
          'token': token,
          'topic_id': topic_id
        }
      }).then(res=>{
        console.log(res.data,'====')
        console.log('addHistorySuccess')
      })
    }
  },
  /** 图片点击 */
  imgClick(e) {
    var imgUrl = e.currentTarget.dataset.id
    var current = app.imgBaseUrl + imgUrl
    var that = this
    var imgs = that.data.topicInfo.imgs
    var allImgs = imgs.map(res => {
      return app.imgBaseUrl + res
    })
    wx.previewImage({
      urls: allImgs,
      current: current
    })
  }
})