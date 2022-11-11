<template>
<div class="w-full flex flex-col">
	<div 
		v-if="isPostProjectActive"
		class="fixed z-20 xl:-ml-60 top-0 bg-gray-dark-900 bg-opacity-25 w-screen h-screen flex">
		
		<div 
			class="sm:mx-auto sm:my-auto w-screen sm:w-96 h-screen sm:h-auto bg-gray-light-100 flex flex-col px-2 sm:rounded-2xl" >

			<svg @click="isPostProjectActive = false" class="sm:hidden h-10 w-10 ml-auto mt-2 text-gray-dark-600 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
			<div class="mt-10 sm:mt-2 flex items-center">
				<h2 class="text-gray-dark-600 text-xl font-bold">Post New Project</h2>
				<svg @click="isPostProjectActive = false" class="hidden sm:inline-block h-10 w-10 ml-auto text-gray-dark-600 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
			</div>
			<span class="text-red-600">{{ errorMessage }}</span>
			<input 
				type="mt-2 text"
				v-model="projectName"
				placeholder="Name..."
				class="rounded-lg bg-gray-light-300 max-h-8 pl-1 flex-grow">
			<textarea v-model="projectDescription" class="bg-gray-light-300 mt-2 resize-none h-20 pl-1 rounded-lg" placeholder="Description..."></textarea>
			<button
				@click="submitProject()"
				class="mt-2 bg-primary-800 px-2 py-1 rounded-lg text-gray-light-50 mb-2" >Post Project</button>
		</div>
	</div>

	<div class="xl:hidden md:flex py-1.5 px-2.5 border-b border-gray-light-300">
		<div 
			v-if="projectList.length > 0"
			class="flex flex-col md:w-1/2">

			<div class="flex justify-between">
				<span class="text-gray-dark-400">Select Project</span>
				<span class="text-gray-dark-300">Role: <span class="text-primary-600">{{ selectedProject.role }}</span></span>
			</div>
			<ProjectSelector 
				:projectList="projectList"
				:selectedProject="selectedProject" 
				@input="changeProject($event)"
				class="my-1" />
		</div>
		<button 
			v-if="isAdmin"
			@click="isPostProjectActive = true" 
			class="hidden md:inline-block bg-gray-light-100 my-auto mx-auto py-0.5 md:py-1 px-1.5 md:px-2.5 rounded-lg text-xl md:text-2xl text-primary-800">
				Create Project
		</button>
	</div>
	<button v-if="isAdmin" @click="isPostProjectActive = true" class="md:hidden xl:inline-block mt-2 bg-gray-light-100 py-0.5 xl:py-1 px-1.5 xl:px-2.5 rounded-lg text-xl xl:text-2xl ml-2 mb-2 xl:mb-0 mr-auto text-primary-800">Create Project</button>
	<div class="w-full flex flex-col md:flex-row px-2.5">
		<div class="md:w-1/2 bg-gray-light-100 rounded-lg shadow-md flex flex-col mt-2 p-1.5 md:mr-1.5">
			<span class="text-xs text-gray-dark-300">
				Select One or More Users
			</span>
			<div 
				v-for="user in unassignedUsers"
				:key="user._id"
				class="flex flex-col">
				<div class="flex mt-2 items-center">
					<span 
						@click="toggleUnassignedUser(user._id)"
						class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
						:class="[(assigningUsers.includes(user._id)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
						<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
					</span>
					<span class="text-lg font-bold">{{ user.username }}</span>
				</div>
			</div>
			<div class="mt-auto flex">
				<SelectorInput 
					v-model="roleToAssign"
					:name="'role'" 
					:options="roleNames"
					class="w-1/2 mr-1" />
				<button 
					@click="assignUsers()"
					class="bg-primary-800 px-3 mx-auto rounded-lg font-bold text-gray-light-50 text-xl">
					Assign to Project
				</button>
			</div>
		</div>
		<div class="md:w-1/2 bg-gray-light-100 rounded-lg shadow-md flex flex-col mt-2 p-1.5 pt-0.5 md:ml-1.5">
			<span class="text-xs text-gray-dark-300">
				Select One or More Users
			</span>
			<div 
				v-for="user in assignedUsers"
				:key="user._id"
				class="flex flex-col">
				<div class="flex mt-2 items-center">
					<span 
						@click="toggleAssignedUser(user._id)"
						class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
						:class="[(modifyUsers.includes(user._id)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
						<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
					</span>
					<span class="text-lg font-bold">{{ user.username }}</span>
				</div>
			</div>
			<SelectorInput 
					v-model="roleToModify"
					:name="'role'" 
					:options="roleNames"
					class="w-1/2 mt-2 mr-1" />
			<div class="mt-2 flex">
				<button 
					@click="modifyRoles()"
					class="bg-primary-800 px-3 mx-auto rounded-lg font-bold text-gray-light-50 text-xl">
					Modify Role
				</button>
				<button 
					@click="removeUsers()"
					class="bg-red-600 px-3 mx-auto rounded-lg font-bold text-gray-light-50 text-xl">
					Remove from Project
				</button>
			</div>
		</div>
	</div>
	
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Joi from 'joi';
import ProjectSelector from '../components/ProjectSelector.vue';
import SelectorInput from '../components/SelectorInput.vue';
import { 
	getRoles, 
	getUnassignedUsers, 
	getAssigned, 
	addUserToProject, 
	editProjectUser, 
	removeUserFromProject, 
  postProject} from '../api/project';

export default Vue.extend({
	name: "ProjectsManage",
	components: {
		ProjectSelector,
		SelectorInput,
	},
	props: {
		jwt: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			required: true,
		},
		selectedProject: {
			type: Object as PropType<{
				_id: '';
				name: '';
				role: '';
			}>,
		},
		projectList: {
			type: Array as PropType<Array<{
				_id: '';
				name: '';
				role: '';
			}>>,
			required: true,
		},
	},
	data() {
		return {
			unassignedUsers: null,
			assignedUsers: null,
			assigningUsers: [],
			modifyUsers: [],
			projectRoles: [],
			roleNames: [],
			roleToAssign: '',
			roleToModify: '',
			projectName: '',
			projectDescription: '',
			isPostProjectActive: false,
			errorMessage: '',
		}
	},
	async created() {
		this.unassignedUsers = await getUnassignedUsers(this.selectedProject._id, this.jwt);
		this.assignedUsers = await getAssigned(this.selectedProject._id, this.jwt);
		this.projectRoles = await getRoles(this.selectedProject._id, this.jwt);
		for (const role of this.projectRoles) {
			this.roleNames.push(role.name);
		}
	},
	methods: {
		async changeProject(project: { _id: string; name: string; role: string}) {
			this.$emit('changeProject', project);
		},
		toggleUnassignedUser(userID: string) {
			const index = this.assigningUsers.indexOf(userID)
			if (index >= 0) {
				this.assigningUsers.splice(index, 1);
			} else {
				this.assigningUsers.push(userID);
			}
		},
		toggleAssignedUser(userID: string) {
			const index = this.modifyUsers.indexOf(userID)
			if (index >= 0) {
				this.modifyUsers.splice(index, 1);
			} else {
				this.modifyUsers.push(userID);
			}
		},
		async assignUsers() {
			const roleID = this.projectRoles.find(x => x.name === this.roleToAssign)._id;
			for (const user of this.assigningUsers) {
				await addUserToProject(this.selectedProject._id, user, roleID, this.jwt);
			}
			this.assigningUsers = [];
			this.unassignedUsers = await getUnassignedUsers(this.selectedProject._id, this.jwt);
			this.assignedUsers = await getAssigned(this.selectedProject._id, this.jwt);
		},
		async modifyRoles() {
			const roleID = this.projectRoles.find(x => x.name === this.roleToModify)._id;
			for (const user of this.modifyUsers) {
				await editProjectUser(this.selectedProject._id, user, roleID, this.jwt);
			}
			this.modifyUsers = [];
		},
		async removeUsers() {
			for (const user of this.modifyUsers) {
				await removeUserFromProject(this.selectedProject._id, user, this.jwt);
			}
			this.modifyUsers = [];
			this.unassignedUsers = await getUnassignedUsers(this.selectedProject._id, this.jwt);
			this.assignedUsers = await getAssigned(this.selectedProject._id, this.jwt);
		},
		async submitProject() {
			const { error } = Joi.object({
				name: Joi
					.string()
					.required()
					.min(2)
					.messages({
						'string.empty': 'name is required',
						'string.min': 'name must be atleast 2 characters'
					}),
				description: Joi
					.string()
					.required()
					.messages({
						'string.empty': 'description is required'
					})
			}).validate({
				name: this.projectName,
				description: this.projectDescription,
			});

			if (error) {
				this.errorMessage = error.details[0].message;
				return;
			} else {
				this.errorMessage = '';
			}

			await postProject(this.projectName, this.projectDescription, this.jwt);
			this.isPostProjectActive = false;
			this.projectName = '';
			this.projectDescription = '';
		}
	},
})
</script>

<style lang="postcss" scoped>

</style>