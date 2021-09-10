import api from "../../config/api";
import network from "../../config/network";
const md5 = require('../../utils/md5.js');

// pages/phonelogin/phonelogin.js
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
  /**form 表单提交，点击了登录按钮 */
  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    var account = e.detail.value.account
    var password = e.detail.value.password
    if (account == null || account.length == 0) {
      wx.showToast({
        title: '请输入手机号或邮箱',
        icon: 'none'
      })
      return 
    }

    if (password == null || password.length == 0) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return 
    }

    var phoneNum = "";
    var email = "";
    
    if ((/^1[34578]\d{9}$/.test(account))) { 
      phoneNum = account
    }

    if ((/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(account))){
      email = account
    }
    var password = e.detail.value.password
    var data = {
      'phoneNum': phoneNum,
      'email': email,
      'password': md5.hexMD5(password).toLocaleUpperCase(),
      'phone_type': 'miniprograme'
    }
    console.log(data)
    network({
      url: api.login,
      data: data
    }).then(res=>{
      console.log(res.data)
      if (res.data.code == 200) {
        wx.setStorageSync('userInfo', res.data.data)
        wx.setStorageSync('token', res.data.data.token)
        wx.showToast({
          title: '登录成功',
          icon:'none'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 2,
          })
        },2000)
      }else{
        wx.showToast({
          title: '登录失败',
          icon:'none'
        })
      }
    })
      
    
  },
})