<template>
    <div class="container patient-overview">
        <patient :patient="patient" v-if="notEmptyObject(patient)"></patient>
        <div v-else>
            {{ $t('Waiting for connection') }} ...
        </div>
    </div>
</template>

<script>
    import Patient from "./Patient";

    export default {
        name: "PatientAutoOpener",
        components: {Patient},
        data() {
            return {
                patient: {},
                auto: false
            }
        },
        mounted() {
            console.log('mounted');
            console.log(this.$route.params);
            if (this.$route.params.id) {
                this.loadPatient(this.$route.params.id);
            }
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
        sockets: {
            connect: function () {
                console.log('Socket connected')
            },
            open: function (data) {
                console.log('data', data);
                if (data.data.workstation_id == this.$config.IP) {
                    this.loadPatient(data.data.patient_id);
                } else {
                    console.log(`Workstation ID does not match: ${this.$config.IP} <> ${data.data.workstation_id}`);
                }
            }
        },
        watch: {

        },
        computed: {

        }
    }
</script>
