<template>
    <div class="container">
        <app-user-cards @userCardClick="handleCardClick($event)" ref="usercards"></app-user-cards>

        <b-modal id="modal-pin" style="display: none;" size="md" @ok="verifyUserPin" @cancel="resetModal" @hide="resetModal" hide-footer>
            <template slot="modal-title">
                {{ currentUser.firstname }} {{ currentUser.lastname.charAt(0) }}.
            </template>
            <form ref="form" @submit.stop.prevent="verifyUserPin">
                <div class="row mb-3">
                    <div class="col-4">
                        <div>
                            {{ $t('Present') }}
                        </div>
                        <div class="row">
                            <div class="col-6 pr-1">
                                <button type="button"
                                        class="btn btn-block"
                                        @click="setActive(10)"
                                        :class="{active: (type === 10), 'btn-outline-secondary': isDisabled(10), 'btn-outline-success': !isDisabled(10)}"
                                        :disabled="isDisabled(10)">{{ startText }}</button>
                            </div>
                            <div class="col-6 pl-1">
                                <button type="button" class="btn btn-block" @click="setActive(11)" v-bind:class="{active: (type === 11), 'btn-outline-secondary': isDisabled(11), 'btn-outline-secondary': !isDisabled(11)}" :disabled="isDisabled(11)">{{ $t('End') }}</button>
                            </div>
                        </div>

                    </div>
                    <div class="col-4">
                        <div>
                            {{ $t('Break') }}
                        </div>
                        <div class="row">
                            <div class="col-6 pr-1">
                                <button type="button" class="btn btn-block" @click="setActive(20)" v-bind:class="{active: (type === 20), 'btn-outline-secondary': isDisabled(20), 'btn-outline-info': !isDisabled(20)}" :disabled="isDisabled(20)">{{ $t('Start') }}</button>
                            </div>
                            <div class="col-6 pl-1">
                                <button type="button" class="btn btn-block" @click="setActive(21)" v-bind:class="{active: (type === 21), 'btn-outline-secondary': isDisabled(21), 'btn-outline-success': !isDisabled(21)}" :disabled="isDisabled(21)">{{ $t('End') }}</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div>
                            {{ $t('Home visitation') }}
                        </div>
                        <div class="row">
                            <div class="col-6 pr-1">
                                <button type="button" class="btn btn-block" @click="setActive(30)" v-bind:class="{active: (type === 30), 'btn-outline-secondary': isDisabled(30), 'btn-outline-warning': !isDisabled(30)}" :disabled="isDisabled(30)">{{ $t('Start') }}</button>
                            </div>
                            <div class="col-6 pl-1">
                                <button type="button" class="btn btn-block" @click="setActive(31)" v-bind:class="{active: (type === 31), 'btn-outline-secondary': isDisabled(31), 'btn-outline-success': !isDisabled(31)}" :disabled="isDisabled(31)">{{ $t('End') }}</button>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row mb-3">
                    <div class="col-4 offset-8">
                        <div>
                            Computer
                        </div>
                        <button type="button" class="btn btn-primary btn-block">{{ $t('Turn on') }}</button>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col">
                        <div class="border p-2" style="min-height: 100px;">
                            Hinweistext...
                        </div>
                    </div>
                </div>

                <hr>

                <div class="row form-inline" style="align-items: normal;">
                    <div class="col-5 offset-4 pr-1">
                        <input type="number"
                               id="tlogInputPin"
                               v-model="pin"
                               class="form-control"
                               placeholder="1234"
                               autocomplete="pleaseno"
                               required
                               minlength="4"
                               maxlength="4"
                               v-bind:class="{'is-invalid': validationError}"
                               @keydown="validationError = ''"
                               ref="pin"
                               style="width: inherit;"
                               autofocus
                        />
                        <div class="invalid-feedback" v-if="validationError">
                            {{ $t('Incorect PIN.') }}
                        </div>
                    </div>
                    <div class="col-3 pl-1">
                        <button type="button" class="btn btn-primary btn-block" @click="verifyUserPin">{{ $t('OK') }}</button>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="alert alert-danger mt-2" role="alert" v-for="error in errors">
                            {{ error[0] }}
                        </div>
                    </div>
                </div>
            </form>
        </b-modal>
    </div>
</template>

<script>
    import UserCards from './UserCards.vue';

    export default {
        components: {
            appUserCards: UserCards
        },
        data() {
            return {
                //map of disabled types according to last type
                disabledTypes: new Map([
                    [10, [21, 31]],
                    [11, [20, 21, 30, 31]],
                    [20, [10, 11, 30, 31]],
                    [21, [10, 31]],
                    [30, [10, 11, 20, 21]],
                    [31, [10, 21]]
                ]),
                pin: '',
                type: 11, //by default end work
                name: '',
                validationError: '',
                currentUser: {
                    firstname: '',
                    lastname: '',
                    email: '',
                    type: 11
                },
                types: [
                    {id: 10, name: 'Start work'},
                    {id: 11, name: 'End work'},
                    {id: 20, name: 'Start break'},
                    {id: 21, name: 'End break'},
                    {id: 30, name: 'Start home visit'},
                    {id: 31, name: 'End home visit'}
                ],
                errors: [],
                startText: this.$t('Start')
            }
        },
        mounted() {
            let self = this
            this.$root.$on('bv::modal::shown', (bvEvent, modalId) => {
                self.$refs.pin.focus()
            })
        },
        methods: {
            setActive(type) {
                if (!this.isDisabled(type)) {
                    this.type = type
                }
            },
            isDisabled(type) {
                if (this.currentUser.type === type) {
                    return true
                }
                if (this.userDisabledTypes.indexOf(type) !== -1) {
                    return true
                }
                return false
            },
            handleCardClick(user) {
                this.currentUser = user;

                //guess next type
                if (user.type === 10) {
                    this.type = 20
                } else if (user.type === 11) {
                    this.type = 10
                } else if (user.type === 20) {
                    this.type = 21
                } else if (user.type === 21) {
                    this.type = 11
                } else if (user.type === 30) {
                    this.type = 31
                } else if (user.type === 31) {
                    this.type = 11
                }

                // if starting regular time for second time, button should read 'Restart'
                let now = new Date();
                if (user.booking_time && user.type === 11 && now.toISOString().split('T')[0] === user.booking_time.substr(0, 10)) {
                    this.startText = this.$t('Restart');
                } else {
                    this.startText = this.$t('Start');
                }
            },
            verifyUserPin(bvModalEvt) {
                bvModalEvt.preventDefault();
                axios.post('/zvs/track', {
                    pin: this.pin,
                    email: this.currentUser.email,
                    type: this.type
                })
                    .then(response => {
                        this.$bvModal.hide('modal-pin');
                        this.$refs.usercards.loadUsers();
                        try {
                            this.$socket.emit('timelog')
                        } catch (e) {
                            console.log('Could not emit event.')
                        }

                    })
                    .catch(error => {
                        //console.log('response', error.response)
                        this.errors = error.response.data.errors;
                        if (error.response.status == 401) {
                            this.validationError = true;
                            this.pin = '';
                            this.$refs.pin.focus()
                        }
                        //refresh
                        if (error.response.status == 400) {
                            this.pin = '';
                            this.$bvModal.hide('modal-pin');
                            this.$refs.usercards.loadUsers();
                        }

                    })
            },
            resetModal() {
                this.validationError = '';
                this.pin = '';
                this.errors = []
            }
        },
        computed: {
            userDisabledTypes() {
                if (this.currentUser.type) {
                    return this.disabledTypes.get(this.currentUser.type)
                } else {
                    return this.disabledTypes.get(11)
                }

            }
        },
        sockets: {
            connect: function () {
                console.log('Socket connected')
            },
            update: function (data) {
                this.$refs.usercards.loadUsers()
            }
        }
    }
</script>

<style scoped>
    .btn.disabled, .btn:disabled {
        opacity: 0.30;
    }
</style>
