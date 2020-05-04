<template>
    <div class="container patient-overview">
        <div class="row mb-4">
            <div class="col-4">
                <b-button-toolbar key-nav aria-label="Termine" v-if="appointments.length" class="delta">
                    <b-button-group>
                        <b-button disabled :class="delta1 > 9 ? 'bg-success' : 'bg-orange'">{{ delta1 }} min</b-button>
                        <b-button disabled :class="delta2 > 9 ? 'bg-success' : 'bg-orange'">{{ delta2 }} min</b-button>
                    </b-button-group>
                </b-button-toolbar>

                <b-button-toolbar key-nav aria-label="Termine" v-if="appointments.length" class="nav">
                    <b-button-group>
                        <b-button @click="loadPrev" :disabled="isFirst()" :class="getButtonClass(-1)" v-if="currentPatientIndex > 0">
                            {{ appointments[(currentPatientIndex - 1)].time }} <br>
                            {{ appointments[(currentPatientIndex - 1)].duration }}
                        </b-button>
                        <b-button v-else disabled>
                            <span class="invisible">
                                00:00 <br>
                                0
                            </span>
                        </b-button>
                        <b-button :class="getButtonClass(0)" disabled>
                            {{ appointments[currentPatientIndex].time }} <br>
                            {{ appointments[currentPatientIndex].duration }}
                        </b-button>
                        <b-button @click="loadNext" :disabled="isLast()" :class="getButtonClass(1)" v-if="currentPatientIndex < (appointments.length - 1)">
                            {{ appointments[(currentPatientIndex + 1)].time }} <br>
                            {{ appointments[(currentPatientIndex + 1)].duration }}
                        </b-button>
                        <b-button v-else disabled>
                            <span class="invisible">
                                00:00 <br>
                                0
                            </span>
                        </b-button>
                    </b-button-group>
                </b-button-toolbar>
            </div>
            <div class="col-8">
                <div class="d-flex justify-content-end">
                    <div class="date-picker">
                        <date-pick
                            v-model="selectedDate"
                            :displayFormat="'DD.MM.YY'"
                            :weekdays="['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']"
                            :inputAttributes="{class: 'form-control'}"
                        ></date-pick>
                    </div>
                </div>
            </div>
        </div>

        <patient :patient="patient" v-if="notEmptyObject(patient)"></patient>
        <h5 v-else-if="!appointments.length">{{ $t('There are no appointments on {date}', {date: $options.filters.formatDate(selectedDate) }) }}</h5>
        <div v-else class="spinner-grow" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</template>

<script>
    import moment from 'moment'
    moment.locale('de');
    import DatePick from 'vue-date-pick'
    import 'vue-date-pick/dist/vueDatePick.css'
    import Patient from "./Patient";

    export default {
        name: "PreparationOverview",
        components: {DatePick, Patient},
        data() {
            return {
                patient: {},
                currentDate: moment(),
                selectedDate: this.$route.params.date || moment().format('YYYY-MM-DD'),
                currentPatientIndex: 0,
                appointments: [],
                delta1: 0,
                delta2: 0
            }
        },
        methods: {
            loadNext() {
                this.currentPatientIndex ++;
                this.loadPatient(this.appointments[this.currentPatientIndex].patient_id)
            },
            loadPrev() {
                this.currentPatientIndex --;
                this.loadPatient(this.appointments[this.currentPatientIndex].patient_id)
            },
            loadAppointments() {
                axios.get(`/appointments/calendar/${this.selectedDate}?calendar=A-PHA`) //@TODO calendar name should be dynamic
                    .then(response => {
                        this.appointments = response.data;
                        //this.currentPatientIndex = 0
                        this.calculateDeltas()
                    })
            },
            calculateDeltas() { //time difference between appointments
                if (this.isFirst()) {
                    this.delta1 = 0;
                } else {
                    let from = moment(this.appointments[this.currentPatientIndex - 1].time, 'HH:mm');
                    let to = moment(this.appointments[this.currentPatientIndex].time, 'HH:mm');
                    let duration = to.diff(from);
                    this.delta1 = moment.duration(to.diff(from)).asMinutes();
                }
                if (this.isLast()) {
                    this.delta2 = 0;
                } else {
                    let from = moment(this.appointments[this.currentPatientIndex].time, 'HH:mm');
                    let to = moment(this.appointments[this.currentPatientIndex + 1].time, 'HH:mm');
                    let duration = to.diff(from);
                    this.delta2 = moment.duration(to.diff(from)).asMinutes();
                }
            },
            loadPatient(id) {
                //axios.get('/patients/15517')
                this.patient = {};
                axios.get('/patients/' + id)
                    .then(response => {
                        this.patient = response.data;
                        if (this.$route.params.id != id) {
                            this.$router.push('/calendar/' + this.selectedDate + '/' + id);
                        }
                        this.currentPatientIndex = this.getPatientIndex(id);
                    })
            },
            isFirst() {
                return this.currentPatientIndex === 0
            },
            isLast() {
                return this.appointments.length < 2 || ((this.currentPatientIndex + 1) === this.appointments.length)
            },
            timeDiff(time1, time2) {

            },
            getButtonClass(offset) {
                let index = this.currentPatientIndex + offset;
                if (this.appointments[index].diff > 2) {
                    return 'bg-success'
                } else if (this.appointments[index].diff < 5) {
                    return 'bg-orange text-dark'
                } {
                    return 'bg-warning text-dark'
                }
            },
            getPatientIndex(patient_id) {
                return _.findIndex(this.appointments, function (o) {
                    return parseInt(o.patient_id) === parseInt(patient_id)
                })
            }
        },
        computed: {
            dateStr() {
                return moment(this.selectedDate).format('dddd, DD.MM.YYYY')
            }
        },
        watch: {
            '$route' (to, from) {
                if (to.params.date !== from.params.date) {
                    this.loadAppointments()
                }
            },
            selectedDate(date) {
                if (date) {
                    this.$router.push('/calendar/' + date)
                }
            },
            appointments() {
                let index = this.$route.params.id ? this.getPatientIndex(this.$route.params.id) : 0;
                if (index === -1) { //provided patient not found for current date
                    console.log('not found push');
                    this.$router.push('/calendar/' + this.currentDate + '/' + this.appointments[0].patient_id);
                    return
                }
                console.log('index', index);
                console.log('paramns', this.$route.params.id);
                if (this.appointments.length) {
                    this.loadPatient(this.appointments[index].patient_id)
                } else {
                    this.patient = {}
                }
            },
            currentPatientIndex() {
                this.calculateDeltas()
            }
        },
        mounted() {
            //this.loadPatient(2349)
            this.loadAppointments()
        }
    }
</script>

<style lang="scss">
    .date-picker {
        width: 120px;
    }
    .patient-overview {
        .btn-group {
            flex: 1;
        }
        .nav {
            margin-top: -1px;
            .btn {
                border-top-right-radius: 0;
                border-top-left-radius: 0;
            }
        }
        .delta {
            .btn {
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;
            }
        }
    }
</style>
