<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <b-table striped hover :items="items" :fields="fields" :busy="isBusy">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>Loading...</strong>
                        </div>
                    </template>
                    <template v-slot:cell(name)="data">
                        <router-link :to="'/patient/' + data.item.id">{{ data.item.name }}</router-link>
                    </template>
                </b-table>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "GeriatricAssessment",
        data() {
            return {
                isBusy: true,
                items: [],
                fields: [
                    {
                        key: 'name',
                        sortable: true,
                        label: 'Lastname, Firstname'
                    },
                    {
                        key: 'birth_date',
                        label: 'Birthday',
                        sortable: true,
                        formatter: value => {
                            return moment(value).format('DD.MM.YYYY')
                        }
                    },
                    {
                        key: 'date1',
                        label: 'EBM 03360',
                        sortable: true,
                        formatter: value => {
                            return moment(value).format('DD.MM.YY')
                        }
                    },
                    {
                        key: 'num1',
                        label: 'C',
                        sortable: true
                    },
                    {
                        key: 'date2',
                        label: 'EBM 03362',
                        sortable: true,
                        formatter: value => {
                            return moment(value).format('DD.MM.YY')
                        }
                    },
                    {
                        key: 'num2',
                        label: 'C',
                        sortable: true
                    },
                    {
                        key: 'date3',
                        label: 'Doko',
                        sortable: true,
                        formatter: value => {
                            return moment(value).format('DD.MM.YY')
                        }
                    },
                    {
                        key: 'num3',
                        label: 'C',
                        sortable: true
                    }
                ],
            }
        },
        methods: {
            loadData() {
                axios.get('/report/geriatric-assessment')
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            }
        },
        mounted() {
            this.loadData();
        }
    }
</script>

<style scoped>

</style>
