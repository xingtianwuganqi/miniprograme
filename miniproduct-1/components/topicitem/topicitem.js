// components/topicitem/topicitem.js
import network from '../../config/network.js'
const api = require('../../config/api.js')
const util = require('../../utils/util.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      default: null,
      observer:function(newVal, oldVal, changePath){
        // 不可修改本身的值 应该在data里添加一个_count
        console.log(newVal, oldVal)
      }
    },
    fromType: { // 1 来自我的发布，
      type: String,
      value: null,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /* 跳转到详情页*/
    handleToTopicDetail: function(e) {
      console.log(e.currentTarget.dataset.id);
      var id = e.currentTarget.dataset.id;
      // wx.navigateTo({
      //   url: '../topicdetail/topicdetail?topic_id=' + id,
      // })
      var event = {
        topic: id,
      }
      // 组件向外产值
      this.triggerEvent("cellDidSelect",event,{})
    },
    /**点赞按钮点击 */
  likeButtonClick:function(event) {
    var topic_id = event.currentTarget.dataset.id
    var mark = event.currentTarget.dataset.mark
    var token = wx.getStorageSync('token')
    console.log('topicid',topic_id,'likeMark:',mark,'token:',token)
    if (token.length > 0) {
      this.likeNetworking(topic_id,mark,token);
    }else{
      wx.navigateTo({
        url: '../../login/login',
      })
    }
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
        that.notic(id,mark)
      }
    })
  },
  /** 收藏按钮点击 */
  collectButtonClick: function(event) {
    var topic_id = event.currentTarget.dataset.id
    var mark = event.currentTarget.dataset.mark
    var token = wx.getStorageSync('token')
    if (token.length > 0) {
      this.collectNetworking(topic_id,mark,token);
    }else{
      wx.navigateTo({
        url: '../../login/login',
      })
    }
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
        that.collectNotic(id,mark)
      }
    }) 
  },
  notic (id,mark){
    var event = {
      topic: id,
      mark: mark
    }
    // 组件向外产值
    this.triggerEvent("likeChanged",event,{})
  },
  collectNotic(id,mark) {
    var event = {
      topic: id,
      mark: mark
    }
    this.triggerEvent('collectChanged',event,{})
  },
  /**评论点击 */
  commentButtonClick(event) {
    var topic = event.currentTarget.dataset.id
    var dic = {
      topic: topic,
    }
    console.log(dic)
    this.triggerEvent('commentClick',dic,{})
  },
  /**更多按钮点击 */
  moreButtonClick(event) {
    var id = event.currentTarget.dataset.id
    var dic = {
      topic: id
    }
    var that = this
    if (that.properties.fromType == "1") {
      wx.showActionSheet({
        itemList: ['完成领养'],
        success(res) {
          if (res.tapIndex == 0) {
            if (util.checkIsNotLogin()) {
              return 
            }

            wx.showModal({
              title:"提示",
              content: "确定完成领养吗？",
              success: function(res) {
                if (res.confirm) {
                  that.triggerEvent('complateRescueClick',dic,{})
                }
              }
            })
          }
        }
      })
    }else {
      wx.showActionSheet({
        itemList: ['投诉举报'],
        success(res) {
          if (res.tapIndex == 0) {
            if (util.checkIsNotLogin()) {
              return 
            }
            that.triggerEvent('moreBtnClick',dic,{})
          }
        }
      })
    }
  }
  }
  /**完成领养 */

})
