(()=>{
const $=s=>document.querySelector(s);let promptEvent,registration;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(!standalone()&&sessionStorage.getItem('wordgarden-install-dismiss')!=='1')$('#installBanner').hidden=false;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;if(!standalone())$('#installBanner').hidden=false;$('#installApp').textContent='安装到手机'});
$('#installApp').onclick=async()=>{if(promptEvent){await promptEvent.prompt();await promptEvent.userChoice;promptEvent=null}else location.href='install.html'};
$('#dismissInstall').onclick=()=>{$('#installBanner').hidden=true;sessionStorage.setItem('wordgarden-install-dismiss','1')};
window.addEventListener('appinstalled',()=>{$('#installBanner').hidden=true});
const offlineStatus=()=>{$('#offlineStatus').textContent=navigator.onLine?'离线词库已就绪 · 发音视设备支持，语音核对需联网':'当前离线 · 可继续背词和默写，语音核对联网后使用'};
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').then(async reg=>{registration=reg;const waiting=()=>{if(reg.waiting&&navigator.serviceWorker.controller)$('#updateBanner').hidden=false};waiting();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',waiting)});await navigator.serviceWorker.ready;offlineStatus();window.addEventListener('online',offlineStatus);window.addEventListener('offline',offlineStatus)}).catch(()=>{$('#offlineStatus').textContent='离线准备未完成，请保持联网后重新打开。'})}else $('#offlineStatus').textContent='当前浏览器不支持离线缓存，请联网使用。';
$('#applyUpdate').onclick=()=>{if(document.querySelector('#study').open){alert('请先结束本轮学习，再更新应用。');return}registration?.waiting?.postMessage('SKIP_WAITING')};
let reloading=false;navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloading)return;if($('#updateBanner').hidden)return;reloading=true;location.reload()});
})();
