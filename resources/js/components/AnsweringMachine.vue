<template>
    <div>
        <div class="row mb-2">
            <div class="col-6">
                <h5>{{ $t('Answering Machine') }}</h5>
            </div>
            <div class="col-6 text-right">
                <button type="button" class="btn btn-primary btn-sm" @click="loadData()"><font-awesome-icon icon="sync" /></button>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <b-table striped hover :items="items" :fields="fields" :busy="isBusy" responsive="sm">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>{{ $t('Loading...') }}</strong>
                        </div>
                    </template>

                    <template v-slot:cell(name)="data">
                        <template v-if="data.item.patients.length">
                            <div v-for="patient in data.item.patients">
                                <router-link :to="'/patient/' + patient.id" target="_blank">{{ patient.last_name }}, {{ patient.first_name }}</router-link>
                            </div>
                        </template>
                        <div v-else-if="data.item.Number.length">
                            {{ data.item.Number }}
                        </div>
                        <div v-else>
                            {{ $t('Unknown') }}
                        </div>
                    </template>

                    <template v-slot:cell(type)="data">
                        AB
                    </template>

                    <template v-slot:cell(birth_date)="data">
                        <div v-for="patient in data.item.patients" v-if="data.item.patients.length">
                            {{ patient.birth_date | formatBirthdate('DD.MM.YY') }}&nbsp;
                        </div>
                    </template>

                    <template v-slot:cell(last)="data">
                        <div v-for="patient in data.item.patients">
                            {{ patient.last | formatDate('DD.MM.YY') }}&nbsp;
                        </div>
                    </template>

                    <template v-slot:cell(todo)="data">
                        <div v-for="patient in data.item.patients">
                            {{ patient.todo | formatDate('DD.MM.YY') }}&nbsp;<template v-if="patient.todo_num">({{ patient.todo_num }})</template>
                        </div>
                    </template>

                    <template v-slot:cell(hints)="data">
                        <div v-for="patient in data.item.patients">
                            {{ patient.hints | formatDate('DD.MM.YY') }}&nbsp;<template v-if="patient.hints_num">({{ patient.hints_num }})</template>
                        </div>
                    </template>

                    <template v-slot:cell(path)="data">
                        <audio controls preload="auto" :src="data.item.path"></audio>
                    </template>

                    <template v-slot:cell(action)="data">
                        <a href="#" @click="onDeleteMessage(data.item)"><font-awesome-icon icon="trash-alt" /></a>
                    </template>

                </b-table>
            </div>
        </div>

    </div>
</template>

<script>
    import moment from 'moment';
    import DatePick from 'vue-date-pick'
    import 'vue-date-pick/dist/vueDatePick.css'

    export default {
        name: "AnsweringMachine",
        components: {DatePick},
        data() {
            return {
                selectedDate: this.$route.params.date || moment().format('YYYY-MM-DD'),
                items: [],
                isBusy: true,
                fields: [
                    {
                        key: 'type',
                        label: this.$t('Type'),
                        sortable: true
                    },
                    {
                        key: 'date',
                        label: this.$t('Date'),
                        sortable: true,
                        formatter: value => {
                            return value ? moment(value).format('DD.MM.YY') : ''
                        }
                    },
                    {
                        key: 'time',
                        label: this.$t('Time'),
                        sortable: true
                    },
                    {
                        key: 'name',
                        label: this.$t('Lastname, Firstname'),
                    },
                    {
                        key: 'birth_date',
                        label: this.$t('Birthday'),
                    },
                    {
                        key: 'path',
                        label: this.$t('Message')
                    },
                    {
                        key: 'action',
                        label: '',
                        tdClass: 'align-middle'
                    }
                ],
            }
        },
        methods: {
            onDeleteMessage(item) {
                console.log(item)
                this.$bvModal.msgBoxConfirm(this.$t('Are you sure?'))
                    .then(value => {
                        if (value) {
                            axios.post('/answering-machine/store', item)
                                .then((response) => {
                                    console.log('Reload messages');
                                    this.loadData();
                                });
                        }
                    })
                    .catch(err => {
                        // An error occurred
                    })
            },
            loadData() {
                this.isBusy = true;
                axios.get('/answering-machine/download-messages')
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            }
        },
        created() {
            this.loadData();
        },
        watch: {
            '$route' (to, from) {
                if (to.params.date !== from.params.date) {
                    this.loadData()
                }
            },
            selectedDate(date) {
                if (date) {
                    this.$router.push('/answering-machine/' + date)
                }
            }
        }

    }
</script>

<style scoped>

</style>
