// pages/HomeInfo/createtopic/createtopic.js
/*
  struct ReleasePhotoModel: HandyJSON, Equatable {
    var image: UIImage?
    var isAdd: Bool = false // 是不是添加的图片
    var progress: Float = 0
    var complete: Bool = false
    var photoKey: String = "\(Tool.shared.getTime())/\(String.et.random(ofLength: 8)).jpeg"
    var photoUrl: String = ""
    
    static func == (lhs: Self, rhs: Self) -> Bool {
        return lhs.photoKey == rhs.photoKey
    }
}
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tags: null,
    photoModels:[{isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      photoModels:[{isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""}]
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

  /* 点击添加标签 */
  addTagsClick: function() {
    wx.navigateTo({
      url: '../selectedtags/selectedtags',
    })
  },

  //用户名和密码输入框事件
  contactInput:function(e){
    console.log(e.detail.value);
    this.setData({
      contact:e.detail.value
    })
  },
  bindTextAreaBlur: function(e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  }
})