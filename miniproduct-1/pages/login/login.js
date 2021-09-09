// pages/login/login.js
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgreen: true,
    textToast: false,
    loading: false,
    hideTextToast: false,
    hideLoading: false,
    textInfo: null,
    loading: false,
    bottomHeight: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.isFullScreen) {
      this.setData({
        bottomHeight: 90
      })
    }else{
      this.setData({
        bottomHeight: 40
      })
    }
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

  /** 登录按钮点击 */
  getUserInfo:function(){
    if (this.data.loading==true) {
      return 
    }
    this.setData({
      loading: true
    })
    let that = this
    //首先查看是否得到用户 的授权
    wx.getSetting({
      success:function(settingRes){
        //console.log(res)
        //res.authSetting['scope.userInfo']   代表用户授予权限的状态
        console.log(settingRes.authSetting['scope.userInfo'])
        if(settingRes.authSetting['scope.userInfo']){
          //如果用户给与了这个权限 可以进行获取用户信息
          wx.getUserInfo({
            success: (response) => {
              console.log(response.userInfo)
              that.setData({
                userInfo: response.userInfo
              })
              wx.login({
                timeout: 50000,
                success(loginRes){
                  console.log(loginRes)
                  /// 获取到code之后传给后台
                  wx.request({
                    url:  app.baseUrl + '/api/v2/wxlogin/',
                    data:{
                      'avatarUrl':response.userInfo.avatarUrl,
                      'username': response.userInfo.nickName,
                      'code': loginRes.code
                    },
                    method: "POST",
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    success(userRes) {
                      console.log(userRes);
                      that.setData({
                        loading: false
                      })
                      if (userRes.data.code==200) { // 登录成功，保存用户信息
                        wx.setStorageSync('userInfo', userRes.data.data)
                        wx.setStorageSync('token', userRes.data.data.token)
                        wx.navigateBack({
                          delta: 0,
                        })
                        wx.showToast({
                          title: '登录成功',
                          icon:'none'
                        })
                      }
                    },fail(error){
                      console.log(error);
                    }
                  })

                },fail(error){
                  that.setData({
                    loading: false
                  })
                }
              })
            }
          })
        }else{
          //如果用户没有给与这个权限则  发送询问权限的请求
          wx.authorize({
            scope:"scope.userInfo",//询问授权的属性
            success:function(res){
              console.log(res)
            }
          })
        }
      },fail(error) {
        that.setData({
          loading: false
        })
      }
    })
  },
  /*
  icon 点击
  */
 iconClick: function() {
  this.setData({
    isAgreen: false
  })
 },
 /**未选中点击 */
 iconUnselectClick: function() {
   this.setData(
     {
       isAgreen: true
     }
   )
 },
 
  /**文字提示 */
  openTextToast: function(textcontent) {
    this.setData({
        textInfo: textcontent,
        textToast: true
    });
    setTimeout(() => {
        this.setData({
            hideTextToast: true
        });
        setTimeout(() => {
            this.setData({
                textToast: false,
                hideTextToast: false,
            });
        }, 300);
    }, 3000);
  },
  /**电话登录点击 */
  phoneLoginClick() {
    wx.navigateTo({
      url: '../phonelogin/phonelogin',
    })
  }
})