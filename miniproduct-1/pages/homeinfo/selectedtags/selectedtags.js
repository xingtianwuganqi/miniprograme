// pages/HomeInfo/selectedtags/selectedtags.js
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTagList();
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

  getTagList: function() {
    var that = this;
    wx.request({
      url: app.baseUrl + '/api/v1/gettaglist/',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data);
        if (res.data.code == 200) {
          var datas = res.data.data
          for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            item['select'] = false;
            datas[i] = item
          }
          that.setData({
            items: datas
          })
        }
      }
    })
  },

  /*点击未选中变选中 */
  unselectClick: function(value) {
    var item = value.currentTarget.dataset.id
    var datas = this.data.items;
    for (var i=0;i<datas.length;i++){
      var tag = datas[i];
      if (tag.id == item.id) {
        tag.select = true;
        datas[i] = tag;
        break;
      }
    }
    this.setData({
      items: datas
    })
  },

  /*选中的tag点击 */
  selectClick: function(value) {
    var item = value.currentTarget.dataset.id
    var datas = this.data.items;
    for (var i=0;i<datas.length;i++){
      var tag = datas[i];
      console.log(tag.tag_name);
      if (tag.id == item.id) {
        tag.select = false;
        datas[i] = tag;
        break;
      }
    }
    this.setData({
      items: datas
    })
  }

})