<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col">
                <h5>{{ $t('Time Tracking Overview') }}</h5>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <b-table :items="items" :busy="isBusy" responsive small>
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle"></b-spinner>
                            <strong>Loading...</strong>
                        </div>
                    </template>

                    <template v-slot:cell(name)="data">
                        {{ data.value }}
                    </template>

                    <template v-slot:cell()="data">
                        <div>Ist:       {{ data.value.sum }}</div>
                        <div>Soll:      {{ data.value.workplan }}</div>
                        <div>Diff:      {{ data.value.diff }}</div>
                        <div>Holiday:   {{ data.value.holiday }}</div>
                    </template>
                </b-table>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TimeLogOverview",
        data() {
            return {
                isBusy: true,
                items: []
            }
        },
        methods: {
            loadData() {
                axios.get('/timelog/overview')
                    .then(response => {
                        this.items = response.data;
                        this.isBusy = false
                    })
            }
        },
        created() {
            this.loadData();
        }
    }
</script>

<style scoped>

</style>
