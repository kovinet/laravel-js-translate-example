<template>
    <b-modal id="modal-cg-chroniker" size="xl" hide-footer>
        <template v-slot:modal-title>
            Chroniker
        </template>

        <table class="table table-sm">
            <tr>
                <th></th>
                <th v-for="label in quarters">{{ label }}</th>


            </tr>
            <tr class="" v-for="(item, i) in grid" :key="item.label">
                <td><strong>{{ item.label }}</strong></td>
                <td>{{ item.q3 | formatDate('DD.MM.YY') }}</td>
                <td>{{ item.q2 | formatDate('DD.MM.YY') }}</td>
                <td>{{ item.q1 | formatDate('DD.MM.YY') }}</td>
                <td>{{ item.q0 | formatDate('DD.MM.YY') }}</td>
            </tr>
        </table>
    </b-modal>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "Chroniker",
        props: {
            item: {
                type: Object,
                required: true
            },
            grid: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                quarters: []
            }
        },
        created() {
            let date = moment().subtract(9, 'months');
            for (let i = 0; i <= 3; i++) {
                this.quarters.push('Q' + date.format('Q / YYYY'));
                date.add(3, 'months');

            }
        }
    }
</script>

<style scoped>

</style>
