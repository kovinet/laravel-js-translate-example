<template>
    <div>
        <div class="row mb-4">
            <div class="col-md-6 offset-md-6">
                <form class="form-inline flex-row-reverse">
                    <b-form-select v-model="selectedGroup" :options="groups"></b-form-select>
                </form>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <b-table striped hover :items="items" :fields="fields" :busy="isBusy" responsive="sm">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>{{ $t('Loading') }}...</strong>
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
        name: "DMPOverview",
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
                        key: 'date',
                        label: 'DMP Diabetes 2',
                        sortable: true,
                        formatter: value => {
                            return value ? moment(value).format('DD.MM.YY') : ''
                        }
                    },
                    {
                        key: 'num',
                        label: 'C',
                        sortable: true
                    },
                    {
                        key: 'date_lb',
                        label: 'Labor',
                        sortable: true,
                        formatter: value => {
                            return value ? moment(value).format('DD.MM.YY') : ''
                        }
                    },
                    {
                        key: 'num_lb',
                        label: 'C',
                        sortable: true
                    }
                ],
                groups: [
                    {value: 'FDIAB2', text: 'DMP Diabetes 2'},
                    {value: 'FKHK', text: 'DMP KHK'},
                    {value: 'FCOPD', text: 'DMP COPD'},
                    {value: 'FASTH', text: 'DMP Asthma'}
                ],
                selectedGroup: 'FDIAB2'
            }
        },
        methods: {
            loadData() {
                this.isBusy = true;
                axios.get('/report/dmp-overview', {
                    params: {
                        'category': this.selectedGroup
                    }
                })
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            }
        },
        watch: {
            selectedGroup(data) {
                let label = this.groups.filter(obj => {
                    return obj.value === data
                })
                this.fields[2].label = label[0].text;
                this.loadData();
                console.log('Changed', data);
            }
        },
        created() {
            this.loadData();
        }
    }
</script>

<style scoped>

</style>
