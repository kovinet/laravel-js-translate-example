<template>
    <div>
        <div class="row mb-4">
            <div class="col-md-6 offset-md-6">
                <form class="form-inline flex-row-reverse">
                    <b-form-select
                        id="selectUserControl"
                        v-model="selectedUser"
                        :options="users"
                        :value-field="'user_id'"
                        :text-field="'fullname'"
                        :disabled="$userRole !== 'administrator'"></b-form-select>
                    <label for="selectUserControl" class="mr-2 d-none d-sm-block">{{ $t('Selected User:') }}</label>
                </form>
            </div>
        </div>

        <b-table hover responsive :items="records" :fields="fields" :tbody-tr-class="rowClass">
            <template slot="[booking_date]" slot-scope="data">
                {{ data.value }}
            </template>

            <template v-slot:cell(regular)="data">
                <div class="row no-gutters">
                    <div class="d-inline-block mr-2">
                        <div v-for="val in data.value.from">{{ val }}</div>
                    </div>
                    <div class="d-inline-block">
                        <div v-for="val in data.value.to">{{ val }}</div>
                    </div>
                </div>
            </template>

            <template v-slot:cell(home)="data">
                <div class="row no-gutters">
                    <div class="d-inline-block mr-2">
                        <div v-for="val in data.value.from">{{ val }}</div>
                    </div>
                    <div class="d-inline-block">
                        <div v-for="val in data.value.to">{{ val }}</div>
                    </div>
                </div>
            </template>

            <template v-slot:cell(break)="data">
                <div class="row no-gutters">
                    <div class="d-inline-block mr-2">
                        <div v-for="val in data.value.from">{{ val }}</div>
                    </div>
                    <div class="d-inline-block">
                        <div v-for="val in data.value.to">{{ val }}</div>
                    </div>
                </div>
            </template>

            <template slot="[sum]" slot-scope="data">
                <strong v-if="currentDate == data.item.booking_date">{{ data.value }}</strong>
                <span v-else>{{ data.value }}</span>
            </template>

            <template v-slot:cell(action)="data">
                <a href="#" @click.prevent="onEdit(data.item)" v-if="(data.index < 200 && data.item.booking_date !== 'Σ')" v-b-modal.modal-timelog-record-edit><font-awesome-icon icon="edit" /></a>
            </template>

        </b-table>

        <b-modal
            ref="editModal"
            v-if="editItem"
            size="md"
            id="modal-timelog-record-edit"
            :editItem="editItem"
            :ok-title="$t('Save')"
            :cancel-title="$t('Cancel')"
            @ok="onSave()">
            <template v-slot:modal-title>
                Edit time log records for {{ editItem.booking_date | formatDate }}
            </template>
            <form action="" class="form-inline">
                <div class="d-flex flex-row mb-3">
                    <div class="p-2 flex-even">
                        <h5>{{ $t('Regular Time') }}</h5>
                        <div class="d-flex">
                            <div class="flex-even">{{ $t('From') }}:</div>
                            <div class="flex-even">{{ $t('To') }}:</div>
                        </div>
                        <time-log-edit-record :entry="editItem.regular" :index="0"></time-log-edit-record>
                    </div>

                    <div class="p-2 flex-even border-left">
                        <h5>{{ $t('Home Visit') }}</h5>
                        <div class="d-flex">
                            <div class="flex-even">{{ $t('From') }}:</div>
                            <div class="flex-even">{{ $t('To') }}:</div>
                        </div>
                        <time-log-edit-record :entry="editItem.home" :index="index" v-for="(item, index) in numEditItems(editItem.home, homeEditRows)" :key="item"></time-log-edit-record>
                        <div class="form-group row">
                            <div class="col-sm-10">
                                <button type="button" class="btn btn-primary" @click="homeEditRows++"><font-awesome-icon icon="plus" /></button>
                            </div>
                        </div>
                    </div>

                    <div class="p-2 flex-even border-left">
                        <h5>{{ $t('Break') }}</h5>
                        <div class="d-flex">
                            <div class="flex-even">{{ $t('From') }}:</div>
                            <div class="flex-even">{{ $t('To') }}:</div>
                        </div>
                        <time-log-edit-record :entry="editItem.break" :index="index" v-for="(item, index) in numEditItems(editItem.break, breakEditRows)" :key="item"></time-log-edit-record>
                        <div class="form-group row">
                            <div class="col-sm-10">
                                <button type="button" class="btn btn-primary" @click="breakEditRows++"><font-awesome-icon icon="plus" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <hr>
            <h5>{{ $t('Workplans') }}</h5>
            <div v-if="workplan">
                <div class="d-flex flex-row mb-3 font-weight-bold">
                    <div class="p-2 flex-even">
                        <div class="d-flex" v-if="workplan.regular">
                            <div class="flex-even">{{ workplan.regular.time_start.substring(0, 5) }}</div>
                            <div class="flex-even">{{ workplan.regular.time_end.substring(0, 5) }}</div>
                            <!-- div>{{ workplan.time_end.substring(0, 5) }}</div -->
                        </div>
                    </div>
                    <div class="p-2 flex-even">

                    </div>
                    <div class="p-2 flex-even">
                        <div class="d-flex" v-if="workplan.break">
                            <div class="flex-even">{{ workplan.break.time_start.substring(0, 5) }}</div>
                            <div class="flex-even">{{ workplan.break.time_end.substring(0, 5) }}</div>
                            <!-- div>{{ workplan.time_end.substring(0, 5) }}</div -->
                        </div>
                    </div>
                    <!--div>Sum: {{ editItem.workplan }}</div -->
                </div>
                <hr>
                <div>
                    Notice:
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
    import moment from 'moment'
    import TimeLogEditRecord from "./TimeLog/EditRecord";
    moment.locale('de');

    export default {
        name: "TimeLog",
        components: {TimeLogEditRecord},
        data() {
            return {
                homeEditRows: 1,
                breakEditRows: 1,
                fields: [
                    {
                        key: 'booking_date',
                        formatter: 'formatDate',
                        label: this.$t('Booking Date')
                    },
                    {
                        key: 'regular',
                        label: this.$t('Regular Time')
                    },
                    {
                        key: 'regular_diff',
                        label: this.$t('Sum')
                    },
                    {
                        key: 'home',
                        label: this.$t('Home Visit')
                    },
                    {
                        key: 'home_diff',
                        label: this.$t('Sum')
                    },
                    {
                        key: 'break',
                        label: this.$t('Break')
                    },
                    {
                        key: 'break_diff',
                        label: this.$t('Sum')
                    },
                    /*{
                        key: 'sum',
                        label: this.$t('Sum'),
                        class: 'text-right'
                    },*/
                    {
                        key: 'extra',
                        label: this.$t('Extra Hours'),
                        class: 'text-right'
                    },
                    {
                        key: 'scheduled',
                        label: this.$t('Scheduled Hours'),
                        class: 'text-right'
                    },
                    {
                        key: 'workplan',
                        label: this.$t('Workplan Hours'),
                        class: 'text-right'
                    },
                    {
                        key: 'diff',
                        label: this.$t('Diff'),
                        class: 'text-right'
                    },
                    {
                        key: 'comments',
                        label: this.$t('Comment')
                    },
                    {
                        key: 'action',
                        label: ''
                    }
                ],
                records: [],
                users: [],
                selectedUser: this.$userId,
                editItem: null,
                workplan: null
            }
        },
        computed: {
            currentDate() {
                return moment().format('YYYY-MM-DD')
            }
        },
        mounted() {
            this.loadRecords();
            this.loadUsers();
        },
        methods: {
            loadRecords() {
                axios.get('/timelog/list', {
                    params: {
                        id: this.selectedUser
                    }
                })
                    .then(response => this.records = response.data)
            },
            loadWorkplanDetail(date) {
                axios.get('/timelog/workplan-detail', {
                    params: {
                        date: date,
                        user_id: this.selectedUser
                    }
                })
                    .then(response => this.workplan = response.data)
            },
            loadUsers() {
                axios.get('/zvs/users')
                    .then(response => this.users = response.data)
            },
            formatDate(value) {
                if (value === 'Σ') {
                    return 'Σ'
                } else if (value === 'monthly_sum') {
                    return 'Σ'
                } else {
                    return moment(String(value)).format('DD. dddd')
                }
            },
            rowClass(item, type) {
                if (!item) return;
                let ret = '';
                if (item.week_divider) {
                    ret = 'week-divider'
                }
                if (item.month_divider) {
                    ret += ' month-divider'
                }
                if (item.booking_date === 'Σ') {
                    ret = ' table-secondary'
                }
                return ret
            },
            numEditItems(item, counter = 1) {
                return Math.max(item.from.length, item.to.length, counter)
            },
            onEdit(item) {
                console.log('Edit item', item);
                this.loadWorkplanDetail(item.booking_date);
                this.editItem = JSON.parse(JSON.stringify(item)); //clone object
                this.editItem.regular.from.sort();
                this.editItem.regular.to.sort();
                if (this.editItem.regular.from.length > 1) {
                    //only get earliest from and latest to time
                    this.editItem.regular.from = this.editItem.regular.from.slice(0, 1);
                }
                if (this.editItem.regular.to.length > 1) {
                    //only get the most recent
                    this.editItem.regular.to = this.editItem.regular.to.slice(-1);
                }
                this.homeEditRows = this.numEditItems(item.home);
                this.breakEditRows = this.numEditItems(item.break);
            },
            onSave() {
                axios.post('/timelog/update?user_id=' + this.selectedUser, {
                    ...this.editItem
                })
                    .then((response) => {
                        this.loadRecords()
                    })
            }
        },
        watch: {
            selectedUser: function () {
                this.loadRecords()
            }
        }
    }
</script>

<style scoped>
    .flex-even {
        flex: 1;
    }
</style>
