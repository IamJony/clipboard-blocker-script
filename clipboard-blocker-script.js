// ==UserScript==
// @name         clipboard-blocker-script
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Userscript diseñado para entornos educativos que deshabilita las funciones de copiar, cortar y pegar, además del menú contextual (clic derecho) en cualquier sitio web.
// @author       IamJony
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ====== CONFIGURACIÓN ======
    const MENSAJE = "⚠️ ¡No copies de Internet!\n\nEstás en clase de Informática. 💻✍️";
    const MOSTRAR_TOAST = true; // false = usar alert() clásico

    // ====== FUNCIÓN DE AVISO (TOAST) ======
    function mostrarAviso() {
        if (MOSTRAR_TOAST) {
            let toast = document.getElementById('__aviso-copia__');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = '__aviso-copia__';
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #d32f2f;
                    color: #fff;
                    padding: 14px 24px;
                    border-radius: 10px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 15px;
                    font-weight: bold;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                    z-index: 2147483647;
                    text-align: center;
                    white-space: pre-line;
                    pointer-events: none;
                    transition: opacity 0.4s;
                `;
                document.body.appendChild(toast);
            }
            toast.textContent = MENSAJE;
            toast.style.opacity = '1';
            clearTimeout(toast._timeout);
            toast._timeout = setTimeout(() => {
                toast.style.opacity = '0';
            }, 2500);
        } else {
            alert(MENSAJE);
        }
    }

    // ====== FUNCIÓN DE BLOQUEO ======
    const bloquear = (e) => {
        e.stopPropagation();
        e.preventDefault();
        mostrarAviso();
        return false;
    };

    // ====== BLOQUEAR EVENTOS DE COPIA/PEGADO ======
    // NO incluimos 'contextmenu' → el menú del clic derecho SÍ aparece
    const eventos = [
        'copy',        // Ctrl+C o clic en "Copiar"
        'cut',         // Ctrl+X o clic en "Cortar"
        'paste',       // Ctrl+V o clic en "Pegar"
        'beforecopy',
        'beforecut',
        'beforepaste'
    ];

    eventos.forEach(evt => {
        document.addEventListener(evt, bloquear, true);
        window.addEventListener(evt, bloquear, true);
    });

    // ====== BLOQUEAR ATAJOS DE TECLADO ======
    document.addEventListener('keydown', function (e) {
        const ctrl = e.ctrlKey || e.metaKey;

        // Ctrl+C, Ctrl+X, Ctrl+V (copiar, cortar, pegar)
        // Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P (seleccionar todo, ver código, guardar, imprimir)
        if (ctrl && ['c', 'x', 'v', 'a', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
            e.stopPropagation();
            e.preventDefault();
            mostrarAviso();
            return false;
        }

        // F12 y Ctrl+Shift+I / J / C (DevTools)
        if (
            e.key === 'F12' ||
            (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
        ) {
            e.stopPropagation();
            e.preventDefault();
            mostrarAviso();
            return false;
        }
    }, true);

    // ====== DESACTIVAR SELECCIÓN DE TEXTO POR CSS ======
    // Sin selección → no se puede copiar ni con el menú contextual
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }
        input, textarea, [contenteditable="true"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
    `;

    const insertarEstilo = () => {
        if (document.head) {
            document.head.appendChild(style);
        } else {
            requestAnimationFrame(insertarEstilo);
        }
    };
    insertarEstilo();

    // ====== DESHABILITAR LA OPCIÓN "COPIAR" DEL MENÚ CONTEXTUAL ======
    // Cuando aparece el menú del clic derecho, quitamos la selección
    // para que la opción "Copiar" aparezca deshabilitada (en gris).
    document.addEventListener('contextmenu', function (e) {
        // Solo limpiamos la selección, NO bloqueamos el menú
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            sel.removeAllRanges();
        }
        // Quitamos foco de inputs también
        if (document.activeElement && document.activeElement.blur) {
            // Solo si no es un input donde el usuario necesita escribir
            const tag = document.activeElement.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                document.activeElement.blur();
            }
        }
    }, true);

})();
