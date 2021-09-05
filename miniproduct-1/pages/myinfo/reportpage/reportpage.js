// pages/myinfo/reportpage/reportpage.js
const { report } = require("../../../config/api")
const api = require("../../../config/api")
const { default: network } = require("../../../config/network")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listdata: [],
    report_id: null,
    report_type: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var report_id = options.report_id
    this.data.report_id = report_id
    this.violationListNetworking()
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
  /**举报列表 */
  violationListNetworking() {
    var that = this
    network({
      url: api.violationList
    }).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        var datas = res.data.data
        datas = datas.map(model=>{
          model.isSelect = false
          return model
        })
        that.setData({
          listdata: datas
        })
      }
    })
  },
  /**点击选中 */
  gridviewClick(event) {
    var item = event.currentTarget.dataset.id 
    console.log(item)
    var datas = this.data.listdata
    datas = datas.map(model => {
      var newModel = model
      if (newModel.id == item.id) {
        newModel.isSelect = true
      }else{
        newModel.isSelect = false
      }
      return newModel
    })
    this.setData({
      listdata: datas
    })
  },
  pushButtonClick() {
    var that = this
    var datas = that.data.listdata
    var item = datas.filter(res=>{
      return res.isSelect == true
    })[0]
    if (item != null) {
      var violation_id = item.id
      var userInfo = wx.getStorageSync('userInfo')
      var user_id = userInfo.id
      var token = wx.getStorageSync('token')
      var data = {
        'report_type': 1,
        'report_id': Number(that.data.report_id),
        'user_id': user_id,
        'violation_id':violation_id,
        'token': token
      }
      console.log(data)
      network({
        url: api.report,
        data: data
      }).then(res=>{
        console.log(res.data)
        if (res.data.code == 200) {
          wx.showToast({
            title: '投诉成功',
          }) 
          var timeOut = setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 1500)
        }else{
          wx.showToast({
            title: '投诉失败',
          })
        }
      })
    }else{
      wx.showToast({
        title: '请选择理由',
        icon: 'none'
      })
    }
  }
})