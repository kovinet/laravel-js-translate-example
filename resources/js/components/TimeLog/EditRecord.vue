<template>
    <div class="form-inline flex-nowrap mb-2">
        <input type="text" class="form-control" id="inputRegFrom" v-model="entry.from[index]" placeholder="00:00">
        <input type="text" class="form-control ml-2" id="inputRegTo" v-model="entry.to[index]" placeholder="00:00">
    </div>
</template>

<script>
    export default {
        name: "TimeLogEditRecord",
        props: {
            entry: Object,
            index: Number
        },
        methods: {
            validTime() {

            }
        },
        watch: {
            entry: function () {
                console.log('entry changed', this.entry)
            }
        }
    }
</script>

<style scoped>
    input {
        width: 100% !important;
    }
</style>
