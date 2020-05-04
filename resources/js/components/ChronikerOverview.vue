<template>
    <div>
        <div class="row">
            <div class="col">
                <b-table striped hover :items="items" :fields="fields" :busy="isBusy" :per-page="perPage" :current-page="currentPage" responsive="sm" id="chroniker-overview-table">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>{{ $t('Loading') }}...</strong>
                        </div>
                    </template>
                    <template v-slot:cell(name)="data">
                        <router-link :to="'/patient/' + data.item.patient_id" target="_blank">{{ data.item.name }}</router-link>
                    </template>
                    <template v-slot:cell(q1)="data">
                        {{ data.item.q1_1 | formatDate('DD.MM.') }} / {{ data.item.q1_2 | formatDate('DD.MM.') }}
                    </template>
                </b-table>

                <b-pagination
                    v-model="currentPage"
                    :total-rows="rows"
                    :per-page="perPage"
                    aria-controls="chroniker-overview-table"
                ></b-pagination>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "ChronikerOverview",
        data() {
            return {
                isBusy: true,
                perPage: 30,
                currentPage: 1,
                items: [],
                fields: [
                    {
                        key: 'name',
                        sortable: true,
                        label: this.$t('Lastname, Firstname')
                    },
                    {
                        key: 'birth_date',
                        label: this.$t('Birthday'),
                        sortable: true,
                        formatter: value => {
                            return moment(value).format('DD.MM.YY') + ' (' + this.formatAge(value) + ')'
                        }
                    },
                    {
                        key: 'q1',
                        label: '',
                        sortable: true
                    },
                    {
                        key: 'q2',
                        label: '',
                        sortable: true
                    },
                    {
                        key: 'q3',
                        label: '',
                        sortable: true
                    },
                    {
                        key: 'q4',
                        label: '',
                        sortable: true
                    }
                ]
            }
        },
        methods: {
            loadData() {
                this.isBusy = true;
                axios.get('/report/chroniker-overview')
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            },
            formatAge(value) {
                return moment().diff(moment(String(value)), 'years')
            },
        },
        computed: {
            rows() {
                return this.items.length
            }
        },
        watch: {

        },
        created() {
            let quarters = [ 0, 1, 2, 3 ].map(i =>
                moment().subtract(i, 'Q').format('[Q]Q/YY')
            )
            this.fields[2].label = quarters[0];
            this.fields[3].label = quarters[1];
            this.fields[4].label = quarters[2];
            this.fields[5].label = quarters[3];
            this.loadData();
        }
    }
</script>

<style scoped>

</style>
