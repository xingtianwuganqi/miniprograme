// components/emptypage/emptypage.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {'title': '暂无数据','desc': '请点击重试'},
      observer:function(newVal, oldVal, changePath){
        // 不可修改本身的值 应该在data里添加一个_count
        console.log(newVal, oldVal)
      }
    },
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
    emptyClick() {
      // 组件向外产值
      this.triggerEvent("emptyDidClick",{},{})
    }
  }
})
