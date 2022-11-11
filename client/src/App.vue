<template >
<div id="app">
	<div>
		<TheNavbar 
			v-if="displayNavbar"
			:jwt='userData.JWT'
			:projectList="userData.projects"
			:selectedProject="selectedProject"
			:hasUnreadNotification="userData.hasUnreadNotification"
			@readNotifications="userData.hasUnreadNotification = false"
			@changeProject="changeSelectedProject($event)" />

		<router-view 
			@login="login($event)" 
			@logout="logout()"
			@changeProject="changeSelectedProject($event)"
			:isAdmin="userData.isAdmin"
			:projectList="userData.projects"
			:selectedProject="selectedProject"
			:jwt="userData.JWT"
			class="mt-14 xl:mt-20 xl:pl-60"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheNavbar from './components/TheNavbar.vue';

export default Vue.extend({
	name: 'App',
	components: {
		TheNavbar,
	},
	data() {
		return {
			selectedProject: {
				_id: '',
				name: '',
				role: '',
				views: [],
				permissions: [],
			},
			userData: {
				_id: '',
				JWT: '',
				isAdmin: false,
				username: '',
				projects: [] || undefined,
				hasUnreadNotification: false,
			},
		}
	},
	computed: {
		displayNavbar() {
			if (this.$route.name === 'Login') {
				return false;
			} else if (this.$route.name === 'Register') {
				return false;
			} else {
				return true;
			}
		}
	},
	created() {
		const userData = sessionStorage.getItem('userdata');
		if (userData) {
			this.userData = JSON.parse(userData);
			if (this.userData.projects[0]) {
				this.selectedProject = {
					_id: this.userData.projects[0]._id,
					name: this.userData.projects[0].name,
					role: this.userData.projects[0].role,
					views: this.userData.projects[0].views,
					permissions: this.userData.projects[0].permissions,
				};
			}
		}
	},
	methods: {
		login(userdata: {
			_id: string;
			JWT: string;
			isAdmin: boolean;
			username: string;
			projects: [];
			hasUnreadNotification: boolean;
		}) {
			this.userData = userdata;
			if (this.userData.projects[0]) {
				this.selectedProject = {
					_id: this.userData.projects[0]._id,
					name: this.userData.projects[0].name,
					role: this.userData.projects[0].role,
					views: this.userData.projects[0].views,
					permissions: this.userData.projects[0].permissions,
				};
				sessionStorage.setItem('views', JSON.stringify(this.userData.projects[0].views));
			}
			sessionStorage.setItem('userdata', JSON.stringify(userdata));
			sessionStorage.setItem('isAdmin', this.userData.isAdmin.toString());
			this.$router.push('/');
		},
		logout() {
			this.userData = {
				_id: '',
				JWT: '',
				isAdmin: false,
				username: '',
				projects: [],
				hasUnreadNotification: false,
			};
			this.selectedProject = {
				_id: '',
				name: '',
				role: '',
				views: [],
				permissions: [],
			};
			sessionStorage.removeItem('views');
			sessionStorage.removeItem('userdata');
			sessionStorage.removeItem('isAdmin');
			this.$router.push('/login');
		},
		changeSelectedProject(project: { _id: string; name: string; role: string; views: Array<string>; permissions: Array<string>}) {
			this.selectedProject = project;
			sessionStorage.setItem('views', JSON.stringify(project.views));
		}
	}
});
</script>
