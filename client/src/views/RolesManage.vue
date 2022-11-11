<template>
<div class="w-full flex flex-col">
	<div 
		v-if="projectList.length > 0"
		class="xl:hidden md:flex py-1.5 px-2.5 border-b border-gray-light-300">
		<div class="flex flex-col md:w-1/2">
			<div class="flex justify-between">
				<span class="text-gray-dark-400">Select Project</span>
				<span class="md:hidden text-gray-dark-300">Role: <span class="text-primary-600">{{ selectedProject.role }}</span></span>
			</div>
			<ProjectSelector 
				:projectList="projectList"
				:selectedProject="selectedProject" 
				@input="changeProject($event)"
				class="my-1" />
		</div>
		<span class="hidden md:inline mx-auto my-auto text-gray-dark-300 text-xl">Project Role: <span class="text-primary-600">{{ selectedProject.role }}</span></span>
	</div>
	<div class="w-full flex flex-col md:flex-row">
		<div class="md:w-1/2 bg-gray-light-100 rounded-lg shadow-md flex flex-col mt-2 p-1.5 mx-2.5 md:mr-1.5">
			<div class="flex">
				<input 
					v-model="newRole.name"
					class="flex-grow mr-1.5 bg-gray-light-100 border-b border-gray-dark-700 rounded-none"
					type="text"
					placeholder="New Role Name...">
				<button 
					@click="postProjectRole()"
					class="rounded-lg bg-primary-800 shadow-md text-gray-light-50 font-bold px-2.5 py-1">
					
					Create Role
				</button>
			</div>
			<span class="text-red-600">{{ createErrorMessage }}</span>
			<div 
				v-for="permission in permissions"
				:key="permission.permission"
				class="flex flex-col">
				<div class="flex mt-2 items-center">
					<span 
						@click="toggleNewRolePermission(permission.permission)"
						class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
						:class="[(newRole.permissions.includes(permission.permission)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
						<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
					</span>
					<span class="text-lg font-bold">{{ permission.title }}</span>
				</div>
				<p class="text-gray-dark-400">
					{{ permission.description }}
				</p>
			</div>
		</div>
		<div class="md:w-1/2 bg-gray-light-100 rounded-lg shadow-md flex flex-col mt-2 p-1.5 pt-0.5 mx-2.5 md:ml-1.5">
			<div>
				<span class="text-xs text-gray-dark-300">
					Select Role to Edit
				</span>
				<div class="w-full pb-2 flex overflow-x-auto">
					<span
						v-for="role in projectRoles"
						:key="role._id"
						class="pr-2 py-1 leading-none mr-1 cursor-pointer whitespace-nowrap"
						:class="[(editRole._id === role._id) ? 'font-bold text-primary-500': 'text-gray-dark-500']"
						@click="editRole = { name: role.name, _id: role._id, permissions: role.permissions }" >
						{{ role.name }}
					</span>
				</div>
			</div>
			<div class="flex">
				<input 
					v-model="editRole.name"
					class="flex-grow mr-1.5 bg-gray-light-100 border-b border-gray-dark-700 rounded-none"
					type="text"
					placeholder="New Role Name...">
				<button 
					@click="editProjectRole()"
					class="rounded-lg bg-primary-800 shadow-md text-gray-light-50 font-bold px-2.5 py-1">
					
					Update Role
				</button>
			</div>
			<span class="text-red-600">{{ updateErrorMessage }}</span>
			<div 
				v-for="permission in permissions"
				:key="permission.permission"
				class="flex flex-col">
				<div class="flex mt-2 items-center">
					<span 
						@click="toggleEditRolePermission(permission.permission)"
						class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
						:class="[(editRole.permissions.includes(permission.permission)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
						<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
					</span>
					<span class="text-lg font-bold">{{ permission.title }}</span>
				</div>
				<p class="text-gray-dark-400">
					{{ permission.description }}
				</p>
			</div>
			<button 
				@click="deleteProjectRole()"
				class="bg-red-700 rounded-lg mt-3 font-bold text-gray-light-50 text-xl">Delete Role</button>
		</div>
	</div>
	
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Joi from 'joi';
import ProjectSelector from '../components/ProjectSelector.vue';
import { postProjectRole, getRoles, editProjectRole, deleteProjectRole } from '../api/project';

export default Vue.extend({
	name: 'RolesManage',
	components: {
		ProjectSelector,
	},
	props: {
		jwt: {
			type: String,
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
			permissions: [
				{
					title: "Edit Project",
					description: "Modify a project's title and description",
					permission: "editProject"
				},
				{
					title: "Manage Project Roles",
					description: "Edit and create project roles",
					permission: "manageProjectRoles"
				},
				{
					title: "Manage Project Users",
					description: "Assign and modify users in project",
					permission: "manageProjectUsers"
				},
				{
					title: "Manage Tickets",
					description: "Assign or remove users from tickets",
					permission: "manageTickets"
				},
				{
					title: "Create Tickets",
					description: "Ability to create tickets",
					permission: "createTickets"
				},
				{
					title: "Edit Tickets",
					description: "Edit ticket information (severity, status, type)",
					permission: "editTickets"
				},
				{
					title: "Comment",
					description: "Add comments to tickets you're assigned",
					permission: "comment"
				},
				{
					title: "Statistics",
					description: "Gain access to the statistics API",
					permission: "statistics"
				}
			],
			newRole: {
				name: '',
				permissions: []
			},
			editRole: {
				name: '',
				_id: '',
				permissions: []
			},
			projectRoles: [],
			createErrorMessage: '',
			updateErrorMessage: '',
		}
	},
	async created() {
		this.projectRoles = await getRoles(this.selectedProject._id, this.jwt);
	},
	methods: {
		async changeProject(project: { _id: string; name: string; role: string}) {
			this.$emit('changeProject', project);
			this.projectRoles = await getRoles(project._id, this.jwt);
		},
		toggleNewRolePermission(permission: string) {
			const index = this.newRole.permissions.indexOf(permission)
			if (index >= 0) {
				this.newRole.permissions.splice(index, 1);
			} else {
				this.newRole.permissions.push(permission);
			}
		},
		toggleEditRolePermission(permission: string) {
			const index = this.editRole.permissions.indexOf(permission)
			if (index >= 0) {
				this.editRole.permissions.splice(index, 1);
			} else {
				this.editRole.permissions.push(permission);
			}
		},
		async postProjectRole() {
			const { error } = Joi.object({
				name: Joi
					.string()
					.required()
					.min(2)
					.messages({
						'string.empty': 'name is required',
						'string.min': 'name must be atleast 2 characters'
					}),
			}).validate({
				name: this.newRole.name
			});

			if (error) {
				this.createErrorMessage = error.details[0].message;
				return;
			} else {
				this.createErrorMessage = '';
			}

			await postProjectRole(
				this.selectedProject._id, 
				this.newRole.name, 
				this.newRole.permissions, 
				this.jwt);

			this.projectRoles = await getRoles(this.selectedProject._id, this.jwt);

			this.newRole = {
				name: '',
				permissions: []
			}
		},
		async editProjectRole() {
			const { error } = Joi.object({
				name: Joi
					.string()
					.required()
					.min(2)
					.messages({
						'string.empty': 'name is required',
						'string.min': 'name must be atleast 2 characters'
					}),
			}).validate({
				name: this.editRole.name
			});

			if (error) {
				this.updateErrorMessage = error.details[0].message;
				return;
			} else {
				this.updateErrorMessage = '';
			}

			await editProjectRole(
				this.selectedProject._id, 
				this.editRole._id, 
				this.editRole.name, 
				this.editRole.permissions, 
				this.jwt);

			this.projectRoles = await getRoles(this.selectedProject._id, this.jwt);

			this.editRole = {
				name: '',
				_id: '',
				permissions: []
			};
		},
		async deleteProjectRole() {
			await deleteProjectRole(this.selectedProject._id, this.editRole._id, this.jwt);

			this.projectRoles = await getRoles(this.selectedProject._id, this.jwt);

			this.editRole = {
				name: '',
				_id: '',
				permissions: []
			};
		}
	}
})
</script>