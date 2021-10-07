// pages/HomeInfo/selectedtags/selectedtags.js
const app = getApp().globalData;
const api = require('../../../config/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selItems: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 接收上个页面传递来的数据
    let eventChannel = this.getOpenerEventChannel()
    // setAddressEditData和上个页面设置的相同即可
    eventChannel.on('selData', (items) => {
      this.setData({  
      	selItems: items,
      })
    })
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
      url: api.getTags,
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
          if (that.data.selItems.length > 0) {
            var selDataIds = that.data.selItems.map((item) => {
              return item.id
            })
            datas = datas.map((data) => {
              var newData = data
              if (selDataIds.includes(newData.id)) {
                newData.select = true
              }
              return newData
            })
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
    this.itemCallBack(datas)

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
    this.itemCallBack(datas)
  },
  /**处理数据，回调 */
  itemCallBack: function(items) {
    console.log(items);
    var selData = items.filter((item) => {
      return item.select == true
    })
    console.log(selData);
    let eventChannel = this.getOpenerEventChannel()
    // updateAddressListData 这个方法需要上一个页面的支持, 上一个页面在navigateTo方法中的events数据中定义这个方法来接收数据
    eventChannel.emit('updateAddressListData', selData)
  }
})