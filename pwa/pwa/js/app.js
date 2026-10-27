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
