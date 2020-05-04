<template>
    <div class="row no-gutters mt-2 befunde">
        <div class="col-4">
            <div class="border p-1 mr-1 mb-1" :class="{'bg-danger text-white': visits[3] && visits[3] < 21}" @click="loadModalContent('clinic', 0)">
                Praxis {{ visits[0] }} - {{ visits[1] }} - {{ visits[2] }} <span v-if="visits[3]">({{ visits[3] }} Tage)</span>
            </div>
            <b-modal id="modal-cg-clinic" size="xl" hide-footer>
                <template v-slot:modal-title>
                    Praxis {{ visits[0] }} - {{ visits[1] }} - {{ visits[2] }} <span v-if="visits[3]">({{ visits[3] }} Tage)</span>
                </template>
                <table>
                    <tr :class="{divider: index > 0 && isDifferentQuarter(item.created_at_date, grid[0][index - 1].created_at_date)}" v-for="(item, index) in grid[0]" :key="item.id">
                        <td><template v-if="index === 0 || item.created_at_date !== grid[0][index - 1].created_at_date">{{ item.created_at_date | formatDate('DD.MM.YY') }}</template></td>
                        <td class="px-2">{{ item.category }}</td>
                        <td>{{ item.memo }}</td>
                    </tr>
                </table>
            </b-modal>
        </div>
        <div class="col-4">
            <div class="border p-1 mr-1 mb-1" :class="{'bg-danger text-white': prescriptions[3] && prescriptions[3] > 29}" @click="loadModalContent('prescription', 1)">
                Rezepte {{ prescriptions[0] }} - {{ prescriptions[1] }} - {{ prescriptions[2] }} <span v-if="prescriptions[3]">({{ prescriptions[3] }} Eintr&auml;ge)</span>
            </div>
            <b-modal id="modal-cg-prescription" size="xl" hide-footer>
                <template v-slot:modal-title>
                    Rezepte {{ prescriptions[0] }} - {{ prescriptions[1] }} - {{ prescriptions[2] }} <span v-if="prescriptions[3]">({{ prescriptions[3] }} Eintr&auml;ge)</span>
                </template>
                <table class="table table-sm">
                    <tr v-for="(item, index) in grid[1]" :key="item.id">
                        <td><template v-if="index === 0 || item.created_at_date !== grid[1][index - 1].created_at_date">{{ item.created_at_date | formatDate('DD.MM.YY') }}</template></td>
                        <td class="px-2">{{ item.category }}</td>
                        <td :class="item.type === 'P' ? 'bg\-primary text\-white' : ''" class="wide">({{ item.qty }}) {{ item.name }}</td>
                        <td class="px-2">{{ item.comment }}</td>
                    </tr>
                </table>
            </b-modal>
        </div>
        <div class="col-4">
            <div class="border p-1 mr-1 mb-1" :class="{'bg-danger text-white': calls[3] && calls[3] > 29}" @click="loadModalContent('calls', 1)">
                {{ $t('Calls')}} {{ calls[0] }} - {{ calls[1] }} - {{ calls[2] }} <span v-if="calls[3]">({{ calls[3] }} Eintr&auml;ge)</span>
            </div>
            <b-modal id="modal-cg-calls" size="xl" hide-footer>
                <template v-slot:modal-title>
                    Calls {{ calls[0] }} - {{ calls[1] }} - {{ calls[2] }} <span v-if="calls[3]">({{ calls[3] }} Eintr&auml;ge)</span>
                </template>

            </b-modal>
        </div>
        <div class="col-6" v-for="(item, index) in findings">
            <div class="border p-1 mr-1 mb-1 text-nowrap" :class="[{disabled: !item.qty}, item.class]"  @click="loadModalContent(item.memo.replace(/[ \/]/gi, '').toLowerCase().replace(/ü/g, 'u'), (index+2))">
                {{ item.created_at_date | formatDate('DD.MM.YY') }} <span v-if="item.qty">({{ item.qty }})</span> {{ item.memo }}
            </div>
            <vaccinations :item="item" :grid="grid[(index + 2)] || []" v-if="item.memo === 'Impfungen'"></vaccinations>
            <laboratory :item="item" :grid="grid[(index + 2)] || []" v-else-if="item.memo === 'Labor'"></laboratory>
            <chroniker :item="item" :grid="grid[(index + 2)] || []" v-else-if="item.memo === 'Chroniker 03220'"></chroniker>
            <b-modal :id="'modal-cg-' + item.memo.replace(/[ \/]/gi, '').toLowerCase().replace(/ü/g, 'u')" size="xl" hide-footer v-else>
                <template v-slot:modal-title>
                    {{ item.created_at_date | formatDate('DD.MM.YY') }} <span v-if="item.qty">({{ item.qty }})</span> {{ item.memo }}
                </template>
                <table>
                    <tr class="" v-for="(item, i) in grid[(index + 2)]" :key="item.id">
                        <td><template v-if="i === 0 || item.created_at_date !== grid[(index + 2)][i - 1].created_at_date">{{ item.created_at_date | formatDate('DD.MM.YY') }}</template></td>
                        <td class="px-2">{{ item.category }}</td>
                        <td>{{ item.memo }}</td>
                    </tr>
                </table>
            </b-modal>
        </div>
    </div>
</template>

<script>
    import Vaccinations from "./Vaccinations";
    import Laboratory from "./Laboratory";
    import Chroniker from "./Chroniker";

    export default {
        name: "Findings",
        props: {
            patient: {
                type: Object,
                required: true
            },
            prescriptions: {
                type: Array,
                required: true
            },
            visits: {
                type: Array,
                required: true
            },
            findings: {
                type: Array,
                required: true
            },
            calls: {
                type: Array,
                required: true
            }
        },
        components: {Vaccinations, Laboratory, Chroniker},
        data() {
            return {
                grid: [],
                calls: []
            }
        },
        methods: {
            loadModalContent(ident, index) {
                console.log('Load modal content [' + index + ']', ident);
                //if (this.grid[index] === undefined) {
                axios.get('/patient/' + this.patient.id + '/info/' + ident)
                    .then(response => {
                        //Note: if setting directly in array reactivity not work
                        Vue.set(this.grid, index, response.data);
                    })
                //}
                if (ident === 'chroniker03220' || ident === 'chroniker03221') {
                    ident = 'chroniker';
                }
                this.$root.$emit('bv::show::modal', 'modal-cg-' + ident) //open modal
            }
        }
    }
</script>

<style lang="scss" scoped>
    .border {
        cursor: pointer;
    }
    .border.disabled {
        cursor: default;
    }
    .disabled {
        color: #cccccc;
    }
    .disabled.bg-orange {
        color: #212529 !important;
    }
    .divider {
        border-top: 2px solid #343a40;
    }
    td {
        vertical-align: top;
    }
    td.wide {
        width: 40%;
    }
</style>
