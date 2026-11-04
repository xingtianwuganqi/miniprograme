// pages/TopicDetail/TopicDetail.js
const app = getApp().globalData;
const util = require('../../../utils/util.js')
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
const adoption = require('../../../config/adoption.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic_id: null,
    topicInfo: null,
    bottomHeight: null,
    adoptionState: null,
    adoptionStateError: null,
    adoptionTitle: '申请领养',
    adoptionBusy: false,
    showApplyNotice: false,
    showApplicationPanel: false,
    applicationPanelTitle: '',
    applicationPanelMessage: '',
    applicationPanelContact: '',
    applicationPanelCanReapply: false
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
    this.data.topic_id = topic_id
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
      url: api.topicDetail,
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
          that.setData({
            topicInfo: res.data.data
          })
          that.renderAdoptionTitle()
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
    // 从登录、领养资料页或后台返回时重新查询申请状态
    if (!this.data.adoptionBusy) {
      this.refreshAdoptionState().catch(function () {})
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 离开页面时清理私人联系面板，避免再次进入时继续展示
    this.pendingProfile = null
    this.currentApplication = null
    this.setData({
      showApplyNotice: false,
      showApplicationPanel: false,
      applicationPanelContact: '',
      applicationPanelCanReapply: false
    })
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
    var id = this.data.topic_id
    var path = '/pages/homeinfo/topicdetail/topicdetail?topic_id=' + id
    console.log(path)
    var imgUrl = ''
    if (this.data.topicInfo.imgs.length > 0) {
      imgUrl = 'http://img.rxswift.cn/' + this.data.topicInfo.imgs[0]
    }
    return {
      title: this.data.topicInfo.content,
      path: path,
      imageUrl: imgUrl
    }
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
  /** 根据服务端申请状态刷新底部按钮文案 */
  renderAdoptionTitle() {
    var token = wx.getStorageSync('token')
    var complete = this.data.topicInfo != null && this.data.topicInfo.is_complete == true
    var title = ''
    if (!token) {
      title = complete ? '送养已结束' : '申请领养'
    } else if (this.data.adoptionStateError) {
      title = this.data.adoptionStateError.status === 404 ? '帖子不可用' : '状态加载失败 · 重试'
    } else if (this.data.adoptionState) {
      title = adoption.stateTitle(this.data.adoptionState)
    } else {
      title = '正在查询状态'
    }
    this.setData({
      adoptionTitle: title
    })
  },

  /** 查询当前帖子的领养申请状态 */
  refreshAdoptionState() {
    var that = this
    var token = wx.getStorageSync('token')
    if (!token) {
      that.setData({
        adoptionState: null,
        adoptionStateError: null
      })
      that.renderAdoptionTitle()
      return Promise.resolve()
    }
    return adoption.applicationState(that.data.topic_id).then(function (data) {
      that.setData({
        adoptionState: adoption.stateFrom(data),
        adoptionStateError: null
      })
      that.renderAdoptionTitle()
      return data
    }).catch(function (error) {
      that.setData({
        adoptionState: null,
        adoptionStateError: error
      })
      that.renderAdoptionTitle()
      throw error
    })
  },

  /** 申请领养按钮点击 */
  adoptionButtonClick() {
    var that = this
    if (this.data.adoptionBusy) {
      return
    }
    if (util.checkIsNotLogin()) {
      return
    }
    if (this.data.topicInfo == null) {
      return
    }
    this.setData({ adoptionBusy: true })
    this.renderAdoptionTitle()
    this.refreshAdoptionState().then(function () {
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      var state = that.data.adoptionState
      if (!state) {
        return
      }
      if (state.owner) {
        that.manageAdoption()
        return
      }
      if (state.workflowEnded) {
        that.showToast('送养已结束，无法提交新申请')
        return
      }
      if (state.workflowStatus !== 'open') {
        that.showToast('帖子状态暂不可用，请稍后重试')
        return
      }
      switch (state.status) {
        case 'applying':
        case 'communicating':
        case 'ended':
          that.openApplicationPanel()
          break
        default:
          if (state.canApply) {
            that.loadAdoptionProfile()
          } else {
            that.showToast('当前暂不可提交申请，请稍后重试')
          }
      }
    }).catch(function (error) {
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      that.handleAdoptionError(error, '申请领养')
    })
  },

  /** 检查本人领养资料 */
  loadAdoptionProfile() {
    var that = this
    if (this.data.adoptionBusy) {
      return
    }
    this.setData({ adoptionBusy: true })
    this.renderAdoptionTitle()
    adoption.adoptionProfile().then(function (data) {
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      var profile = adoption.profileFrom(data)
      if (data.is_complete == true && adoption.profileValid(profile)) {
        that.pendingProfile = profile
        that.setData({ showApplyNotice: true })
      } else {
        that.requireAdoptionProfile()
      }
    }).catch(function (error) {
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      that.handleAdoptionError(error, '申请领养')
    })
  },

  /** 没有资料或资料不完整时提示填写 */
  requireAdoptionProfile() {
    wx.showModal({
      title: '领养资料',
      content: '没有领养资料，需要填写后再申请。',
      cancelText: '取消',
      confirmText: '去申请',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/adoption/profile/profile'
          })
        }
      }
    })
  },

  /** 关闭领养须知 */
  closeApplyNotice() {
    this.pendingProfile = null
    this.setData({ showApplyNotice: false })
  },

  /** 查看领养说明 */
  openInstruction() {
    this.pendingProfile = null
    this.setData({ showApplyNotice: false })
    wx.navigateTo({
      url: '/pages/myinfo/instruction/instruction'
    })
  },

  /** 确认领养须知后提交申请 */
  confirmApply() {
    var profile = this.pendingProfile
    this.setData({ showApplyNotice: false })
    if (profile) {
      this.submitAdoptionApplication(profile)
    }
  },

  /** 提交领养申请 */
  submitAdoptionApplication(profile) {
    var that = this
    var state = this.data.adoptionState
    if (this.data.adoptionBusy || !state || !state.canApply) {
      return
    }
    var body = {
      profile_version: profile.version,
      statement: ''
    }
    var applicationID = state.id
    if (this.submittedApplicationID !== applicationID ||
        !this.submittedBody ||
        this.submittedBody.profile_version !== body.profile_version ||
        this.submittedBody.statement !== body.statement) {
      this.idempotencyKey = adoption.uuid()
    }
    if (!this.idempotencyKey) {
      this.idempotencyKey = adoption.uuid()
    }
    this.submittedBody = body
    this.submittedApplicationID = applicationID
    this.setData({ adoptionBusy: true })
    this.renderAdoptionTitle()
    adoption.submitApplication(this.data.topic_id, body, this.idempotencyKey).then(function (data) {
      that.idempotencyKey = null
      that.submittedBody = null
      that.submittedApplicationID = null
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      that.refreshAdoptionState().catch(function () {})
      var application = adoption.applicationFrom(data)
      if (!adoption.applicationActive(application)) {
        wx.showModal({
          title: '申请状态已变化',
          content: '未创建新的有效申请，请刷新后重新申请。',
          showCancel: false,
          confirmText: '知道了'
        })
        return
      }
      if (application.status === 'applying') {
        that.showToast('申请成功，等待送养人反馈。')
      } else {
        that.showSubmittedContact(application)
      }
    }).catch(function (error) {
      that.setData({ adoptionBusy: false })
      that.renderAdoptionTitle()
      that.refreshAdoptionState().catch(function () {})
      that.handleSubmissionError(error)
    })
  },

  /** 申请成功后展示已授权联系方式 */
  showSubmittedContact(application) {
    var contact = adoption.applicationContact(application)
    var message = contact ? '可联系送养人\n送养人联系方式：' + contact : '申请成功，联系方式暂不可用，请稍后在「我的申请」中查看。'
    if (!contact) {
      wx.showModal({
        title: '申请成功',
        content: message,
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    wx.showModal({
      title: '申请成功',
      content: message,
      cancelText: '关闭',
      confirmText: '复制',
      success: function (res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: contact,
            success: function () {
              wx.showToast({
                title: '已复制联系方式',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  /** 查看本人当前申请或申请结果 */
  openApplicationPanel() {
    var that = this
    var state = this.data.adoptionState
    if (!state || state.id <= 0) {
      return
    }
    wx.showLoading({
      title: '正在加载'
    })
    adoption.applicationDetail(state.id).then(function (data) {
      wx.hideLoading()
      var application = adoption.applicationFrom(data)
      var statusText = adoption.applicationStatusText(application)
      var message = application.status === 'applying' ? '已申请，等待送养人同意' :
        application.status === 'communicating' ? '可联系送养人' : statusText
      var contact = adoption.applicationContact(application)
      that.currentApplication = application
      that.setData({
        showApplicationPanel: true,
        applicationPanelTitle: statusText,
        applicationPanelMessage: message + (contact ? '\n送养人联系方式：' + contact : ''),
        applicationPanelContact: contact,
        applicationPanelCanReapply: application.status === 'ended' && state.canApply && application.result === 'not_completed'
      })
    }).catch(function (error) {
      wx.hideLoading()
      that.handleAdoptionError(error, '申请详情')
      that.refreshAdoptionState().catch(function () {})
    })
  },

  /** 关闭申请状态面板 */
  closeApplicationPanel() {
    this.currentApplication = null
    this.setData({
      showApplicationPanel: false,
      applicationPanelContact: '',
      applicationPanelCanReapply: false
    })
  },

  /** 复制已授权联系方式，复制前重新拉取申请详情 */
  copyApplicationContact() {
    var that = this
    var state = this.data.adoptionState
    if (!state || state.id <= 0) {
      return
    }
    adoption.applicationDetail(state.id).then(function (data) {
      var contact = adoption.applicationContact(adoption.applicationFrom(data))
      if (!contact) {
        that.showToast('联系方式暂不可用')
        that.refreshAdoptionState().catch(function () {})
        return
      }
      wx.setClipboardData({
        data: contact,
        success: function () {
          wx.showToast({
            title: '已复制联系方式',
            icon: 'none'
          })
        }
      })
    }).catch(function (error) {
      that.handleAdoptionError(error, '联系方式')
      that.refreshAdoptionState().catch(function () {})
    })
  },

  /** 未完成送养时重新申请 */
  reapplyApplication() {
    this.setData({
      showApplicationPanel: false,
      applicationPanelContact: '',
      applicationPanelCanReapply: false
    })
    this.loadAdoptionProfile()
  },

  /** 本人发布：管理申请 */
  manageAdoption() {
    wx.navigateTo({
      url: '/pages/adoption/receivedapplications/receivedapplications?topic_id=' + this.data.topic_id
    })
  },

  /** 统一处理 V2 错误 */
  handleAdoptionError(error, title) {
    if (!error) {
      return
    }
    if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'SESSION_CHANGED') {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    var content = error.message
    if (error.code === 'BLACKLISTED' || error.businessCode === 202) {
      if (content === '操作失败，请刷新重试' || content === '拒绝访问') {
        content = '当前账号受限制，无法申请领养。'
      }
    } else if (content === '操作失败，请刷新重试' || !content) {
      content = '申请失败，请稍后重试。'
    }
    wx.showModal({
      title: title || '操作失败',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /** 提交申请失败的细分处理 */
  handleSubmissionError(error) {
    if (!error) {
      return
    }
    if (error.code === 'PROFILE_REQUIRED') {
      this.requireAdoptionProfile()
      return
    }
    if (error.code === 'PROFILE_CHANGED') {
      this.idempotencyKey = null
      this.submittedBody = null
      this.submittedApplicationID = null
      wx.showModal({
        title: '资料已更新',
        content: '领养资料已变化，请重新点击申请领养。',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    this.handleAdoptionError(error, '申请失败')
  },

  showToast(title) {
    wx.showToast({
      title: title,
      icon: 'none'
    })
  },
  addViewHistoryNetworking(topic_id) {
    var token = wx.getStorageSync('token')
    if (token.length > 0) {
      // network({
      //   url: api.addViewHistory,
      //   data: {
      //     'token': token,
      //     'topic_id': topic_id
      //   }
      // }).then(res=>{
      //   console.log(res.data,'====')
      //   console.log('addHistorySuccess')
      // })
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