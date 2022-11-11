<template>
<div class="w-full px-5 h-full fixed z-20 -mt-0 xl:pr-60 xl:-mt-0 bg-gray-light-200 flex flex-col justify-center items-center">
	<div class="absolute top-0 left-0 shadow-md w-full bg-primary-800 py-3 md:py-4 flex">
		<h1 class="mx-auto xl:ml-7 font-bold text-2xl xl:text-3xl text-gray-light-50">Project Manager</h1>
	</div>
	<h2 class="text-gray-dark-600 xl:mb-2 text-2xl xl:text-4xl text-center">Sign in as Demo User</h2>
	<p class="my-4 text-xl xl:text-2xl text-gray-dark-600 text-center">
		As a demo user any changes submitted are not saved. <br>
		You are assigned to 3 "fake" projects and in each one you have a different role given.
	</p>
	<button 
		class="mt-3 py-1.5 px-6 bg-primary-800 rounded-lg shadow-md text-2xl xl:text-3xl focus:outline-none text-gray-light-50 transition-colors duration-300 focus:bg-primary-600 hover:bg-primary-600"
		@click="login()" >Continue</button>
	<span class="text-gray-dark-200 mt-3">
		Already have an accont? 
		<router-link to="/login" class="text-primary-600 cursor-pointer">Login</router-link>
	</span>
	<span class="text-gray-dark-200 mt-3">
		Want an account? 
		<router-link to="/register" class="text-primary-600 cursor-pointer">Register</router-link>
	</span>
	
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { login } from '../api/user';

export default Vue.extend({
	data() {
		return {
			email: '',
			password: '',
			errorMessage: '',
		}
	},
	methods: {
		async login() {
			try {
				const userdata = await login("demo@demo.com", "demouser1234");
				this.$emit('login', userdata);
			} catch (error) {
				this.errorMessage = error.response.data.toLowerCase();
			}
		}
	}
})
</script>