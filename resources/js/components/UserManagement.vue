<template>
    <div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3">
            <h1 class="h2">{{ $t('Users') }}</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <b-button variant="primary" @click="onAddUser"><font-awesome-icon icon="plus" /> {{ $t('Add User') }}</b-button>
                </div>
            </div>
        </div>

        <table class="table">
            <tr>
                <th>{{ $t('Name') }}</th>
                <th>{{ $t('Email') }}</th>
                <th>{{ $t('Role') }}</th>
                <th></th>
            </tr>

            <tr v-for="user in users">
                <td class="font-weight-bold">{{ user.firstname }} {{ user.lastname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td class="text-right">
                    <a href="#" @click.prevent="onEditUser(user)" class="mr-2"><font-awesome-icon icon="pencil-alt" size="lg" /></a>
                    <a href="#" @click.prevent="onDeleteUser(user.id)"><font-awesome-icon icon="trash-alt" size="lg" /></a>
                </td>
            </tr>

        </table>

        <b-modal
            id="modal-user-edit"
            :title="$t('Edit User')"
            @ok="onSaveUser"
            @cancel="clearForm"
            @hide="clearForm"
        >
            <form ref="EditUser" @submit.prevent="onSaveUser" onautocomplete="off">

                <div class="form-group">
                    <label for="userInputName">{{ $t('First Name') }}</label>
                    <input type="text"
                           id="userInputName"
                           v-model="saveUserForm.firstname"
                           class="form-control"
                           :placeholder="$t('First Name')"
                           autocomplete="off"
                           required
                    />
                </div>

                <div class="form-group">
                    <label for="userInputName">{{ $t('Last Name') }}</label>
                    <input type="text"
                           id="userInputLastname"
                           v-model="saveUserForm.lastname"
                           class="form-control"
                           :placeholder="$t('Last Name')"
                           autocomplete="off"
                           required
                    />
                </div>

                <div class="form-group">
                    <label for="userInputEmail">{{ $t('Email') }}</label>
                    <input type="email"
                           id="userInputEmail"
                           v-model="saveUserForm.email"
                           class="form-control"
                           :placeholder="$t('Email')"
                           autocomplete="pleaseno"
                           required
                    />
                </div>

                <div class="form-group">
                    <label for="userInputRole">{{ $t('Role') }}</label>
                    <select v-model="saveUserForm.role" class="form-control" id="userInputRole" required>
                        <option v-for="role in roles">{{ role }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="userInputPassword">{{ $t('Password') }}</label>
                    <input type="password"
                           id="userInputPassword"
                           v-model="saveUserForm.password"
                           class="form-control"
                           :placeholder="$t('Password')"
                           autocomplete="nothanx"
                    />
                </div>


                <div class="form-group">
                    <label for="userInputPin">{{ $t('PIN') }}</label>
                    <input type="number"
                           minlength="4"
                           id="userInputPin"
                           v-model="saveUserForm.pin"
                           class="form-control"
                           placeholder="****"
                           autocomplete="nothanx"
                    />
                </div>

            </form>

            <div class="alert alert-danger" v-if="errorMessage">
                {{ errorMessage }}
                <ul v-if="errors">
                    <li v-for="err in errors">{{ err[0] }}</li>
                </ul>
            </div>

        </b-modal>

    </div>

</template>

<script>
    import { Form } from 'vue-laravel-forms'

    export default {
        name: "UserList",

        data() {
            return {
                users: [],
                saveUserForm: this.initFormData(),
                roles: [
                    'administrator',
                    'employee'
                ],
                errorMessage: '',
                errors: []
            }
        },

        mounted() {
            //fetch users
            this.loadUsers()
        },

        methods: {
            initFormData() {
                return new Form({
                    name: '',
                    email: '',
                    role: 'employee',
                    password: ''
                })
            },
            clearForm() {
                this.saveUserForm = this.initFormData()
                this.errorMessage = ''
                this.errors = []
            },
            loadUsers() {
                axios.get('/users')
                    .then(response => this.users = response.data)
            },
            onSaveUser(bvModalEvt) {
                bvModalEvt.preventDefault()
                if (this.saveUserForm.id) {
                    axios.put('/users/' + this.saveUserForm.id, this.saveUserForm)
                        .then(response => {
                            this.$bvModal.hide('modal-user-edit')
                            this.loadUsers()
                        })
                        .catch(response => {
                            this.errors = error.response.data.errors
                            this.errorMessage = error.response.data.message
                        })
                } else {
                    axios.post('/users', this.saveUserForm)
                        .then(response => {
                            this.$bvModal.hide('modal-user-edit')
                            this.loadUsers()
                        })
                        .catch(error => {
                            this.errors = error.response.data.errors
                            this.errorMessage = error.response.data.message
                        })
                }
            },
            onAddUser() {
                this.saveUserForm = this.initFormData()
                this.$bvModal.show('modal-user-edit')
            },
            onEditUser(user) {
                this.saveUserForm = new Form(user)
                this.$bvModal.show('modal-user-edit')
            },
            onDeleteUser(id) {
                this.$bvModal.msgBoxConfirm('Are you sure?')
                    .then(value => {
                        console.log(value)
                        axios.delete('/users/' + id)
                            .then((response) => {
                                console.log('Reload users list')
                                axios.get('/users')
                                    .then(response => this.users = response.data)
                            });
                    })
                    .catch(err => {
                        // An error occurred
                    })
                //this.$refs['modal-user-delete-confirm'].show()
            }
        }
    }
</script>
