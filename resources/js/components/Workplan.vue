<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h5>{{ $t('Workplans') }}</h5>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Workplan",

        data() {
            return {
                users: []
            }
        },

        mounted() {
            //fetch users
            //this.loadUsers()
        },

        methods: {

        }
    }
</script>
