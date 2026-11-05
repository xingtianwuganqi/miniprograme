// pages/message/message.js
const util = require('../../../utils/util.js')
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
const adoption = require('../../../config/adoption.js')
const analytics = require('../../../utils/analytics.js')

function badgeText(value) {
  var count = Number(value) || 0
  if (count > 99) {
    return '99+'
  }
  return count > 0 ? String(count) : ''
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    likeUnread: 0,
    collectUnread: 0,
    commentUnread: 0,
    adoptionMineUnread: 0,
    adoptionReceivedUnread: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      list: [
        { img: '../../../icons/icon_my_appli.png', title: '我的申请', num: '', id: 4 },
        { img: '../../../icons/icon_rec_appli.png', title: '收到的申请', num: '', id: 5 },
        { img: '../../../icons/icon_message_like.png', title: '点赞', num: '', id: 1 },
        { img: '../../../icons/icon_message_collect.png', title: '收藏', num: '', id: 2 },
        { img: '../../../icons/icon_message_com.png', title: '评论', num: '', id: 3 }
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
    analytics.pageView('messages')
    this.refreshUnread(false)
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
    this.refreshUnread(true)
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

  /** 同时刷新原有消息和领养申请未读 */
  refreshUnread: function (fromPull) {
    var that = this
    wx.showNavigationBarLoading()
    return Promise.all([
      this.unreadMsgNumNetworking(),
      this.adoptionUnreadNetworking()
    ]).then(function () {
      wx.hideNavigationBarLoading()
      if (fromPull) {
        wx.stopPullDownRefresh()
      }
    }).catch(function () {
      wx.hideNavigationBarLoading()
      if (fromPull) {
        wx.stopPullDownRefresh()
      }
    })
  },

  /**消息点击 */
  messageClick: function (e) {
    if (util.checkIsNotLogin()) {
      return
    }
    var id = e.currentTarget.dataset.id
    if (id == 4) {
      wx.navigateTo({
        url: '../../adoption/myapplications/myapplications'
      })
    } else if (id == 5) {
      wx.navigateTo({
        url: '../../adoption/receivedapplications/receivedapplications'
      })
    } else if (id == 1 || id == 2 || id == 3) {
      wx.navigateTo({
        url: '../messageinfo/messageinfo?msg_type=' + id
      })
    } else {
      wx.navigateTo({
        url: '../system/systemmsg'
      })
    }
  },

  /** 原有消息未读数 */
  unreadMsgNumNetworking: function () {
    var that = this
    var token = wx.getStorageSync('token')
    if (!token) {
      that.setData({
        likeUnread: 0,
        collectUnread: 0,
        commentUnread: 0
      })
      that.applyUnread()
      return Promise.resolve()
    }
    return network({
      url: api.unreadMsgNum,
      data: {
        token: token
      }
    }).then(function (res) {
      if (res.data.code == 200) {
        var data = res.data.data || {}
        that.setData({
          likeUnread: Number(data.like_unread) || 0,
          collectUnread: Number(data.collec_unread) || 0,
          commentUnread: Number(data.com_unread) || 0
        })
        that.applyUnread()
      }
    }).catch(function () {
      // 保留现有角标，等待下次刷新
    })
  },

  /** 领养申请未读数 */
  adoptionUnreadNetworking: function () {
    var that = this
    var token = wx.getStorageSync('token')
    if (!token) {
      that.setData({
        adoptionMineUnread: 0,
        adoptionReceivedUnread: 0
      })
      that.applyUnread()
      return Promise.resolve()
    }
    return adoption.notificationBuckets().then(function (buckets) {
      that.setData({
        adoptionMineUnread: buckets.mineCount,
        adoptionReceivedUnread: buckets.receivedCount
      })
      that.applyUnread()
    }).catch(function () {
      // 保留现有角标，等待下次刷新
    })
  },

  /** 将各类未读数写入列表和消息 Tab */
  applyUnread: function () {
    var that = this
    var list = this.data.list.map(function (item) {
      if (item.id == 1) {
        item.num = badgeText(that.data.likeUnread)
      } else if (item.id == 2) {
        item.num = badgeText(that.data.collectUnread)
      } else if (item.id == 3) {
        item.num = badgeText(that.data.commentUnread)
      } else if (item.id == 4) {
        item.num = badgeText(that.data.adoptionMineUnread)
      } else if (item.id == 5) {
        item.num = badgeText(that.data.adoptionReceivedUnread)
      }
      return item
    })
    var total = (Number(that.data.likeUnread) || 0) +
      (Number(that.data.collectUnread) || 0) +
      (Number(that.data.commentUnread) || 0) +
      (Number(that.data.adoptionMineUnread) || 0) +
      (Number(that.data.adoptionReceivedUnread) || 0)
    that.setData({
      list: list
    })
    if (total > 99) {
      wx.setTabBarBadge({
        index: 1,
        text: '99+'
      })
    } else if (total > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: String(total)
      })
    } else {
      wx.removeTabBarBadge({
        index: 1
      })
    }
  }
})
