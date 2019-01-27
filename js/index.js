
window.addEventListener("DOMContentLoaded", function(){
  console.time() 
  var J1 = new Jigsaw({
    el: "#game",
    img: "./image/pic.jpg",
    row: 3,//行数
    column: 4,//列数
    width: 300,//拼图区的宽
    height: 300,//拼图区的高
  })
  var J2 = new Jigsaw({
    el: "#game2",
    img: "./image/wolf.jpg",
    row: 4,//行数
    column: 3,//列数
    width: 400,//拼图区的宽
    height: 200,//拼图区的高
  })
  console.log(J1, J2)
  console.timeEnd()
})