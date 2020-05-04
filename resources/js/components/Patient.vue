<template>
    <div class="patient">
        <div class="row">
            <div class="col-lg-12">
                <div class="row">
                    <div class="col-7">
                        <h2>
                            <router-link to="/reports"><font-awesome-icon icon="search"></font-awesome-icon></router-link>
                            {{ patient.info.suffix }} {{ patient.info.last_name }}, {{ patient.info.first_name }}
                        </h2>
                        <p class="mb-0">{{ patient.info.birth_date | formatBirthdate }}</p>
                    </div>
                    <div class="col-5">
                        <h5>{{ patient.phone.join(', ') }}</h5>
                        <p class="mb-0">
                            {{ patient.info.street }} {{ patient.info.street_no }}, {{ patient.info.zip }} {{ patient.info.city }}
                            <span v-if="patient.insurance.length"><br>{{ patient.insurance[0].cnameabrkt }}</span>
                        </p>

                    </div>
                </div>
            </div>

            <!-- div class="col-lg-2 text-right">
                <div style="display: inline-block;" class="text-left">
                    L {{ patient.status.labour[0] }} / {{ patient.status.labour[1] }} / {{ patient.status.labour[2] }}<br>
                    H {{ patient.status.house[0] }} / {{ patient.status.house[1] }} / {{ patient.status.house[2] }}<br>
                    P {{ patient.status.appointment[0] }} / {{ patient.status.appointment[1] }} / {{ patient.status.appointment[2] }}<br>
                    R {{ patient.status.appointment[0] }} / {{ patient.status.appointment[1] }} / {{ patient.status.appointment[2] }}<br>
                </div>
            </div -->
        </div>

        <div class="row termine">
            <div class="col-7">
                <h3>Termine:</h3>
                <div v-if="patient.appointments.length">
                    <table class="table table-borderless table-sm">
                        <tr v-for="item in relevatAppointments(5)">
                            <td class="tdate">{{ item.date | formatDate('DD.MM.YY') }}</td>
                            <td class="ttime">{{ item.time.substring(0, 5) }}</td>
                            <td class="tinitials text-center" :class="item.updated_by !== null && !isSigned(item) ? 'bg-danger text-white' : ''">
                                <span v-show="item.updated_by !== null">
                                    {{ item.updated_by }}
                                </span>
                            </td>
                            <td class="tdesc">{{ item.description }}</td>
                        </tr>
                    </table>
                </div>

                <div class="mt-2">
                    <h3>Hinweistexte:</h3>
                    <table class="table table-borderless table-sm">
                        <tr v-for="item in patient.hints">
                            <td class="tdate">{{ item.created_at_date | formatDate('DD.MM.YY') }}</td>

                            <td class="tinitials text-center">
                                {{ item.initials }}
                            </td>
                            <td>{{ item.memo }}</td>
                        </tr>
                    </table>
                </div>

                <div class="mt-2">
                    <h3>TODO:</h3>
                    <table class="table table-borderless table-sm">
                        <tr v-for="item in patient.todo">
                            <td class="tdate">{{ item.created_at_date | formatDate('DD.MM.YY') }}</td>

                            <td class="tinitials text-center">
                                {{ item.initials }}
                            </td>
                            <td>{{ item.memo }}</td>
                        </tr>
                    </table>
                </div>

                <div class="mt-2">
                    <h3>Risikofaktoren:</h3>
                    <div class="mb-1" v-for="item in patient.risk_factors">{{ item.created_at_date | formatDate('DD.MM.YY') }} <span v-if="item.initials">({{ item.initials }})</span> {{ item.memo }}</div>
                </div>

            </div>
            <div class="col-5">
                <findings :patient="patient.info" :visits="patient.visits" :prescriptions="patient.prescriptions" :findings="findings" :calls="calls"></findings>
            </div>
        </div>

        <div class="row">
            <div class="col">

                <div class="mt-2 medications">
                    <h3>Dauermedikation / Rezepte:</h3>
                    <frequent-medications  :medications="patient.medications" v-if="patient.medications.length"></frequent-medications>
                    <!-- div class="mb-1" v-for="item in patient.medications">{{ item.category }} {{ item.name }} ({{ item.qty }}) {{ item.created_at_date | formatDate }}</div -->
                </div>

                <div class="mt-2">
                    <h3>Dauerdiagnosen:</h3>
                    <div class="mb-1" v-for="item in patient.diagnosis">{{ item.created_at_date | formatDate('DD.MM.YY') }} ({{ item.qty }}) {{ item.memo }}</div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment'
    import FrequentMedications from "./Patient/FrequentMedications";
    import Findings from "./Patient/Findings";

    export default {
        components: {FrequentMedications, Findings},
        data() {
            return {
                findings: []
            }
        },
        props: {
            patient: {
                type: Object,
                required: true
            }
        },
        mounted() {
            //this.loadFindings()
            console.log('Patient mounted')
        },
        updated() {
            console.log('Patient updated')
        },
        activated() {
            console.log('Patient activated')
        },
        created() {
            console.log('Created');
            this.loadFindings()
        },
        beforeCreate() {
            console.log('Before create')
        },
        methods: {
            //return next limit appointments
            nextAppointment() {
                let today = moment().format('YYYY-MM-DD');
                return _.filter(this.patient.appointments, a => {
                    return a.date >= today
                })
            },
            //return last limit appointments
            lastAppointment(limit) {
                let today = moment().format('YYYY-MM-DD');
                return _.filter(this.patient.appointments, (a) => {
                    return a.date < today
                }).slice(0,limit)
            },
            relevatAppointments(limit) {
                let monthFromNow = moment().add(1, 'months').format('YYYY-MM-DD');
                return _.filter(this.patient.appointments, a => {
                    return a.date < monthFromNow
                }).slice(0,limit)
            },
            isSigned(item) { //determine if correct initials were added to appointment description
                if (item.updated_by === null || !item.updated_by.length) {
                    return false
                }
                let words = _.trim(item.description).split(' ');
                //console.log('words', words)
                let res = _.trim(_.first(words), ' ()').toUpperCase() === item.updated_by || _.trim(_.last(words), ' ()').toUpperCase() === item.updated_by;
                //console.log('res', res)
                return res
            },
            loadFindings() {
                axios.get('/patients/' + this.patient.info.id + '/findings')
                    .then(response => {
                        this.findings = response.data;
                    })
            },
            loadCalls() {
                axios.get('/patients/' + this.patient.info.id + '/calls')
                    .then(response => {
                        this.calls = response.data;
                    })
            }
        },
        computed: {
        },
        watch: {
            patient() {
                this.findings = [];
                this.loadFindings();
                this.calls = [];
                this.loadCalls()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .disabled {
        color: #cccccc;
    }
    .disabled.bg-orange {
        color: #212529 !important;
    }
    .table-sm th, .table-sm td {
        //padding: 0.05rem;
    }
    .tdate {
        width: 4.2rem;
    }
    .ttime {
        width: 2.8rem;
    }
    .tinitials {
        width: 2rem;
    }
    .termine .table-sm td.tdesc {
        padding-left: 0.3rem;
    }
    .termine .table-sm td {
        padding-right: 0.1rem;
    }
    .befunde {
        margin-right: -0.25rem;
        font-size: 0.75rem;
    }
</style>
