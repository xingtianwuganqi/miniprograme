// pages/homepage/homepage.js
// const network = require('../../../config/network.js');
/*
// "navigationStyle": "custom"
*/
import network from '../../../config/network.js'
const api = require('../../../config/api.js')
const app = getApp().globalData;
const util = require('../../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 组件参数设置，传递到组件
    defaultData: {
      title: "我的主页", // 导航栏标题
    },
    page: 1,
    size: 10,
    items: [],
    localItems: [],
    currentTab: 0,
    isLoadEnd: false,
    loading: 1, // 0：空，1：loading，2：加载完数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

        /**
         * 获取当前设备的宽高
         */
    wx.getSystemInfo( {

        success: function( res ) {
            that.setData( {
                winWidth: res.windowWidth,
                winHeight: res.windowHeight
            });
        }

    });
    this.listNetworking(this.data.page);
    this.unreadMsgNumNetworking()
  },

  /* 网络请求*/
  listNetworking: function(e) {
    this.data.page = e;
    var that = this;
    if (that.data.page == 1) {
      //在当前页面显示导航条加载动画
      wx.showNavigationBarLoading(); 
    }
    if (that.data.page == 1 && that.data.loading == 1) {
      wx.showLoading({
        title: '正在加载',
      })
    }
    var token = wx.getStorageSync('token')
    console.log(token)
    console.log(typeof(network))
    network({
      url: api.TopicList,
      data:{
        'page':that.data.page,
        'size': that.data.size,
        'token': token
      }
    }).then(res=>{
      console.log('===----------=====')
      console.log(res.data)
      if (that.data.page == 1) {
        wx.hideNavigationBarLoading({
          success: (res) => {},
        })
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
        wx.hideLoading({
          success: (res) => {},
        })
      }
      if (res.data['code'] == 200 && res.data['data'].length > 0) {
        if (that.data.page == 1) {
          that.setData({
            items: res.data.data,
            loading: 2
          })
          
        }else{
          var orginData = that.data.items;
          that.setData({
            items: orginData.concat(res.data.data)
          })
        }
        that.data.page += 1
      }else{
        that.setData({
          isLoadEnd: true,
          loading:2
        })
      }
    })
  },

  /* 跳转到详情页*/
  handleToTopicDetail: function(e) {
    console.log(e.currentTarget.dataset.id);
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../topicdetail/topicdetail?topic_id=' + id,
    })
  },

  /*点击添加跳转到发布页面*/
  addButtonClick: function() {
    var that = this
    if (util.checkIsNotLogin()) {
      return
    }
    wx.navigateTo({
      url: '../createtopic/createtopic',
      // 回调传值
      events: {
        // 这里用来接收后面页面传递回来的数据
        updateTopicList: (items) => {
           // 这里处理数据即可，回调回来的数据
           that.listNetworking(1);
        }
      }
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
    this.listNetworking(1);
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
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '真命天喵',
      desc: '一起帮宠物找个家',
      path: '../homepage/homepage'
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.onBottom();
  },

  //触底响应函数
  onBottom(){
    if (this.data.isLoadEnd) {
      return 
    }
    this.listNetworking(this.data.page);
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
  //  tab切换逻辑
  swichNav: function( e ) {
    var that = this;
    if( this.data.currentTab === e.target.dataset.current ) {
        return false;
    } else {
        that.setData( {
            currentTab: e.target.dataset.current
        })
    }
  },

  bindChange: function( e ) {
    var that = this;
    that.setData( { currentTab: e.detail.current });
  },
  /**获取定位信息 */


  /**点击搜索 */
  seachBtnClick: function(e) {
    console.log('searchBtnClick')
  },
  /**搜索view点击 */
  searchViewClick: function(e) {
    wx.navigateTo({
      url: '../searchpage/searchpage',
    })
  },
  /**点赞收藏状态改变 */
  topicItemStatusChanged (dic) {
    if (dic.type == 'like') {
      var datas = this.data.items.map(model => {
        var newModel = model
        if (newModel.topic_id == dic.topic_id) {
          if (dic.mark == 1) {
            newModel.liked = true
            newModel.likes_num += 1
          }else{
            newModel.liked = false
            if (newModel.likes_num > 1) {
              newModel.likes_num -= 1
            }
          }
        }
        return newModel
      })
      this.setData({
        items: datas
      })
    }else{
      var datas = this.data.items.map(model => {
        var newModel = model
        if (newModel.topic_id == dic.topic_id) {
          if (dic.mark == 1) {
            newModel.collectioned = true
            newModel.collection_num += 1
          }else{
            newModel.collectioned = false
            if (newModel.collection_num > 1) {
              newModel.collection_num -= 1
            }
          }
        }
        return newModel
      })
      this.setData({
        items: datas
      })
    }
  },
  /**设置消息tabbar未读消息数 */
  unreadMsgNumNetworking() {
    var that = this
    var token = wx.getStorageSync('token')
    if (token == null || token.length == 0) {
      return 
    }
    network({
      url: api.unreadMsgNum,
      data: {
        "token": token
      }
    }).then(res=>{
      console.log(res.data.data)
      if (res.data.code == 200) {
        var like_unread = res.data.data.like_unread
        var collec_unread = res.data.data.collec_unread
        var com_unread = res.data.data.com_unread
        var total_num = like_unread + collec_unread + com_unread
        if (total_num > 99) {
          wx.setTabBarBadge({
            index: 1,
            text: '99+',
          })
        }else if (total_num > 0) {
          wx.setTabBarBadge({
            index: 1,
            text: total_num.toString(),
          })
        }else{
          wx.removeTabBarBadge({
            index: 1,
          })
        }
      }
    })
  }
})