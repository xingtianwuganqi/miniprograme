// pages/TopicDetail/TopicDetail.js
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topicInfo: null,
    bottomHeight: null,
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
  },

  topicDetailNetworking: function (topic_id) {
    let that = this;
    wx.request({
      url: app.baseUrl + '/api/v1/topicdetail/',
      data:{
        'topic_id':topic_id,
        'token': ''
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success(res){
        console.log(res.data);
        that.setData({
          topicInfo: res.data.data
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

  }
})