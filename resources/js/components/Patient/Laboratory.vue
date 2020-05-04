<template>
    <b-modal id="modal-cg-labor" size="xl" hide-footer>
        <template v-slot:modal-title>
            {{ item.created_at_date | formatDate('DD.MM.YY') }} <span v-if="item.qty">({{ item.qty }})</span> {{ item.memo }}
        </template>

        <table class="table table-sm">
            <tr>
                <th>EMB-Ziffer</th>
                <th>{{ $t('First date') }}</th>
                <th>{{ $t('Last date') }}</th>
                <th>{{ $t('Quantity') }}</th>
                <th>{{ $t('Description')}}</th>
            </tr>
            <tr class="" v-for="(item, i) in grid" :key="item.memo">
                <td>{{ item.memo }}</td>
                <td>{{ item.first_date | formatDate('DD.MM.YY') }}</td>
                <td>{{ item.last_date | formatDate('DD.MM.YY') }}</td>
                <td>{{ item.num }}</td>
                <td>{{ item.description }}</td>
            </tr>
        </table>
    </b-modal>
</template>

<script>
    export default {
        name: "Laboratory",
        props: {
            item: {
                type: Object,
                required: true
            },
            grid: {
                type: Array,
                required: true
            }
        }
    }
</script>

<style scoped>

</style>
