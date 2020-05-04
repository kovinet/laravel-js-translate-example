import {options} from "vue-resource/src/util";
require('./bootstrap');

import Vue from 'vue'
import VueRouter from 'vue-router'
import languageBundle from '@kirschbaum-development/laravel-translations-loader!@kirschbaum-development/laravel-translations-loader!./../lang/index.js'
// import languageBundle from '../lang/index.js';
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import VueResource from 'vue-resource'
import { FormHelpers } from 'vue-laravel-forms'
import routes from './routes'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faUser,
    faFileMedical,
    faFileAlt,
    faFilePdf,
    faEdit,
    faPlus,
    faPencilAlt,
    faTrashAlt,
    faSync,
    faInfoCircle,
    faSearch
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faUser, faFileMedical, faFileAlt, faFilePdf, faEdit, faPlus, faPencilAlt, faTrashAlt, faSync, faInfoCircle, faSearch);

import moment from 'moment'
moment.locale('de');
//import io from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';
const config = JSON.parse(document.getElementById('config').innerHTML);
const settings = JSON.parse(document.getElementById('settings').innerHTML);
console.log('config app', config);
if (config.hasOwnProperty('SOCKETIO_SOCKET')) {
    Vue.use(new VueSocketIO({
        debug: true,
        connection: config.SOCKETIO_SOCKET
    }));
}


window.Vue = Vue;
Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(BootstrapVue);
Vue.use(FormHelpers);

//Vue.use(VueSocketIO, SocketInstance);

const i18n = new VueI18n({
    locale: window.Locale,
    messages: languageBundle
});

Vue.prototype.$userId = document.querySelector("meta[name='user-id']").getAttribute('content');
Vue.prototype.$userName = document.querySelector("meta[name='user-name']").getAttribute('content');
Vue.prototype.$userRole = document.querySelector("meta[name='user-role']").getAttribute('content');
Vue.prototype.$config = config;
Vue.prototype.$settings = settings;

//console.log('settings', settings);

Vue.http.interceptors.push((request, next) => {
    const token = document.querySelector('#token').getAttribute('content')

    if (token) {
        request.headers.set('X-CSRF-TOKEN', token);
    }
    next();
});
axios.interceptors.response.use(function (response) {
    return response
}, function (error) {
    if (error.response.status === 401) {
        location.reload();
    }
    return Promise.reject(error)
});

// window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
Vue.filter('formatBirthdate', function (value, format = 'DD.MM.YYYY') {
    if (value) {
        return moment(String(value)).format(format) + ' (' + moment().diff(value, 'years')  + ')';
    }
});
Vue.filter('formatDate', function (value, format = 'DD.MM.YYYY') {
    if (value) {
        let date = moment(String(value));
        let now = moment();
        let dif = Math.abs(now.diff(date, 'days'));
        if (dif >= 2) {
            return date.format(format)
        } else {
            return date.calendar().split(' ')[0];
        }
    }
});

Vue.mixin({
    methods: {
        notEmptyObject(someObject){
            return Object.keys(someObject).length
        },
        isDifferentQuarter(date1, date2) {
            let q1 = moment(date1).quarter();
            let q2 = moment(date2).quarter();
            return q1 !== q2;
        }
    }
});
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
//Vue.component('loading',{ template: '<div>Loading!</div>'});
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;
const router = new VueRouter(routes);

const app = new Vue({
    el: '#app',
    router,
    data: {
        isSidebarActive: false,
        showCollapse: false,
        showCollapse2: false,
        loading: false
    },
    methods: {
        sidebarToggle() {
            this.isSidebarActive = !this.isSidebarActive
        }
    },
    watch: {
        // close sidebar on route change
        '$route': function (value) {
            this.isSidebarActive = false
        }
    },
    i18n,
    mounted() {
        //this.$socket.onmessage = (data) => console.log('socket data', data)
    }
});
/*
router.beforeEach((to, from, next) => {
    app.loading = true;
    next();
});

router.afterEach((to, from) => {
    app.loading = false;
});
*/
