import sum from './js/sum'
import count from './js/count';
import './css/index.css'
import './less/index.less'
import './sass/index.sass'
import './sass/index.scss'
import './stylus/index.styl'

const time = 124432
console.log(time)
console.log(sum(2,23))

console.log(count(1,2,23,66,7,8))

document.getElementById('btn').onclick = function(){
  import(/* webpackChunkName: "mins" */'./js/mins').then(({mius})=>{console.log(mius(333,5))})
}