<template>
    <div class="container home-panel">
        <div class="row">
            <div class="col">
                <h5>{{ $t('Welcome') }} {{ $userName }} </h5>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <b-table striped hover small :items="reports.finance" :fields="fields"></b-table>
            </div>
            <div class="col">
                <b-table striped hover small :items="reports.customer" :fields="fields"></b-table>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <b-table striped hover small :items="reports.process" :fields="fields"></b-table>
            </div>
            <div class="col">
                <div class="border p-3">
                    <p>Geplantes Event</p><br><br><br><br><br><br>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Home",
        data() {
            return {
                reports: {
                    finance: [],
                    customer: [],
                    process: [],
                    info: ''
                },
                items: [
                    [],[],[],[],[],[]
                ],
                fields: [
                    {
                        key: 'description',
                        label: this.$t('Description')
                    },
                    {
                        key: 'target',
                        label: this.$t('Target')
                    },
                    {
                        key: 'sum_q',
                        label: this.$t('Quarter')
                    },
                    {
                        key: 'sum_10',
                        label: this.$t('{num} Days', { num: '1' })
                    },
                    {
                        key: 'deviation',
                        label: this.$t('Deviation')
                    }
                ],
            }
        },

        mounted() {
            this.loadData()
        },

        methods: {
            loadData() {
                axios.get('/welcome')
                    .then(response => this.reports = response.data)
            }
        }
    }
</script>

<style scoped>

</style>
