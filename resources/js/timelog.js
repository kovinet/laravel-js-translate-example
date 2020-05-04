//require('./bootstrap')
window.Locale = 'de';
import Vue from 'vue'
import languageBundle from '@kirschbaum-development/laravel-translations-loader!@kirschbaum-development/laravel-translations-loader'
import VueI18n from 'vue-i18n'
import App from './timelog/App.vue'
import { ModalPlugin } from 'bootstrap-vue'

window.Vue = Vue;
Vue.use(ModalPlugin);
Vue.use(VueI18n);
window.axios = require('axios');
import VueSocketIO from 'vue-socket.io';

const config = JSON.parse(document.getElementById('config').innerHTML);
if (config.hasOwnProperty('SOCKETIO_SOCKET') && config.SOCKETIO_SOCKET) {
    Vue.use(new VueSocketIO({
        debug: false,
        connection: config.SOCKETIO_SOCKET
    }));
}

const i18n = new VueI18n({
    locale: window.Locale,
    messages: languageBundle
});

new Vue({
    el: '#app',
    render: h => h(App),
    i18n
});
