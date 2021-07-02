// pages/homepage/homepage.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    size: 10,
    items: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.listNetworking(this.data.page);
  },

  listNetworking: function(e) {
    this.data.page = e;
    var that = this;
    if (this.data.page == 1) {
      //在当前页面显示导航条加载动画
      wx.showNavigationBarLoading(); 
    }
    wx.request({
      url: 'https://test.rxswift.cn/api/v1/topiclist/',
      data:{
        'page':that.data.page,
        'size': that.data.size,
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success(res) {
          console.log(res.data)
          if (res.data['code'] == 200 && res.data['data'].length > 0) {
            
            if (that.data.page == 1) {
              wx.hideNavigationBarLoading({
                success: (res) => {},
              })
              wx.stopPullDownRefresh({
                success: (res) => {},
              })

              that.setData({
                items: res.data.data,
              })
              
            }else{
              var orginData = that.data.items;
              that.setData({
                items: orginData.concat(res.data.data)
              })
              // that.setData({
              //   items: res.data.data,
              // })
            }
            that.data.page += 1
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.onBottom();
  },

  //触底响应函数
  onBottom(){
    this.listNetworking(this.data.page);
  },

})