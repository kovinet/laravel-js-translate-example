<template>
    <table class="table table-bordered table-sm">
        <thead>
        <tr>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col">{{ $t('Medication') }}</th>
            <th scope="col">{{ $t('Form') }}</th>
            <th scope="col">{{ $t('Dosage') }}</th>
            <th scope="col">{{ $t('Last') }}</th>
            <th scope="col">{{ $t('First') }}</th>
            <th scope="col">{{ $t('Info') }}</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="item in orderMedications" v-if="showMedicationRow(item)">
                <td class="px-2 text-left" :class="daysClass(item.days)">
                    <span v-if="item.days || item.days === 0" class="font-weight-bold">
                        <template v-if="item.days >= 0">
                            {{ $t('in {days} days', {days: item.days }) }}
                        </template>
                        <template v-else>
                            {{ $t('{days} days ago', {days: Math.abs(item.days) }) }}
                        </template>
                    </span>
                    <template v-else>
                        {{ $t('unknown') }}
                    </template>
                </td>
                <td class="type text-center" :class="!item.type || item.type.length > 1 ? 'bg-danger' : ''">
                    <span v-show="item.type && item.type.length === 1">{{ item.type }}</span>
                </td>
                <td class="mr-auto px-2" :class="medicationClass(item)">
                    ({{ item.qty }}) {{ item.name }}
                </td>
                <td>
                    {{ medicationForm(item) }}
                </td>
                <td>
                    <template v-if="item.freq">({{ item.freq }})</template>
                    <!-- template v-else="item.freq">unknown</template -->
                </td>
                <td>
                    {{ item.dates[0] | formatDate('DD.MM.YY') }}
                </td>
                <td>
                    {{ item.dates[item.dates.length - 1] | formatDate('DD.MM.YY') }}
                </td>
                <td class="diff text-right" :class="item.visitAlert ? 'bg-danger text-white' : 'text-primary'">
                    <span :id="'tooltip-date-diffs' + item.name.hashCode()">{{ item.duration ? item.duration : (item.avgDiff ? `?_${item.avgDiff}` : '???') }}</span>
                    <b-tooltip :target="'tooltip-date-diffs' + item.name.hashCode()" triggers="hover">
                        <div class="text-left">
                            {{ $t('Interval') }}:<template v-for="(date, index) in item.dateDiff"><template v-if="date.diff">&nbsp;</template>{{ date.diff }}</template>
                        </div>
                        <div class="text-left" v-if="item.avgDiff">{{ $t('Average') }}: {{ item.avgDiff }}</div>
                        <div class="text-left" v-if="item.perPackage">{{ $t('Package contents') }}: {{ item.perPackage }}</div>
                        <div class="text-left" v-if="item.avgDiff && item.perPackage">{{ $t('Calculated dosage') }}: {{ (parseInt(item.perPackage) / parseInt(item.avgDiff)).toFixed(1).replace('.', ',') }} / {{ $t('day') }}</div>
                    </b-tooltip>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import moment from 'moment'
    export default {
        name: "FrequentMedications",
        props: {
            medications: {
                type: Array,
                required: true
            }
        },
        methods: {
            medicationClass(item) {
                if (item.days) {
                    if (item.days < -30) {
                        return 'bg-danger text-white'
                    } else if (item.days < 30) {
                        return 'bg-success text-white'
                    }
                }
                if (!item.type || item.type.length > 1) {
                    return 'bg-danger text-white'
                }
            },
            daysClass(days) {
                if (days && days < -30) {
                    return 'bg-danger text-white'
                }
            },
            /**
             * Get last 5 visits with day diff between them
             * @param item medication row
             * @returns {[]} last 5 dates and diff days
             */
            medicationDates(item) {
                let arrDates = item.dates.split(',', 5);
                let result = [];
                let datePrev = moment();
                _.each(arrDates, val => {
                    let date = moment(val);
                    result.push({
                        date: val,
                        diff: datePrev.diff(date, 'days')
                    });
                    datePrev = moment(date)
                });
                //add blank fields for easier display aligning
                /*
                if (result.length < 5) {
                    let last = false;
                    let len = result.length;
                    if (result.length > 1) {
                        last = result.pop();
                    }
                    let fake = {
                        date: '',
                        diff: ''
                    };
                    for (let i = len; i < 5; i++) {
                        result.push(fake)
                    }
                    if (last) {
                        result.push(last)
                    }
                }
                 */
                return result
            },
            showMedicationRow(item) {
                //hide items which have abgesetzt date in pasta
                if (item.name.indexOf('[abgesetzt am') > -1) {
                    let date = item.name.match(/\[abgesetzt am ([\d\.]*)\]/);
                    if (date) {
                        date = moment(date, 'DD.MM.YYYY');
                        //console.log('abgesetzt am', date)
                        if (date < moment()) {
                            return false;
                        }
                    }
                }
                return true;
            },
            /**
             * Calculates duration of medications and time diff to next visit until they run out
             * @param item
             * @returns {{duration: *, days: null}|string}
             */
            medicationPrescriptionData(item) {
                let dates = this.medicationDates(item);
                console.log('dates', dates);
                console.log('name', item.name);
                //get average diff number from last 3 diffs
                let avgDiff, currDiff = null;
                if (dates.length) {
                    //average days difference from last 4 visits
                    avgDiff = Math.round(
                        dates.filter(d => d.diff !== '')
                            .slice(1, 5) //don't include first value
                            .reduce((acc, val, i) => {
                                return acc + parseInt(val.diff)
                            }, 0)
                        /
                        Math.min(4, (dates.length - 1))
                    );
                    currDiff = dates[0].diff
                } else {
                    return '';
                }
                console.log('avgDiff', avgDiff);
                console.log('currDiff', currDiff);

                //parse memo
                let boxes = /^\d+ */.test(item.name) ? /^\d+ */.exec(item.name)[0] : 1;
                console.log('boxes', boxes);
                let perPackage = /\d+ ST,/.test(item.name) ? /(\d*X?\d+)+ ST,/.exec(item.name)[1] : null;
                if (perPackage && perPackage.indexOf('X') > 0) {
                    let tmp = perPackage.split('X');
                    perPackage = tmp[0] * tmp[1];
                }
                console.log('perPackage', perPackage);

                let dailyDosage = null;
                if (item.freq) {
                    item.freq = item.freq.replace(/ /g, '');
                    dailyDosage = item.freq.split('-').reduce((sum, val) => {
                        if (val === '1/2') {
                            val = 0.5
                        }
                        return sum + parseFloat(val)
                    }, 0);
                }
                console.log('dailyDosage', dailyDosage);
                let duration = null;
                if (dailyDosage && perPackage) {
                    duration = Math.floor((boxes * perPackage) / dailyDosage);
                }
                console.log('duration', duration);

                return {
                    duration: duration,
                    avgDiff: avgDiff,
                    days: currDiff !== null && duration ? (duration - currDiff) : null,
                    dates: dates,
                    perPackage: perPackage,
                    dailyDosage: dailyDosage
                }
            },
            medicationForm(item) {
                const regex = /.+, (.+),.+,.+/;
                let res = regex.test(item.name) ? regex.exec(item.name)[1] : '';
                //console.log('form', res);
                return res;
            }
        },
        computed: {
            orderMedications() {
                console.log('Order medications');
                let medications = this.medications;

                //caclulate missing values
                medications.forEach((item, index) => {
                    let data = this.medicationPrescriptionData(item);
                    item.days = parseInt(data.days);
                    item.duration = data.duration;
                    item.dates = item.dates.split(',');
                    item.dateDiff = data.dates;
                    item.avgDiff = data.avgDiff;
                    item.perPackage = data.perPackage;
                    item.dailyDosage = data.dailyDosage;
                    item.visitAlert = false;
                    if (data.avgDiff) {
                        let avgDeviation = item.avgDiff / 100 * 15;
                        let durationFrom = item.avgDiff - avgDeviation;
                        let durationTo = item.avgDiff + avgDeviation;
                        if (item.duration > durationTo || item.duration < durationFrom) {
                            item.visitAlert = true;
                        }
                    }
                });

                //order array by days
                medications = _.orderBy(medications, ['days'], ['asc']);

                console.log('medications', medications);
                return medications;
            }

        }
    }
</script>

<style lang="scss" scoped>
    .medications {
        .date {
            width: 70px;
        }
        .diff {
            width: 50px;
        }
    }
    .type {
        min-width: 1rem;
    }
</style>
