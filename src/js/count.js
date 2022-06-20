export default function count(...data){
  return data.reduce((pre,now)=>{return pre + now},0)
}
