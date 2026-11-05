// pages/adoption/myapplications/myapplications.js
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
const adoption = require('../../../config/adoption.js')
const util = require('../../../utils/util.js')
const analytics = require('../../../utils/analytics.js')

const filters = [
  { label: '全部', status: '' },
  { label: '申请中', status: 'applying' },
  { label: '沟通中', status: 'communicating' },
  { label: '已结束', status: 'ended' }
]

Page({

  data: {
    page: 1,
    size: 20,
    items: [],
    isLoadEnd: false,
    loading: 1,
    loadingMore: false,
    emptyItem: { title: '暂无数据', desc: '请点击重试' },
    filters: filters,
    filterIndex: 0,
    notifications: [],
    busy: false
  },

  onLoad: function () {
    if (util.checkIsNotLogin(true)) {
      return
    }
    this.loadNotifications()
    this.loadList(1)
  },

  onShow: function () {
    if (wx.getStorageSync('token')) {
      analytics.pageView('message_list', { message_list_type: 'my_applications' })
    }
    if (this.hasShown) {
      this.loadNotifications()
      this.loadList(1)
    }
    this.hasShown = true
  },

  onPullDownRefresh: function () {
    var that = this
    Promise.all([
      this.loadNotifications(),
      this.loadList(1)
    ]).then(function () {
      wx.stopPullDownRefresh()
    }).catch(function () {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom: function () {
    this.onBottom()
  },

  onBottom: function () {
    if (this.data.isLoadEnd || this.data.loading !== 2 || this.data.loadingMore) {
      return
    }
    this.setData({ loadingMore: true })
    this.loadList(this.data.page + 1)
  },

  filterTap: function (e) {
    var that = this
    var index = Number(e.currentTarget.dataset.index)
    if (index === this.data.filterIndex) {
      return
    }
    this.setData({
      filterIndex: index,
      items: [],
      page: 1,
      isLoadEnd: false,
      loading: 1,
      loadingMore: false,
      emptyItem: { title: '暂无数据', desc: '请点击重试' }
    }, function () {
      that.loadList(1)
    })
  },

  loadList: function (page) {
    var that = this
    this.listRevision = (this.listRevision || 0) + 1
    var revision = this.listRevision
    if (page === 1 && this.data.loading === 1) {
      wx.showLoading({ title: '正在加载' })
    }
    var query = {
      page: page,
      size: this.data.size
    }
    var filter = this.data.filters[this.data.filterIndex]
    if (filter && filter.status) {
      query.status = filter.status
    }
    return adoption.myApplications(query).then(function (data) {
      if (revision !== that.listRevision) {
        return
      }
      var list = Array.isArray(data.items) ? data.items : []
      var items = list.map(function (item) {
        return adoption.applicationView(item)
      })
      if (page === 1) {
        that.imageRequests = {}
      }
      that.setData({
        page: page,
        items: page === 1 ? items : that.data.items.concat(items),
        loading: 2,
        loadingMore: false,
        isLoadEnd: !adoption.hasMore(data),
        emptyItem: { title: '暂无数据', desc: '请点击重试' }
      })
      that.fillMissingImages(items)
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }).catch(function (error) {
      if (revision !== that.listRevision) {
        return
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
      var hasItems = that.data.items.length > 0
      that.setData({
        loading: 2,
        loadingMore: false
      })
      if (!hasItems) {
        that.setData({
          items: [],
          emptyItem: { title: '网络加载失败', desc: '请检查网络后重试' }
        })
      }
      that.handleError(error, hasItems)
    })
  },

  fillMissingImages: function (items) {
    var that = this
    items.forEach(function (item) {
      if (!item.image && item.topicAvailable && item.topicId > 0) {
        that.fetchTopicImage(item.topicId)
      }
    })
  },

  fetchTopicImage: function (topicId) {
    var that = this
    if (!topicId) {
      return
    }
    this.imageRequests = this.imageRequests || {}
    if (this.imageRequests[topicId]) {
      return
    }
    this.imageRequests[topicId] = true
    var token = wx.getStorageSync('token')
    network({
      url: api.topicDetail,
      data: {
        token: token,
        topic_id: topicId
      }
    }).then(function (res) {
      if (res.data.code != 200) {
        return
      }
      var data = res.data.data || {}
      var image = adoption.firstImage(data.imgs) || adoption.firstImage(data.preview_img)
      if (!image) {
        return
      }
      var items = that.data.items.map(function (item) {
        if (item.topicId === topicId && !item.image) {
          item.image = image
        }
        return item
      })
      that.setData({ items: items })
    }).catch(function () {
      // 保留图片占位，下拉刷新时可再次尝试
    })
  },

  imageError: function (e) {
    var index = Number(e.currentTarget.dataset.index)
    var item = this.data.items[index]
    if (item) {
      this.fetchTopicImage(item.topicId)
    }
  },

  loadNotifications: function () {
    var that = this
    return adoption.notificationBuckets().then(function (buckets) {
      that.setData({
        notifications: buckets.mine
      })
    }).catch(function () {
      // 未读提醒加载失败不阻断申请列表
    })
  },

  notificationTap: function (e) {
    var that = this
    var index = Number(e.currentTarget.dataset.index)
    var item = this.data.notifications[index]
    if (!item || !item.id || this.data.busy) {
      return
    }
    this.setData({ busy: true })
    adoption.readNotification(item.id).then(function () {
      var notifications = that.data.notifications.filter(function (notice) {
        return notice.id !== item.id
      })
      that.setData({
        notifications: notifications,
        busy: false
      })
      wx.showModal({
        title: '申请通知',
        content: item.message,
        showCancel: false,
        confirmText: '知道了'
      })
    }).catch(function (error) {
      that.setData({ busy: false })
      that.handleError(error, 'modal')
    })
  },

  topicClick: function (e) {
    var index = Number(e.currentTarget.dataset.index)
    var item = this.data.items[index]
    if (!item || !item.topicAvailable || item.topicId <= 0) {
      this.showToast('帖子已删除或不可用')
      return
    }
    wx.navigateTo({
      url: '../../homeinfo/topicdetail/topicdetail?topic_id=' + item.topicId
    })
  },

  copyContact: function (e) {
    var that = this
    var id = Number(e.currentTarget.dataset.id)
    if (!id || this.data.busy) {
      return
    }
    this.setData({ busy: true })
    adoption.applicationDetail(id).then(function (data) {
      var view = adoption.applicationView(data)
      if (!view.contact) {
        that.setData({ busy: false })
        that.showToast('联系方式暂不可用')
        return
      }
      var items = that.data.items.map(function (item) {
        return item.id === view.id ? view : item
      })
      that.setData({
        items: items,
        busy: false
      })
      wx.setClipboardData({
        data: view.contact,
        success: function () {
          that.showToast('已复制联系方式')
        }
      })
    }).catch(function (error) {
      that.setData({ busy: false })
      that.handleError(error, 'modal')
      that.loadList(1)
    })
  },

  withdraw: function (e) {
    var that = this
    var id = Number(e.currentTarget.dataset.id)
    if (!id || this.data.busy) {
      return
    }
    wx.showModal({
      title: '放弃申请',
      content: '确认放弃申请吗？',
      cancelText: '取消',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          that.performWithdraw(id)
        }
      }
    })
  },

  performWithdraw: function (id) {
    var that = this
    if (this.data.busy) {
      return
    }
    this.setData({ busy: true })
    adoption.applicationDetail(id).then(function (data) {
      var view = adoption.applicationView(data)
      if (!view.topicOpen || (view.status !== 'applying' && view.status !== 'communicating')) {
        that.setData({ busy: false })
        that.showToast('申请已结束或帖子不可用')
        that.loadList(1)
        return
      }
      return adoption.updateApplication(id, {
        action: 'end',
        version: view.version,
        end_note: ''
      }).then(function () {
        that.setData({ busy: false })
        that.showToast('已放弃申请')
        that.loadList(1)
        that.loadNotifications()
      })
    }).catch(function (error) {
      that.setData({ busy: false })
      that.handleError(error, 'modal')
      that.loadList(1)
    })
  },

  emptyPageClick: function () {
    this.loadList(1)
    this.loadNotifications()
  },

  handleError: function (error, showToast) {
    if (!error) {
      return
    }
    if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'SESSION_CHANGED') {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      analytics.setUser(null)
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    if (showToast === 'modal') {
      wx.showModal({
        title: '操作失败',
        content: error.message || '操作失败，请稍后重试',
        showCancel: false,
        confirmText: '知道了'
      })
    } else if (showToast) {
      this.showToast(error.message || '操作失败，请稍后重试')
    }
  },

  showToast: function (title) {
    wx.showToast({
      title: title,
      icon: 'none'
    })
  },

  onShareAppMessage: function () {

  }
})
