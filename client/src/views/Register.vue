<template>
<div class="w-full px-5 h-full fixed z-20 -mt-0 xl:pr-60 xl:-mt-0 bg-gray-light-200 flex flex-col justify-center items-center">
	<div class="absolute top-0 left-0 shadow-md w-full bg-primary-800 py-3 md:py-4 flex">
		<h1 class="mx-auto xl:ml-7 font-bold text-2xl xl:text-3xl text-gray-light-50">Project Manager</h1>
	</div>
	<h2 class="text-gray-dark-600 xl:mb-2 text-2xl xl:text-3xl">Register New Account</h2>
	<span class="text-red-600">{{ errorMessage }}</span>
	<input 
		class="w-full max-w-xs xl:max-w-sm mt-3 py-2 pl-2 bg-gray-light-200 border-b border-gray-dark-200 outline-none focus:bg-opacity-10 focus:bg-primary-800 placeholder-gray-dark-300 text-xl transition-colors duration-300 rounded-none" 
		type="text" 
		placeholder="Username..."
		v-model="username" >
	<input 
		class="w-full max-w-xs xl:max-w-sm mt-3 py-2 pl-2 bg-gray-light-200 border-b border-gray-dark-200 outline-none focus:bg-opacity-10 focus:bg-primary-800 placeholder-gray-dark-300 text-xl transition-colors duration-300 rounded-none" 
		type="text" 
		placeholder="Email..."
		v-model="email" >
	<input 
		class="w-full max-w-xs xl:max-w-sm mt-3 py-2 pl-2 bg-gray-light-200 border-b border-gray-dark-200 outline-none focus:bg-opacity-10 focus:bg-primary-800 placeholder-gray-dark-300 text-xl transition-colors duration-300 rounded-none" 
		type="password" 
		placeholder="Password..."
		v-model="password" >
	<input 
		class="w-full max-w-xs xl:max-w-sm mt-3 py-2 pl-2 bg-gray-light-200 border-b border-gray-dark-200 outline-none focus:bg-opacity-10 focus:bg-primary-800 placeholder-gray-dark-300 text-xl transition-colors duration-300 rounded-none" 
		type="password" 
		placeholder="Confirm Password..."
		v-model="confirmPassword" >
	<button 
		class="mt-3 py-1.5 px-6 bg-primary-800 rounded-lg shadow-md text-2xl xl:text-3xl focus:outline-none text-gray-light-50 transition-colors duration-300 focus:bg-primary-600 hover:bg-primary-600"
		@click="register()" >Register</button>
	<span class="text-gray-dark-200 mt-3">
		Already have an account? 
		<router-link to="/login" class="text-primary-600 cursor-pointer">Login</router-link>
	</span>
	<span class="text-gray-dark-200 mt-0.5">
		Sign in as a 
		<router-link to="/demo-login" class="text-primary-600 cursor-pointer">Demo User</router-link>
	</span>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { register } from '../api/user';
import Joi from 'joi';

export default Vue.extend({
	data() {
		return {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			errorMessage: '',
		}
	},
	methods: {
		async register() {
			const { error } = Joi.object({
				username: Joi
					.string()
					.min(4)
					.required()
					.messages({
						'string.min': 'username must be atleast 2 characters',
						'string.empty': 'username is required',
					}),
				email: Joi
					.string()
					.email({ tlds: {allow: false} })
					.required()
					.messages({
						'string.email': 'invalid email',
						'string.empty': 'email is required',
					}),
				password: Joi
					.string()
					.required()
					.min(8)
					.messages({
						'string.empty': 'password is required',
						'string.min': 'password must be atleast 8 characters'
					}),
				confirmPassword: Joi
					.string()
					.required()
					.messages({
						'string.empty': 'confirmation password is required'
					})
			}).validate({
				username: this.username,
				email: this.email,
				password: this.password,
				confirmPassword: this.confirmPassword,
			});

			if (error) {
				this.errorMessage = error.details[0].message;
				return;
			} else {
				this.errorMessage = '';
			}

			if (this.password === this.confirmPassword) {
				try {
					await register(this.username, this.email, this.password);
				} catch (error) {
					this.errorMessage = error.response.data.toLowerCase();
				}
				this.$router.push('/login');
			} else {
				this.errorMessage = "passwords don't match";
			}
		}
	}
})
</script>