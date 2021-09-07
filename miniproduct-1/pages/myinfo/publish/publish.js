// pages/myinfo/publish/publish.js
const api = require("../../../config/api")
const { default: network } = require("../../../config/network")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    size: 10,
    items: [],
    isLoadEnd: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.publishListNetworking(1)
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
    this.publishListNetworking(1)
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
  /**上拉刷新 */
  onBottom() {
    if (this.data.isLoadEnd == true) {
      return
    }
    this.publishListNetworking(this.data.page)
  },
  /**列表网络请求 */
  publishListNetworking(page) {
    
    var that = this
    that.page = page
    var token = wx.getStorageSync('token')
    var data = {
      'token': token,
      'page': page,
      'size': that.data.size
    }
    console.log(data)
    network({
      url:api.authPublish,
      data: data
    }).then(res => {
      console.log('======--------======')
      console.log(res.data.data.length)
      // 停止刷新
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      if (res.data.code == 200) {
        if (page == 1) {
          that.setData({
            items: res.data.data
          })
        }else{
          var datas = that.data.items
          that.setData({
            items: datas.concat(res.data.data)
          })
        }
        if (res.data.data.length < 10) {
          that.data.isLoadEnd = true
          console.log("eee")
        }else{
          that.data.page += 1
        }
      }
    })
  },
  /**触发点赞 */
  likeMarkAction(e) {
    var id = e.detail.topic
    var mark = e.detail.mark
    console.log('id:',id,'mark:',mark)
    console.log('this.items的count',this.data.items.length)
    console.log(this.data.items)
    var items = this.data.items.map((item) =>{
      if (item.topic_id == id) {
        var newItem = item
        if (mark == 1) {
          newItem.liked = true
          newItem.likes_num = newItem.likes_num + 1
        }else{
          newItem.topicInfo.liked = false
          if (newItem.likes_num > 0) {
            newItem.likes_num = newItem.likes_num - 1
          }
        }
        return newItem
      }else{
        return item
      }
    })
    console.log('items的count',items.length)
    this.setData({
      items: this.data.items
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
   cellClick(e) {
    var id = e.detail.topic
    console.log('id 的值为',id)
    wx.navigateTo({
      url: '../../homeinfo/topicdetail/topicdetail?topic_id=' + id,
    })
  },
  // 完成领养点击
  complateClick(e) {
    var topic_id = e.detail.topic
    var token = wx.getStorageSync('token')
    var that = this
    var data = {
      'topic_id': topic_id,
      'token': token
    }
    network({
      url: api.complateRescue,
      data: data
    }).then(res=>{
      console.log(res.data);
      if (res.data.code == 200) {
        var datas = that.data.items
        datas = datas.map(model => {
          if (model.topic_id == topic_id) {
            var newModel = model
            newModel.is_complete = true
            return newModel
          }else{
            return model
          }
        })
        that.setData({
          items: datas
        })
      }
    })
  }
})