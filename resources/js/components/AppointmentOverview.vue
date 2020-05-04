<template>
    <div class="appointment-overview">

        <div class="d-flex mb-4">
            <div class="pr-4 align-self-center">
                <div>
                    {{ $t('Sum Duration') }}: {{ durationSum }}
                </div>
                <div>
                    {{ $t('Start') }}: {{ appointments.length ? appointments[0].time : '' }} + {{ durationSum }} = {{ timeAdd(appointments.length ? appointments[0].time : '00:00', durationSum) }}
                </div>
            </div>
            <div class="mr-auto align-self-center">
                <div>
                    {{ $t('Entries') }}: {{ appointments.length }}
                </div>
                <div>
                    {{ $t('Average') }}: {{ averageAppointmentDuration }} min
                </div>
            </div>
            <div style="max-width: 400px;" class="mx-2">
                <b-form-select v-model="selectedCalendar" :options="calendars"></b-form-select>
            </div>
            <div class="date-picker">
                <date-pick
                    v-model="selectedDate"
                    :displayFormat="'DD.MM.YY'"
                    :weekdays="['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']"
                    :inputAttributes="{class: 'form-control'}"
                ></date-pick>
            </div>
        </div>

        <b-table :items="appointments" :fields="fields" :busy="isBusy" small>
            <template v-slot:table-busy>
                <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>{{ $t('Loading...') }}</strong>
                </div>
            </template>

            <template v-slot:cell(name)="data">
                <router-link :to="'/patient/' + data.item.patient_id" target="_blank">{{ data.item.last_name }}, {{ data.item.first_name }}</router-link> ({{ formatAge(data.item.birth_date) }})
            </template>

            <template v-slot:cell(started_at)="data">
                {{ data.value | formatDate('HH:mm') }}
            </template>

            <template v-slot:cell(finished_at)="data">
                {{ data.item.finished_at | formatDate('HH:mm')  }}
            </template>

            <template v-slot:cell(visit_duration)="data">
                {{ minuteDiff(data.item.started_at, data.item.finished_at) }}
            </template>
        </b-table>
    </div>
</template>

<script>
    import moment from 'moment'
    moment.locale('de');
    import DatePick from 'vue-date-pick'
    import 'vue-date-pick/dist/vueDatePick.css'

    export default {
        name: "AppointmentOverview",
        components: {DatePick},
        data() {
            return {
                isBusy: true,
                appointments: [],
                selectedDate: this.$route.params.date || moment().format('YYYY-MM-DD'),
                selectedCalendar: null,
                calendars: [{value: 'A-PHA', text: 'A-PHA'}],
                fields: [
                    {
                        key: 'time',
                        label: this.$t('Time'),
                        sortable: true
                    },
                    {
                        key: 'duration',
                        label: this.$t('Duration'),
                        class: 'text-right',
                        sortable: true
                    },
                    {
                        key: 'description',
                        label: this.$t('Notice')
                    },
                    {
                        key: 'status',
                        label: this.$t('S.')
                    },
                    {
                        key: 'name',
                        label: this.$t('Name')
                    },
                    {
                        key: 'updated_by',
                        label: this.$t('User-ID'),
                        class: 'text-center',
                        sortable: true
                    },
                    {
                        key: 'dmp',
                        label: this.$t('DMP'),
                        class: 'text-center',
                        sortable: true
                    },
                    {
                        key: 'labor',
                        label: this.$t('Labor'),
                        class: 'text-center',
                        sortable: true
                    },
                    {
                        key: 'time_diff',
                        label: this.$t('AWait'),
                        class: 'text-right',
                        sortable: true,
                        formatter: (val) => {
                            let time = moment.duration(val);
                            return time.humanize();
                        }
                    },
                    {
                        key: 'wait_time',
                        label: this.$t('PWait'),
                        class: 'text-right',
                        sortable: true
                    },
                    {
                        key: 'visit_duration',
                        label: this.$t('PDuration'),
                        class: 'text-right',
                        sortable: true
                    },
                    {
                        key: 'visits',
                        label: this.$t('Visits'),
                        class: 'text-right',
                        sortable: true
                    }
                ]
            }
        },
        methods: {
            loadCalendars() {
                return axios.get(`/appointments/calendar-list`)
                    .then(response => {
                        this.calendars = response.data;
                    })
            },
            loadAppointments() {
                axios.get(`/appointments/calendar/${this.selectedDate}?visits=1&calendar=${encodeURIComponent(this.selectedCalendar)}`)
                    .then(response => {
                        this.appointments = response.data;
                        this.isBusy = false;
                    })
            },
            formatAge(value) {
                return moment().diff(moment(String(value)), 'years')
            },
            minuteDiff(started_at, finished_at) {
                if (started_at && finished_at) {
                    return moment(String(finished_at)).diff(moment(String(started_at)), 'minutes');
                }
            },
            dayDiff(value) {
                let diff = moment(String(this.selectedDate)).diff(moment(String(value)));
                let duration = moment.duration(diff);
                let ret = '';
                if (duration.days()) {
                    ret += duration.days() + ' Tage ';
                }
                return  ret + duration.hours() + 'h';
            },
            timeAdd(from, to) {
                return moment(from, 'HH:mm').add(moment.duration(to)).format('HH:mm');

            }
        },
        computed: {
            durationSum() {
                let minutes = this.appointments.reduce((sum, val) => {
                    return sum + val.duration;
                }, 0);
                return moment.utc().startOf('day').add({ minutes: minutes }).format('HH:mm')
                //return moment.duration(minutes, 'minutes')
            },
            averageAppointmentDuration() {
                if (this.appointments.length) {
                    let minutes = this.appointments.reduce((sum, val) => {
                        return sum + val.duration;
                    }, 0);
                    return (minutes / this.appointments.length).toFixed(2).replace('.', ',');
                } else {
                    return 0;
                }
            }
        },
        created() {
            this.loadCalendars()
                .then(() => {
                    this.selectedCalendar = this.calendars[0];
                    this.loadAppointments();
                });
        },
        watch: {
            '$route' (to, from) {
                if (to.query.hasOwnProperty('calendar')) {
                    if (to.params.date !== from.params.date || to.query.calendar !== from.query.calendar) {
                        this.loadAppointments()
                    }
                }
            },
            selectedDate(date) {
                if (date) {
                    this.$router.push(`/calendar-overview/${date}?calendar=${encodeURIComponent(this.selectedCalendar)}`)
                }
            },
            selectedCalendar(name) {
                if (name) {
                    this.$router.push(`/calendar-overview/${this.selectedDate}?calendar=${encodeURIComponent(name)}`)
                }
            }
        }
    }
</script>

<style scoped>

</style>
