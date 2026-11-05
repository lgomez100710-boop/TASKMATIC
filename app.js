let tasks=[], selectedId=null, editingId=null, nextId=1;
const $=id=>document.getElementById(id);
const priorityRank={Alta:0,Media:1,Baja:2};
function say(msg){$('notice').textContent=msg}
function getForm(){return {name:$('taskName').value.trim(),desc:$('taskDesc').value.trim(),date:$('taskDate').value,priority:$('taskPriority').value,category:$('taskCategory').value}}
function clearForm(){ $('taskName').value='';$('taskDesc').value='';$('taskDate').value='';$('taskPriority').value='Media';$('taskCategory').value='Estudio';editingId=null;$('saveBtn').textContent='＋ Agregar tarea';}
function saveTask(){
 const form=getForm();if(!form.name){say('Escribe el nombre de la tarea antes de guardar.');$('taskName').focus();return}
 if(editingId!==null){const t=tasks.find(x=>x.id===editingId);if(t)Object.assign(t,form);selectedId=editingId;say('Tarea modificada correctamente.')}
 else{const task={...form,id:nextId++,done:false,created:Date.now()};tasks.push(task);selectedId=task.id;say('Tarea agregada correctamente.')}
 clearForm();render();
}
function selectTask(id){selectedId=id;const t=tasks.find(x=>x.id===id);if(t){$('previewName').textContent=t.name;$('previewDesc').textContent=t.desc||'Sin descripción.';$('previewMeta').innerHTML='';const p=document.createElement('span');p.className='pill '+t.priority.toLowerCase();p.textContent='Prioridad: '+t.priority;$('previewMeta').appendChild(p);const c=document.createElement('span');c.className='pill';c.textContent=t.category;$('previewMeta').appendChild(c);const s=document.createElement('span');s.className='pill';s.textContent=t.done?'Completada':'Pendiente';$('previewMeta').appendChild(s);const d=document.createElement('span');d.className='pill';d.textContent=t.date?'Límite: '+formatDate(t.date):'Sin fecha límite';$('previewMeta').appendChild(d)}renderListOnly()}
function formatDate(date){if(!date)return '';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`}
function getSortedFiltered(){
 let list=[...tasks],filter=$('filterBy').value,sort=$('sortBy').value;
 if(filter==='pending')list=list.filter(t=>!t.done);if(filter==='done')list=list.filter(t=>t.done);
 list.sort((a,b)=>{if(sort==='priority')return priorityRank[a.priority]-priorityRank[b.priority]||a.created-b.created;if(sort==='name')return a.name.localeCompare(b.name,'es');if(sort==='status')return Number(a.done)-Number(b.done)||a.created-b.created;if(sort==='created')return a.created-b.created;return (a.date||'9999-99-99').localeCompare(b.date||'9999-99-99')||a.created-b.created});
 return list;
}
function renderListOnly(){
 const container=$('taskList');container.innerHTML='';let list=getSortedFiltered();
 if(!list.length){container.innerHTML='<div class="empty">☑<br><strong>No hay tareas para mostrar</strong><br>Prueba otro filtro o agrega una tarea.</div>';return}
 list.forEach(t=>{
  const item=document.createElement('div');item.className='task-item'+(t.done?' done':'')+(t.id===selectedId?' selected':'');
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=t.done;cb.setAttribute('aria-label','Marcar '+t.name+' como completada');cb.addEventListener('click',e=>e.stopPropagation());cb.addEventListener('change',()=>{t.done=cb.checked;selectedId=t.id;selectTask(t.id);say(t.done?'¡Tarea marcada como completada!':'Tarea marcada como pendiente.');render()});
  const content=document.createElement('div');const name=document.createElement('div');name.className='task-name';name.textContent=t.name;const desc=document.createElement('div');desc.className='task-desc';desc.textContent=t.desc||'Sin descripción';content.append(name,desc);
  const foot=document.createElement('div');foot.className='task-footer';const pri=document.createElement('span');pri.className='pill '+t.priority.toLowerCase();pri.textContent=t.priority;const cat=document.createElement('span');cat.className='pill';cat.textContent=t.category;foot.append(pri,cat);const date=document.createElement('span');date.className='date';date.textContent=t.date?'📅 '+formatDate(t.date):'Sin fecha';foot.append(date);content.append(foot);item.append(cb,content);item.addEventListener('click',()=>{selectTask(t.id);say('Tarea seleccionada: '+t.name)});container.appendChild(item);
 });
}
function render(){renderListOnly();$('totalStat').textContent=tasks.length;$('doneStat').textContent=tasks.filter(t=>t.done).length;$('pendingStat').textContent=tasks.filter(t=>!t.done).length;
 if(selectedId!==null&&!tasks.some(t=>t.id===selectedId)){selectedId=null}
 if(selectedId===null){$('previewName').textContent='Ninguna tarea seleccionada';$('previewDesc').textContent='Selecciona una tarea de la lista para ver sus detalles aquí.';$('previewMeta').innerHTML=''}
 else {const t=tasks.find(x=>x.id===selectedId);if(t){$('previewName').textContent=t.name;$('previewDesc').textContent=t.desc||'Sin descripción.';$('previewMeta').innerHTML='';[[t.priority,'pill '+t.priority.toLowerCase()],[t.category,'pill'],[t.done?'Completada':'Pendiente','pill'],[t.date?'Límite: '+formatDate(t.date):'Sin fecha límite','pill']].forEach(([txt,cls])=>{let s=document.createElement('span');s.className=cls;s.textContent=txt;$('previewMeta').appendChild(s)})}}
}
function editTask(){const t=tasks.find(x=>x.id===selectedId);if(!t){say('Selecciona una tarea de la lista para modificarla.');return}editingId=t.id;$('taskName').value=t.name;$('taskDesc').value=t.desc;$('taskDate').value=t.date;$('taskPriority').value=t.priority;$('taskCategory').value=t.category;$('saveBtn').textContent='Guardar cambios';$('taskName').focus();say('Modifica los campos y pulsa “Guardar cambios”.')}
function deleteTask(){const t=tasks.find(x=>x.id===selectedId);if(!t){say('Selecciona una tarea de la lista para eliminarla.');return}if(!confirm('¿Quieres eliminar la tarea "'+t.name+'"?'))return;tasks=tasks.filter(x=>x.id!==selectedId);selectedId=null;if(editingId===t.id)clearForm();say('Tarea eliminada.');render()}
function toggleComplete(){const t=tasks.find(x=>x.id===selectedId);if(!t){say('Selecciona una tarea para marcarla como completada.');return}t.done=!t.done;say(t.done?'¡Tarea marcada como completada!':'La tarea volvió a estar pendiente.');render()}
$('saveBtn').addEventListener('click',saveTask);$('cancelBtn').addEventListener('click',()=>{clearForm();say('Formulario limpio.');});
$('bottomAdd').addEventListener('click',()=>{clearForm();$('taskName').focus();say('Escribe los datos de la nueva tarea.');});
$('editBtn').addEventListener('click',editTask);$('deleteBtn').addEventListener('click',deleteTask);$('completeBtn').addEventListener('click',toggleComplete);
$('organizeBtn').addEventListener('click',()=>{ $('sortBy').value=$('sortBy').value;render();say('Lista organizada según el criterio seleccionado.');});
$('sortBy').addEventListener('change',render);$('filterBy').addEventListener('change',render);
$('quickFilter').addEventListener('change',()=>{$('filterBy').value=$('quickFilter').value;render()});
$('quickSort').addEventListener('change',()=>{const v=$('quickSort').value;$('sortBy').value=v;render()});
render();
