<template>
    <div class="call-monitor">
        <!-- b-alert show="15" v-for="item in notFound" :key="item.message" dismissible fade :max="3">{{ item.message }}</b-alert -->

        <b-button-toolbar key-nav aria-label="Toolbar with button groups" v-if="calls.length" class="mb-4">
            <div v-for="call in calls" :key="call.phone" :class="call.type" class="mr-2 mb-2">
                <div class="call-info">
                    <div class="d-flex justify-content-between">
                        <span>{{ call.time }}</span>
                        <span v-if="call.extension">{{ call.extension }} <span>({{ call.duration }}s)</span></span>
                    </div>
                </div>
                <b-button-group>
                    <template v-if="call.patients !== null">
                        <b-button @click="loadPatient(item.id)" v-for="item in call.patients" :disabled="patient.info && item.id === patient.info.id" :key="item.id" :class="call.status === 'ring' ? 'bg-primary' : call.status === 'connected' ? 'bg-success' : 'bg-secondary'">
                            {{ item.first_name }}<br>
                            {{ item.last_name }}
                        </b-button>
                    </template>
                    <b-button v-else :class="call.status === 'ring' ? 'bg-primary' : call.status === 'connected' ? 'bg-success' : 'bg-secondary'" disabled>
                        {{ call.phone }}
                    </b-button>

                </b-button-group>
            </div>


            <b-popover target="popover-call-stats" triggers="hover" placement="bottomleft" @show="loadStats">
                <div class="stats-popover" v-if="statsIsLoaded">
                    <div>{{ $t('Inbound calls') }}: {{stats.inbound}}</div>
                    <div>{{ $t('Served calls') }}:  {{stats.served}} ({{callsServedPercent}}%)</div>
                    <div>{{ $t('Duration') }}:  {{(new Date(parseInt(stats.duration) * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0]}}</div>
                    <div>{{ $t('Total number of calls') }}:  {{stats.total}}</div>
                </div>
                <div v-else class="spinner-grow" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </b-popover>
            <div class="info" :class="callsStyle" id="popover-call-stats">
                <font-awesome-icon icon="info-circle" size="2x"></font-awesome-icon>
            </div>

        </b-button-toolbar>


        <patient :patient="patient" v-if="notEmptyObject(patient)"></patient>
        <h5 v-else-if="!calls.length">{{ message }}</h5>
        <div v-else class="spinner-grow" role="status">
            <span class="sr-only">Loading...</span>
        </div>


    </div>

</template>

<script>
    import Patient from "./Patient"
    import moment from 'moment'
    moment.locale('de');

    export default {
        name: "Call",
        components: {Patient},
        data() {
            return {
                message: 'Waiting for a call ...',
                patient: {},
                //patients: [],
                calls: [], //array of last calls
                numCallsDisplayed: 5,
                stats: {},
                statsIsLoaded: false
            }
        },
        sockets: {
            connect: function () {
                console.log('Socket connected')
            },
            call: function (data) {
                if (data.type === 'inbound' && data.data.caller && data.data.called === "3530") {
                    //first remove duplicates
                    this.calls = this.calls.filter(call => call.phone !== data.data.caller);
                    this.calls.push({
                        phone: data.data.caller,
                        status: 'ring',
                        search: this.search(data.data.caller),
                        patients: null,
                        time: moment.unix(data.data.time).format("HH:mm"),
                        extension: '',
                        duration: 0,
                        timeout: null,
                        type: data.type
                    });
                } else if (data.type === 'outbound') {
                    this.calls.push({
                        phone: data.data.called,
                        status: 'ring',
                        search: this.search(data.data.called),
                        patients: null,
                        time: moment.unix(data.data.time).format("HH:mm"),
                        extension: data.data.extension,
                        duration: 0,
                        timeout: null,
                        type: data.type
                    });
                }

                if (data.type === 'connected' || data.type === 'disconnected') {
                    //update status to green
                    let call = this.calls.find(({ phone }) => phone === data.data.caller);
                    if (call) {
                        call.status = data.type;
                        if (data.type === 'connected') {
                            call.extension = '6' + data.data.extension;
                            call.timeout = setInterval(() => {call.duration++}, 1000);
                            //solve with Promise @todo
                            call.search.then(patients => {
                                if (patients.length) {
                                    this.loadPatient(patients[0].id);
                                }
                            });
                        } else if (data.type === 'disconnected') {
                            clearInterval(call.timeout);
                            call.duration = data.data.duration;
                        }
                    }
                }
            }
        },
        methods: {
            loadPatient(id) {
                //this.patient = {};
                this.message = 'Loading ...';
                axios.get('/patients/' + id)
                    .then(response => {
                        this.patient = response.data;
                        if (this.$route.params.id != id) {
                            this.$router.push('/call/' + id);
                        }
                    })
            },
            loadStats() {
                this.statsIsLoaded = false;
                axios.get('/calls/stats')
                    .then(response => {
                        this.stats = response.data;
                        this.statsIsLoaded = true;
                    });
            },
            search(phone) {
                //this.patients = [];
                return axios.get('/contact/patients', {
                    params: {
                        phone: phone
                    }
                })
                    .then(response => {
                        if (response.data.length) {

                            //find call
                            let num = phone;
                            let call = this.calls.find(({ phone }) => phone === num);

                            //update patients list for a call
                            call.patients = response.data;

                            //in case no patient open
                            if (!this.notEmptyObject(this.patient) || !this.isCallConnected) {
                                this.loadPatient(response.data[0].id);
                            }
                        }
                        if (this.calls.length > this.numCallsDisplayed) {
                            this.calls = this.calls.slice(-this.numCallsDisplayed);
                        }
                        return response.data
                    })
                    .catch(error => {
                        console.log('search error', error)
                        console.log('search error response', error.response)
                    })
            }
        },
        computed: {
            isCallConnected() {
                return this.calls.find(({ status }) => status === 'connected')
            },
            callsServedPercent() {
                return Math.round((this.stats.served * 100) / this.stats.inbound)
            },
            callsStyle() {
                if (this.callsServedPercent < 75) {
                    return 'text-danger';
                } else if (this.callsServedPercent < 90) {
                    return 'text-orange';
                } else if (this.callsServedPercent >= 90) {
                    return 'text-success';
                } else {
                    return 'text-secondary';
                }
            }
        },
        watch: {
            calls() {
                //console.log('calls', this.calls);
                //if (this.calls.length && !this.notEmptyObject(this.patient)) {
                /*
                if (this.calls.length) {
                    console.log(this.calls);
                    if (this.calls[this.calls.length - 1].patients !== null) {
                        this.loadPatient(this.calls[this.calls.length - 1].patients[0].id)
                    }
                }
                 */
            }
        },
        mounted() {
            //console.log('Websocket url: ', this.$config);
            axios.get('/calls')
                .then(response => {
                    if (response.data.length) {
                        let calls = _.uniqBy(response.data, 'caller');
                        calls.forEach((item) => {
                            this.calls.unshift({
                                phone: item.type === 'inbound' ? item.caller : item.called,
                                status: 'disconnected',
                                search: this.search(item.caller),
                                patients: null,
                                time: moment(item.called_at).format("HH:mm"),
                                extension: '',
                                duration: item.extension,
                                timeout: null,
                                type: item.type
                            })
                        })
                    }
                });
            this.loadStats();
        }
    }
</script>

<style lang="scss">
    .call-monitor {
        .btn-toolbar {
            button {
                min-height: 60px;
            }
            .call-info {
                font-size: 0.78rem;
                //width: 100%;
                flex-basis: 100%;
                //flex-grow: 0;
            }
            .btn-group {
                /*
                > .btn:nth-child(2) {
                    border-top-left-radius: 0.25rem;
                    border-bottom-left-radius: 0.25rem;
                }
                > .btn {
                    flex-grow: 0;
                }
                 */
            }
            .outbound {
                .bg-primary{
                    background-color: #d2b4de !important;
                }
                .bg-success {
                    background-color: #5b2c6f !important;
                }
                .bg-secondary {
                    background-color: #d2b4de !important;
                }
            }
            .info {
                position: absolute;
                right: 20px;
                cursor: pointer;
            }

        }
    }
    .stats-popover {
        font-size: 14px !important;
    }
</style>
