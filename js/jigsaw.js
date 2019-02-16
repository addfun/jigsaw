//css3拼图游戏(没考虑兼容性，请使用谷歌浏览器打开)
//
; (function (root, factory) {
  root.Jigsaw = factory()
}(window, function () {
  function Jigsaw(options) {
    this.init(options)
  }

  Jigsaw.prototype = {
    constructor: Jigsaw,
    init: function (options) {
      //默认参数
      this.config = {
        row: 3,//行数
        column: 3,//列数
        width: 300,//拼图区的宽
        height: 300,//拼图区的高
        img: ''//图片路径
      }
      var $el = options.el
      if (typeof options !== 'object') {
        throw new Error('请传一个对象作为参数')
      }
      if (typeof $el == 'string') {
        $el = document.querySelector($el)
      }
      if (!($el instanceof Element)) {
        throw new Error('请传一个存在的dom或css选择器字符串作为el的参数')
      }
      this.$el = $el
      //是否已经开始
      this.hasStart = false
      //初始图片片段数组
      this.oriArr = []
      //配置参数
      for (var item in options) { //未深度克隆
        this.config[item] = options[item]
      }
      this.render()
      this.bindStartBtn()
    },
    //初始化dom渲染，并给予默认属性
    render: function () {
      var config = this.config
        , wrapHeight = config.height
        , wrapWidth = config.width
        , container = document.createElement('div')
        , button = document.createElement('button')
        , imgWrapper = document.createElement('div')
        , divs = []
        , imgUrl = config.img
        , row = config.row
        , col = config.column
        , num = row * col
        , height = wrapHeight / row
        , width = wrapWidth / col
        , oriArr = this.oriArr
      this.itemHeight = height
      this.itemWidth = width
      container.className = 'jigsaw-wrapper'
      button.className = 'btn btn-nomal'
      button.innerText = '开始'
      imgWrapper.className = 'image-wrapper'
      imgWrapper.style.width = wrapWidth + 'px'
      imgWrapper.style.height = wrapHeight + 'px'
      for (var i = 0; i < num; i++) {
        var div = document.createElement('div')
          , x = i % col
          , y = parseInt(i / col)
        oriArr.push(i)
        div.style.transform = 'translate3d(' + width * x + 'px,' + height * y + 'px,0)'
        div.style.height = height + 'px'
        div.style.width = width + 'px'
        div.style.background = 'url("' + imgUrl + '")'
        div.style.backgroundRepeat = 'no-repeat'
        div.style.backgroundSize = wrapWidth + 'px,' + wrapHeight + 'px'
        div.style.backgroundPosition = width * (-x) + 'px ' + height * (-y) + 'px'
        divs.push(div)
        imgWrapper.appendChild(div)

      }
      container.appendChild(button)
      container.appendChild(imgWrapper)
      this.$el.appendChild(container)
      this.$container = container
      this.$button = button
      this.$imgWrapper = imgWrapper
      this.$divs = divs

    },
    //绑定开始按钮事件函数
    bindStartBtn: function () {
      this.btnClickStarFn = this.gameStart.bind(this)
      this.divsTranEndFn = this.divsTranEnd.bind(this)
      this.wrapImageFn = this.downHandler.bind(this)
      this.$button.addEventListener('click', this.btnClickStarFn, false)
    },
    //开始按钮事件函数
    gameStart: function () {
      if (!this.hasStart) {
        this.randomArr()
        setTimeout(this.divsTranEndFn, 300)
        //transitionend有bug才改用的setTimeout,transitionend事件绑定解除交替多了就失效了!？
        // this.$divs[0].addEventListener('transitionend', this.divsTranEndFn, false) 
        this.changeArr()
        // this.$imgWrapper.addEventListener('mousedown', this.downHandler.bind(this), false)
      } else {
        setTimeout(this.divsTranEndFn, 300)
        // this.$divs[0].addEventListener('transitionend', this.divsTranEndFn, false)
        this.changeArr(this.oriArr)
        //把取消事件放到动画前面先执行(所以就没放到定时器里面)
        this.$imgWrapper.removeEventListener('mousedown', this.wrapImageFn, false)
      }
      this.$button.removeEventListener('click', this.btnClickStarFn, false)
    },
    //所有图片片段div过渡动画结束时要执行的函数(取消过渡属性，改变是否开始状态)
    divsTranEnd: function () {
      if (this.hasStart){
        this.$button.innerText = '开始'
        this.hasStart = false
        this.$imgWrapper.classList.remove('start')
      }else{
        this.$button.innerText = '复原'
        this.hasStart = true
        this.$imgWrapper.addEventListener('mousedown', this.wrapImageFn, false)
        this.$imgWrapper.classList.add('start')
      }
      this.$button.addEventListener('click', this.btnClickStarFn, false)
      // this.$divs[0].removeEventListener('transitionend', this.divsTranEndFn, false)
      this.$imgWrapper.classList.remove('tran-start')
    },
    //鼠标按下在图片上的函数
    downHandler: function (e) {
      e.preventDefault()
      var target = e.target
      //如果点击的时图片容器 不做处理
      if (target.classList.contains('image-wrapper')){
        return
      }
      var itemWidth = this.itemWidth
        , itemHeight = this.itemHeight
        , oLeft = this.$imgWrapper.offsetLeft
        , oTop = this.$imgWrapper.offsetTop
        , left = e.pageX - oLeft //e.clientX 貌似有bug
        , top = e.pageY - oTop
        , indexX = Math.floor(left / itemWidth)
        , indexY = Math.floor(top / itemHeight)
      this.disX = oLeft + left - indexX * itemWidth
      this.disY = oTop + top - indexY * itemHeight
      this.moveFn = this.moveHandler.bind(this, target)
      this.upFn = this.upHandler.bind(this, target)
      //鼠标按下时在当前(随机)图片数组的索引
      this.downIndex = indexX + indexY * this.config.column
      this.$imgWrapper.classList.add('start-move')
      target.style.zIndex = 999
      document.addEventListener('mousemove', this.moveFn, false)
      document.addEventListener('mouseup', this.upFn, false)
      return false
    },
    //鼠标在document移动函数
    moveHandler: function (target, e) {
      e.preventDefault()
      var width = e.pageX - this.disX
        , height = e.pageY - this.disY
      target.style.transform = 'translate3d(' + width + 'px,' + height + 'px,0)'
    },
    //鼠标在document上抬起函数
    upHandler: function (target, e) {
      var imgWrapper = this.$imgWrapper
        , left = e.pageX - imgWrapper.offsetLeft
        , top = e.pageY - imgWrapper.offsetTop
        , upIndex = this.getUpIndex(left,top)
      if(this.downIndex == upIndex){
        this.downUpDivReturn()
      }else{
        this.downUpDivChange(upIndex)
      }
      imgWrapper.classList.remove('start-move')
      target.style.zIndex = 0
      // console.log(this.$divs[this.ranArr[index]])/* *$* */
      document.removeEventListener('mousemove', this.moveFn, false)
      document.removeEventListener('mouseup', this.upFn, false)
    },
    //鼠标抬起时 获取鼠标当前位置在当前(随机)数组的索引
    getUpIndex: function (left, top){
      var config = this.config
      if (left < 0 || left > config.width||top<0||top>config.height){
        return this.downIndex
      }else{
        var indexX = Math.floor(left / (config.width / config.column))
          , indexY = Math.floor(top / (config.height / config.row))
        return indexX + indexY * config.column
      }
    },
    //图片没能达到交换条件原位置返回函数
    downUpDivReturn: function(){
      var index = this.getIndexFormRanArr(this.downIndex)
        , downIndex = this.downIndex
        , offsetDiv = this.getDivOffset(downIndex)
        , leftDiv = offsetDiv.left
        , topDiv = offsetDiv.top
        , _this = this
      this.$imgWrapper.classList.add('tran-start')
      this.$divs[index].style.transform = 'translate3d(' + leftDiv + 'px,' + topDiv + 'px,0)'
      setTimeout(function(){
        _this.$imgWrapper.classList.remove('tran-start')
      }, 300)
    },
    //鼠标点击与抬起时两张图片进行交换函数
    downUpDivChange: function(upIndex){
      var downIndex = this.downIndex
        , downIndexR = this.getIndexFormRanArr(downIndex)
        , upIndexR = this.getIndexFormRanArr(upIndex)
        , offsetDownDiv = this.getDivOffset(downIndex)
        , offsetUpDiv = this.getDivOffset(upIndex)
        , leftDownDiv = offsetDownDiv.left
        , topDownDiv = offsetDownDiv.top
        , leftUpDiv = offsetUpDiv.left
        , topUpDiv = offsetUpDiv.top
        , $divs = this.$divs
        , _this = this
      this.$imgWrapper.classList.add('tran-start')
      //同时改变随机数组数据
      this.changeRanArr(downIndexR, upIndexR)
      $divs[downIndexR].style.transform = 'translate3d(' + leftUpDiv + 'px,' + topUpDiv + 'px,0)'
      $divs[upIndexR].style.transform = 'translate3d(' + leftDownDiv + 'px,' + topDownDiv + 'px,0)'
      setTimeout(function () {
        _this.$imgWrapper.classList.remove('tran-start')
        _this.checkIsRight()
      }, 300)
    },
    //检查是否拼图是否达成
    checkIsRight: function(){
      if(this.ranArr.toString() == this.oriArr.toString()){
        alert('成功')
        this.divsTranEnd()
        this.$imgWrapper.removeEventListener('mousedown', this.wrapImageFn, false)
      }else{
        console.log('还没成功')
      }
    },
    //改变随机数组里的数据
    changeRanArr: function(down, up){
      var ranArr = this.ranArr
        , temp = ranArr[down]
      ranArr[down] = ranArr[up]
      ranArr[up] = temp
    },
    //获取随机图片数组中对应的索引
    getIndexFormRanArr: function(item){
      var arr = this.ranArr
      for (var i = 0, len = arr.length;i<len;i++){
        if(item == arr[i]){
          return i
        }
      }
    },
    //根据当前索引获取当前图片位置left，top
    getDivOffset: function(index){
      var col = this.config.column
      return {
        left: (index % col) * this.itemWidth,
        top: Math.floor(index / col) * this.itemHeight
      }
    },
    //随机生成图片位置数组函数
    randomArr: function () {
      var len = this.oriArr.length
          ,ranArr = []
          ,tep
      for (var i = 0; i < len; i++) {
        tep = Math.floor(Math.random() * len)
        if (ranArr.length > 0) {
          for (; ranArr.indexOf(tep) > -1;) {
            tep = Math.floor(Math.random() * len)
          }
        }
        ranArr.push(tep)
      }
      //随机图片片段数组
      this.ranArr = ranArr
    },
    //点击开始/复原按钮改变所以图片位置函数
    changeArr: function (arr) {
      var col = this.config.column
        , itemWidth = this.itemWidth
        , itemHeight = this.itemHeight
        , divsDom = this.$divs
      this.$imgWrapper.classList.add('tran-start')
      if (arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
          var x = arr[i] % col
            , y = Math.floor(arr[i] / col)
            , height = y * itemHeight
            , width = x * itemWidth
          divsDom[i].style.transform = 'translate3d(' + width + 'px,' + height + 'px,0)'
        }
      } else {
        arr = this.ranArr
        for (var i = 0, len = arr.length; i < len; i++) {
          var x = arr[i] % col
            , y = parseInt(arr[i] / col)
            , height = y * itemHeight
            , width = x * itemWidth
          divsDom[i].style.transform = 'translate3d(' + width + 'px,' + height + 'px,0)'
        }
      }
    }
  }
  return Jigsaw;
}));