'use strict'

const CLAVE = 'farmacia_inventario';
const form = document.getElementById('form');
const lista = document.getElementById('list');
const vacio = document.getElementById('vacio');
const contador = document.getElementById('contador');
const toast = document.getElementById('toast');
const titleForm = document.getElementById('titleForm');

const save = document.getElementById('save');
const cancel = document.getElementById('cancel');

let editado = null;

/*-------Almacenamiento--------*/
const leer = () =>{
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; }
    catch { return []; }
};

const guardar = (datos) => {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
}

/* Validar form*/
const reglas ={
    codigo(v) {
        if (!v) return 'El código de artículo es obligatorio';
        if (v.length < 3) return 'El código debe tener al menos 3 caracteres';
        
        const repetida = leer().some( e => e.codigo === v && e.codigo !== editado );
        if(repetida) return 'Este código ya está registrado';
        return ''; 
    },

    nombre(v){
        if (!v) return 'El nombre del medicamento es obligatorio';
        if (v.length < 2) return 'Escribe un nombre válido';
        if (v.length > 100) return 'Máximo 100 caracteres';
        return '';
    },

    formula(v){
        if (!v) return 'La fórmula/sustancia activa es obligatoria';
        return '';
    },

    precio(v) {
        if (!v) return 'El precio es obligatorio';
        if (isNaN(v) || Number(v) <= 0) return 'Escribe un precio válido';
        return ''; 
    },

    stock(v) {
        if (v === '' || isNaN(v) || Number(v) < 0) return 'Ingresa existencias válidas';
        return '';
    }
};

function validarCampo( input ){
    const valor = input.value.trim();
    const reglaFn = reglas[input.name];
    if (!reglaFn) return true;
    
    const msj = reglaFn(valor);
    const errorEl = document.getElementById('err-' + input.name);
    if (errorEl) errorEl.textContent = msj;

    input.classList.toggle('invalido', !!msj);
    input.classList.toggle('valido', !msj);
    input.setAttribute('aria-invalid', msj ? 'true' : 'false');
    return !msj;
}

form.querySelectorAll('input').forEach( input => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
        if( input.classList.contains('invalido')) 
            validarCampo(input);
    });
});

/*--Guardar / Eliminar / Editar--*/ 
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input')];
    const todoOk = inputs.map(validarCampo).every(Boolean);

    if(!todoOk){
        const primerInvalido = inputs.find(i => i.classList.contains('invalido'));
        if (primerInvalido) primerInvalido.focus();
        return;
    }
    
    const medicamento = {
        codigo : form.codigo.value.trim(),
        nombre : form.nombre.value.trim(),
        formula : form.formula.value.trim(),
        precio : parseFloat(form.precio.value.trim()).toFixed(2),
        stock : parseInt(form.stock.value.trim())
    };

    let datos = leer();

    if(editado) {
        datos = datos.map(x => x.codigo === editado ? medicamento : x); 
    }else{
        datos.push(medicamento);
    }
    guardar(datos);
    mostrarMensaje('Medicamento guardado correctamente');
    render();

    limpiar();
    editado = null;
    reestablecerForm();
});

function esc( t ){
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

let temporizador;
function mostrarMensaje(mensaje){
    toast.textContent = mensaje;
    toast.classList.add('visible');
    
    clearTimeout(temporizador);
    temporizador = setTimeout(()=>toast.classList.remove('visible'), 4000);
}

function render () {
    const datos = leer();
    contador.textContent = `(${datos.length})`;
    vacio.hidden = datos.length > 0;
    
    lista.innerHTML = datos.map(e => ` 
        <li class="items">
            <div class="datos">
                <strong>${esc(e.nombre)}</strong><br>
                <small>Fórmula: ${esc(e.formula)} | Código: ${esc(e.codigo)}</small><br>
                <span>Precio: $${esc(e.precio)} | Stock: ${esc(e.stock)} pzas</span>
            </div>
            <div class="botones">
                <button class="btn btn-warning" data-action="editar" data-id="${esc(e.codigo)}">Editar</button>
                <button class="btn btn-danger" data-action="eliminar" data-id="${esc(e.codigo)}">Eliminar</button>
            </div>
        </li>
    `).join('');
}

function eliminar(cod){
     const est = leer().find(x => x.codigo === cod);
    if (!est) return;

    const confirmar = confirm(
        `¿Está seguro de eliminar el medicamento "${est.nombre}"?`
    );

    if (!confirmar) return;

    guardar(leer().filter(x => x.codigo !== cod));
    mostrarMensaje('Medicamento eliminado');
    render();
}

function editar(cod){
    const med = leer().find( x => x.codigo === cod);
    if (!med) return;

    editado = cod;
    form.codigo.value = med.codigo;
    form.nombre.value = med.nombre;
    form.formula.value = med.formula;
    form.precio.value = med.precio;
    form.stock.value = med.stock;
    
    form.codigo.disabled = true;

    form.querySelectorAll('input').forEach(validarCampo);
    titleForm.textContent = 'Editar Medicamento';
    save.textContent = 'Guardar Cambios';
} 

function limpiar(){
    form.codigo.value = '';
    form.nombre.value = '';
    form.formula.value = '';
    form.precio.value = '';
    form.stock.value = '';
}

function reestablecerForm(){
    editado = null;
    form.reset();
    form.codigo.disabled = false;
    titleForm.textContent = 'Nuevo Medicamento';
    save.textContent = 'Guardar';
}

lista.addEventListener('click', (e) =>{
    const b = e.target.closest('button[data-action]');
    if (!b) return;

    b.dataset.action === 'editar' ? editar(b.dataset.id) : eliminar(b.dataset.id);
});

render();

if( 'serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then( () => console.log('Service worker de Farmacia registrado'))
            .catch( err => console.log('Service worker falló', err))
    })
}
