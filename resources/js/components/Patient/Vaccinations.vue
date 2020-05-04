<template>
    <b-modal id="modal-cg-impfungen" size="xl" hide-footer>
        <template v-slot:modal-title>
            {{ item.created_at_date | formatDate('DD.MM.YY') }} <span v-if="item.qty">({{ item.qty }})</span> {{ item.memo }}
        </template>
        <table class="table table-sm">
            <tr>
                <th>Impfung</th>
                <th>EBM Ziffer</th>
                <th>{{ $t('Interval') }}</th>
                <th>{{ $t('First') }}</th>
                <th>{{ $t('Last') }}</th>
                <th>{{ $t('Refresh') }}</th>
            </tr>
            <tr class="" v-for="(item, i) in grid" :key="item.memo">
                <td>{{ item.name }}</td>
                <td>{{ item.memo }}</td>
                <td>{{ item.interval }}</td>
                <td>{{ item.first_date | formatDate('DD.MM.YY') }} <template v-if="item.first_count">({{ item.first_count }})</template></td>
                <td>{{ item.last_date | formatDate('DD.MM.YY') }} <template v-if="item.last_count">({{ item.last_count }})</template></td>
                <td>{{ item.refresh_date | formatDate('DD.MM.YY') }} <template v-if="item.refresh_count">({{ item.refresh_count }})</template></td>
            </tr>
        </table>
    </b-modal>
</template>

<script>
    export default {
        name: "Vaccinations",
        props: {
            item: {},
            grid: {}
        }
    }
</script>

<style scoped>

</style>
