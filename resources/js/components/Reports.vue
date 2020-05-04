<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-xl-10">
                <div class="card card-default">
                    <div class="card-header">Patient Reports</div>

                    <div class="card-body">

                        <form ref="Search"
                              @keyup="onKeyUp"
                              @submit.prevent="onSearchPatient">

                            <div class="form-row align-items-center">

                                <div class="col-auto">
                                    <div class="input-group mb-2">
                                        <div class="input-group-prepend">
                                            <div class="input-group-text">⌕</div>
                                        </div>
                                        <input type="text"
                                               v-model="searchPatientForm.q"
                                               class="form-control"
                                               id="inlineFormInputGroup"
                                               placeholder="Find patient">
                                    </div>
                                </div>

                                <div class="col-auto">
                                    <button type="submit" class="btn btn-primary mb-2">Submit</button>
                                </div>

                            </div>
                        </form>

                        <table class="table" v-if="patients.length">
                            <tr>
                                <th>Name</th>
                                <th>Birth Date</th>
                                <th>City</th>
                                <th>Last Visit</th>
                                <th></th>
                            </tr>
                            <tr v-for="patient in patients">
                                <td class="font-weight-bold">{{ patient.last_name }}, {{ patient.first_name }}</td>
                                <td>{{ patient.birth_date | formatBirthdate }}</td>
                                <td>{{ patient.city }}</td>
                                <td>{{ patient.last_visit }}</td>
                                <td class="text-right">
                                    <a :href="'/patient/' + patient.id"><font-awesome-icon icon="user" size="2x" /></a>
                                    <a :href="'/patients/' + patient.id + '/report/dm'" target="_blank"><font-awesome-icon icon="file-medical" size="2x" /></a>
                                    <a :href="'/patients/' + patient.id + '/report/html'" target="_blank"><font-awesome-icon icon="file-alt" size="2x" /></a>
                                    <a :href="'/patients/' + patient.id + '/report/pdf'" target="_blank"><font-awesome-icon icon="file-pdf" size="2x" /></a>
                                </td>
                            </tr>
                        </table>

                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Form } from 'vue-laravel-forms'

    export default {
        name: "Reports",
        data() {
            return {
                patients: [],
                searchPatientForm: new Form({
                    q: '',
                })
            }
        },

        mounted() {
            /*
            axios.get('patients')
                .then(response => this.patients = response.data)
             */
        },

        methods: {

            onKeyUp: function (e) {
                // console.log(this.searchPatientForm.q)
            },

            onSearchPatient: function () {
                this.$forms.post('patients', this.searchPatientForm)
                    .then(response => this.patients = response )
                    .catch(errors => console.log(errors, 'err') );
            }

        }
    }
</script>

<style scoped>

</style>
