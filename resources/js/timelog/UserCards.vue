<template>
    <div class="row mt-1">
        <div class="col-sm-4" v-for="user in users">
            <a href="#" class="card mt-2 mb-2" v-bind:class="getCardClass(user)" @click.prevent="openPinModal(user)">
                <div class="card-body">
                    <h2 class="card-title">{{ user.firstname }} {{ user.lastname.charAt(0) }}.</h2>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        name: "UserCards",
        data() {
            return {
                users: []
            }
        },
        mounted() {
            this.loadUsers()
        },
        methods: {
            loadUsers() {
                axios.get('/zvs/users')
                    .then(response => this.users = response.data)
            },
            openPinModal(user) {
                this.$root.$emit('bv::show::modal', 'modal-pin');
                this.$emit('userCardClick', user)
            },
            getCardClass(user) {
                if (user.type === 10 || user.type === 21 || user.type === 31) {
                    return 'bg-success text-white'
                } else if (user.type === 11) {
                    return 'bg-secondary text-white'
                } else if (user.type === 20) {
                    return 'bg-info text-white'
                } else if (user.type === 30) {
                    return 'bg-warning text-white'
                }

            }
        }
    }
</script>

<style scoped>
 a {
     text-decoration: none;
 }
</style>
