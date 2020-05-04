<template>
    <div class="container patient-overview">
        <patient :patient="patient" v-if="notEmptyObject(patient)"></patient>
    </div>
</template>

<script>
    import Patient from "./Patient";

    export default {
        name: "PatientWrapper",
        components: {Patient},
        data() {
            return {
                patient: {}
            }
        },
        mounted() {
            this.loadPatient(this.$route.params.id)
        },
        methods: {
            loadPatient(id) {
                this.patient = {};
                axios.get('/patients/' + id)
                    .then(response => {
                        this.patient = response.data;
                    })
            },
        },
        watch: {

        },
        computed: {

        }
    }
</script>
