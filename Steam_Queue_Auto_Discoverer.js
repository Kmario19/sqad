// ==UserScript==
// @name        Steam Queue Auto Discoverer
// @author      Kmario19
// @version     1.0.1
// @description Descubre el explorador de Steam tres veces para obtener cromos del evento
// @namespace   https://github.com/Kmario19
// @match       https://store.steampowered.com/explore/
// @updateURL   https://github.com/Kmario19/sqad/blob/master/Steam_Queue_Auto_Discoverer.js
// @downloadURL https://github.com/Kmario19/sqad/blob/master/Steam_Queue_Auto_Discoverer.js
// @grant       none
// ==/UserScript==

var n = 3;
var DiscoveryQueueModal, GenerateQueue = function( queueNumber ) {
    DiscoveryQueueModal = ShowBlockingWaitDialog( 'Explorando lista...', 'Generando lista de descubrimiento #' + ++queueNumber );

    jQuery.post( 'https://store.steampowered.com/explore/generatenewdiscoveryqueue', { sessionid: g_sessionID, queuetype: 0 } ).done( function( data ) {
        var requests = [], done = 0, errorShown;

        for( var i = 0; i < data.queue.length; i++ ) {
            var request = jQuery.post( 'https://store.steampowered.com/app/10', { appid_to_clear_from_queue: data.queue[ i ], sessionid: g_sessionID } );

            request.done( function()
                         {
                if( errorShown ) {
                    return;
                }

                DiscoveryQueueModal.Dismiss();
                DiscoveryQueueModal = ShowBlockingWaitDialog( 'Explorando la lista...', 'Cargando juego ' + ++done + ' de ' + data.queue.length );
            } );

            request.fail( function() {
                errorShown = true;

                DiscoveryQueueModal.Dismiss();
                DiscoveryQueueModal = ShowConfirmDialog( 'Error', 'Fallo al quitar juego de la lista #' + ++done, 'Intentar de nuevo' ).done( function() {
                    GenerateQueue( queueNumber - 1 );
                });
            } );

            requests.push( request );
        }

        jQuery.when.apply( jQuery, requests ).done( function() {
            DiscoveryQueueModal.Dismiss();

            if( queueNumber < n ) {
                GenerateQueue( queueNumber );
            } else {
                DiscoveryQueueModal = ShowConfirmDialog( 'Listo', 'La lista ha sido explorada ' + queueNumber + ' veces', 'Recargar la página' ).done( function() {
                    ShowBlockingWaitDialog( 'Recargando la página' );
                    window.location.reload();
                });
            }
        } );
    } ).fail( function() {
        DiscoveryQueueModal.Dismiss();
        DiscoveryQueueModal = ShowConfirmDialog( 'Error', 'Fallo al generar nueva lista #' + queueNumber, 'Intentar de nuevo' ).done( function() {
            GenerateQueue( queueNumber - 1 );
        });
    } );
};

var buttonContainer = document.createElement( 'div' );
buttonContainer.className = 'discovery_queue_customize_ctn';
buttonContainer.innerHTML = '<div class="btnv6_blue_hoverfade btn_medium" id="js-cheat-queue"><span>Exploración automática</span></div><span>Completa la lista de descrubirmiento ' + n + ' veces para obtener las cromos del evento.</span>';

var container = document.querySelector( '.discovery_queue_customize_ctn' );
container.parentNode.insertBefore( buttonContainer, container );

var button = document.getElementById( 'js-cheat-queue' );

button.addEventListener( 'click', function( ) {
    GenerateQueue( 0 );
}, false );
