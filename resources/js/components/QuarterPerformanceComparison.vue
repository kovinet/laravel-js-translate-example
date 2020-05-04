<template>

    <div class="container-fluid">
        <div class="row mb-4">
            <div class="col-md-6 offset-md-6">
                <form class="form-inline flex-row-reverse">
                    <b-form-select id="selectQ1Select" v-model="q2" :options="quarters" :value-field="'value'" :text-field="'label'" :disabled="isBusy"></b-form-select>
                    <label for="selectQ1Select" class="mr-2 d-none d-sm-block"> &nbsp;&nbsp;/ </label>
                    <b-form-select id="selectQ2Select" v-model="q1" :options="quarters" :value-field="'value'" :text-field="'label'" :disabled="isBusy"></b-form-select>
                    <label for="selectQ2Select" class="mr-2 d-none d-sm-block">{{ $t('Select Quarters') }}</label>
                </form>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <b-table small :fields="fields" :items="items" :busy="isBusy" responsive="sm">
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>Loading...</strong>
                        </div>
                    </template>
                </b-table>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    export default {
        name: "QuarterPerformanceComparison",
        data() {
            return {
                isBusy: false,
                fields: [
                    {
                        label: 'EBM',
                        key: 'name',
                        sortable: true,
                    },
                    {
                        label: 'Beschreibung',
                        key: 'description',
                        sortable: true,
                    },
                    {
                        label: 'Diff',
                        key: 'diff',
                        sortable: true,
                        formatter: 'formatNumber',
                        class: 'text-right',
                    },
                    {
                        label: 'TotalPDiff',
                        key: 'diffp',
                        sortable: true,
                        formatter: 'formatNumber',
                        class: 'text-right',
                    },
                    {
                        label: 'Anzahl',
                        key: 'num',
                        sortable: true,
                        formatter: 'formatNumber',
                        class: 'text-right',
                    },
                    {
                        label: 'Anzahl',
                        key: 'q2',
                        sortable: true,
                        formatter: 'formatNumber',
                        class: 'text-right',
                    },
                    {
                        label: 'Pointvalue',
                        key: 'points',
                        sortable: true,
                        class: 'text-right',
                    },
                    {
                        label: 'Sum',
                        key: 'sum',
                        sortable: true,
                        formatter: 'formatNumber',
                        class: 'text-right',
                    }
                ],
                items: [],
                quarters: [],
                q1: null,
                q2: null
            }
        },
        methods: {
            loadData() {
                axios.get('/report/performance-comparison', {
                    params: {
                        q1: this.q1,
                        q2: this.q2
                    }
                })
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            },
            formatNumber(value) {
                return Number(value).toLocaleString('de-DE');
            }
        },
        created() {
            let date = moment();
            for (let i = 0; i <= 30; i++) {
                this.quarters.push({
                    label: 'Q' + date.format('Q / YYYY'),
                    value: date.format('YYYY-Q')
                });
                date.subtract(3, 'months');
            }
        },
        watch: {
            q1(data) {
                this.fields[4].label = `Anzahl Q${data.substring(5)}/${data.substring(2, 4)}`;
                if (this.q2) {
                    this.isBusy = true;
                    this.loadData();
                }
            },
            q2(data) {
                this.fields[5].label = `Anzahl Q${data.substring(5)}/${data.substring(2, 4)}`;
                if (this.q1) {
                    this.isBusy = true;
                    this.loadData();
                }
            }
        }
    }
</script>

<style scoped>

</style>
