<template>
    <div>
        <div class="row">
            <div class="col">
                <b-table striped hover :items="items" :fields="fields" :busy="isBusy" :per-page="perPage" :current-page="currentPage" responsive="sm">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>{{ $t('Loading...') }}</strong>
                        </div>
                    </template>

                    <template v-slot:cell(name)="data">
                        <router-link :to="'/patient/' + data.item.patient_id">{{ data.item.name }}</router-link>
                    </template>

                    <template v-slot:cell(until)="data">
                        {{ /#.*#([\d\.]*)\s.*/.test(data.item.memo) ? /#.*#([\d\.]*)\s.*/.exec(data.item.memo)[1] : '' }}
                    </template>

                    <template v-slot:cell(employee_from)="data">
                        {{ /#..2..\s.*$/.test(data.item.memo) ? /#(..)2..\s.*$/.exec(data.item.memo)[1] : '' }}
                    </template>

                    <template v-slot:cell(employee_to)="data">
                        {{ /#..2..\s.*$/.test(data.item.memo) ? /#..2(..)\s.*$/.exec(data.item.memo)[1] : '' }}
                    </template>

                    <template v-slot:cell(memo)="data">
                        {{  data.value.replace(/#..2\S+/, '').replace(/#[\d.]+/, '') }}
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
    import moment from "moment";

    export default {
        name: "Todo",
        data() {
            return {
                isBusy: true,
                perPage: 100,
                currentPage: 1,
                items: [],
                fields: [
                    {
                        key: 'date',
                        label: this.$t('Date'),
                        formatter: value => {
                            return moment(value).format('DD.MM.YY')
                        }
                    },
                    {
                        key: 'name',
                        label: this.$t('Lastname, Firstname')
                    },
                    {
                        key: 'birth_date',
                        label: this.$t('Birthday'),
                        formatter: value => {
                            return moment(value).format('DD.MM.YY') + ' (' + this.formatAge(value) + ')'
                        }
                    },
                    {
                        key: 'until',
                        label: this.$t('Till when')
                    },
                    {
                        key: 'employee_from',
                        label: this.$t('From')
                    },
                    {
                        key: 'employee_to',
                        label: this.$t('To')
                    },
                    {
                        key: 'memo',
                        label: this.$t('Text')
                    },
                    {
                        key: 'user_credentials',
                        label: this.$t('User ID')
                    }
                ]
            }
        },
        created() {
            // console.log(this.$route.params);
            this.loadData()
        },

        methods: {
            loadData() {
                this.isBusy = true;
                let uri = '/report/todo';
                if (this.$route.params.type) {
                    uri += '/' + this.$route.params.type
                }
                axios.get(uri)
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            },
            formatAge(value) {
                return moment().diff(moment(String(value)), 'years')
            }
        },
        computed: {
            rows() {
                return this.items.length
            }
        },
        watch: {
            '$route' (to, from) {
                this.loadData()
            },
        }
    }
</script>
