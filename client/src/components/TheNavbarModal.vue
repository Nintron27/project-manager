<template>
<div class="xl:hidden fixed top-14 pl-3 w-full h-full flex flex-col bg-primary-800">	
	<span @click="$emit('closeModal')" class="my-7 mr-auto">
		<router-link to="/" class="router-link">
			<svg class="router-svg" viewBox="0 0 256 256"><path d="M112 40H48a8 8 0 0 0-8 8v64a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8zm-8 64H56V56h48zm104-64h-64a8 8 0 0 0-8 8v64a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8zm-8 64h-48V56h48zm-88 32H48a8 8 0 0 0-8 8v64a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-64a8 8 0 0 0-8-8zm-8 64H56v-48h48zm104-64h-64a8 8 0 0 0-8 8v64a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-64a8 8 0 0 0-8-8zm-8 64h-48v-48h48z"></path></svg>
			Dashboard
		</router-link>
	</span>
	<span @click="$emit('closeModal')" class="mb-7 mr-auto">
		<router-link to="/usertickets" class="router-link">
			<svg class="router-svg" viewBox="0 0 1728 1728"><path d="M992 420l316 316l-572 572l-316-316zm-211 979l618-618q19-19 19-45t-19-45l-362-362q-18-18-45-18t-45 18L329 947q-19 19-19 45t19 45l362 362q18 18 45 18t45-18zm889-637l-907 908q-37 37-90.5 37t-90.5-37l-126-126q56-56 56-136t-56-136t-136-56t-136 56L59 1146q-37-37-37-90.5T59 965L966 59q37-37 90.5-37t90.5 37l125 125q-56 56-56 136t56 136t136 56t136-56l126 125q37 37 37 90.5t-37 90.5z"></path></svg>
			My Tickets
		</router-link>
	</span>
	<span v-if="selectedProject.views.includes('TicketsManage')" @click="$emit('closeModal')" class="mb-7 mr-auto">
		<router-link to="/manage-tickets" class="router-link">
			<svg class="router-svg" viewBox="0 0 20 20"><path d="M20 6.38L18.99 9.2v-.01c-.52-.19-1.03-.16-1.53.08s-.85.62-1.04 1.14s-.16 1.03.07 1.53c.24.5.62.84 1.15 1.03v.01l-1.01 2.82l-15.06-5.38l.99-2.79c.52.19 1.03.16 1.53-.08c.5-.23.84-.61 1.03-1.13s.16-1.03-.08-1.53a1.93 1.93 0 0 0-1.13-1.02L4.93 1zm-4.97 5.69l1.37-3.76c.12-.31.1-.65-.04-.95s-.39-.53-.7-.65L8.14 3.98c-.64-.23-1.37.12-1.6.74L5.17 8.48c-.24.65.1 1.37.74 1.6l7.52 2.74c.14.05.28.08.43.08c.52 0 1-.33 1.17-.83zM7.97 4.45l7.51 2.73c.19.07.34.21.43.39c.08.18.09.38.02.57l-1.37 3.76c-.13.38-.58.59-.96.45L6.09 9.61a.75.75 0 0 1-.45-.96l1.37-3.76c.1-.29.39-.49.7-.49c.09 0 .17.02.26.05zm6.82 12.14c.35.27.75.41 1.2.41H16v3H0v-2.96c.55 0 1.03-.2 1.41-.59c.39-.38.59-.86.59-1.41s-.2-1.02-.59-1.41s-.86-.59-1.41-.59V10h1.05l-.28.8l2.87 1.02c-.51.16-.89.62-.89 1.18v4c0 .69.56 1.25 1.25 1.25h8c.69 0 1.25-.56 1.25-1.25v-1.75l.83.3c.12.43.36.78.71 1.04zM3.25 17v-4c0-.41.34-.75.75-.75h.83l7.92 2.83V17c0 .41-.34.75-.75.75H4c-.41 0-.75-.34-.75-.75z"></path></svg>
			Manage Tickets
		</router-link>
	</span>
	<span v-if="selectedProject.views.includes('RolesManage')" @click="$emit('closeModal')" class="mb-7 mr-auto">
		<router-link to="/manage-roles" class="router-link">
			<svg class="router-svg" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1s1-4 5-4s5 3 5 4s-1 1-1 1H7zm4-6a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"></path><path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"></path><path d="M4.5 8a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z"></path></svg>
			Manage Roles
		</router-link>
	</span>
	<span v-if="selectedProject.views.includes('ProjectsManage')" @click="$emit('closeModal')" class="mb-7 mr-auto">
		<router-link to="/manage-projects" class="router-link">
		<svg class="router-svg" viewBox="0 0 256 256"><path d="M230.91 171.97a8 8 0 0 1-2.879 10.94l-96 56a8 8 0 0 1-8.062 0l-96-56a8 8 0 0 1 8.062-13.82L128 222.738l91.969-53.648a8 8 0 0 1 10.941 2.88zm-10.941-50.88L128 174.738L36.031 121.09a8 8 0 0 0-8.062 13.82l96 56a8 8 0 0 0 8.062 0l96-56a8 8 0 0 0-8.062-13.82zm-192-34.18l96 56a8 8 0 0 0 8.062 0l96-56a8 8 0 0 0 0-13.82l-96-56a8 8 0 0 0-8.062 0l-96 56a8 8 0 0 0 0 13.82z"></path></svg>
			Manage Projects
		</router-link>
	</span>
	<span @click="$emit('closeModal')" class="mr-auto">
		<router-link to="/logout" class="mt-auto router-link">
			<svg class="router-svg" viewBox="0 0 24 24"><path d="M16 17v-3H9v-4h7V7l5 5l-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"></path></svg>
			Logout
		</router-link>
	</span>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
	name: "TheNavbarModal",
	props: {
		selectedProject: {
			type: Object as PropType<{
				_id: '';
				name: '';
				role: '';
				views: string[];
			}>,
		},
	}
})
</script>

<style lang="postcss" scoped>
.router-link {
	@apply py-2 px-4 rounded-lg text-2xl font-bold text-gray-light-50 flex;
}

.router-link-exact-active {
	@apply font-bold bg-gray-light-50 text-gray-dark-900;
}

.router-svg {
	@apply w-8 h-8 fill-current mr-1.5;
}
</style>