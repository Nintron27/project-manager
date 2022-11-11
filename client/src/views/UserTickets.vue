<template>
<div class="w-full flex flex-col">
	<div 
		v-if="isPostTicketActive"
		class="fixed z-20 xl:-ml-60 top-0 bg-gray-dark-900 bg-opacity-25 w-screen h-screen flex">
		
		<div 
			class="sm:mx-auto sm:my-auto w-screen sm:w-96 h-screen sm:h-auto bg-gray-light-100 flex flex-col px-2 sm:rounded-2xl" >

			<svg @click="isPostTicketActive = false" class="sm:hidden h-10 w-10 ml-auto mt-2 text-gray-dark-600 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
			<div class="mt-10 sm:mt-2 flex items-center">
				<h2 class="text-gray-dark-600 text-xl font-bold">Post New Ticket</h2>
				<svg @click="isPostTicketActive = false" class="hidden sm:inline-block h-10 w-10 ml-auto text-gray-dark-600 fill-current cursor-pointer" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
			</div>
			<span class="text-red-600">{{ errorMessage }}</span>
			<div class="mt-2 flex">
				<input 
					type="text"
					v-model="ticket.title"
					placeholder="Title..."
					class="rounded-lg bg-gray-light-300 h-9 pl-1 flex-grow">
				<input 
					type="file"
					accept=".png, .jpg, .jpeg, .gif"
					@change="onFileSelected"
					ref="fileInput"
					class="hidden">
				<button @click="triggerImageInput()" class="px-2 py-1 bg-primary-800 text-gray-light-50 rounded-lg ml-2">{{ attachFileLabel }}</button>
			</div>
			<div class="flex mt-2">
				<SelectorInput 
					v-model="ticket.type"
					:name="'type'" 
					:options="typeOptions"
					class="w-1/2 mr-1" />
				<SelectorInput 
					v-model="ticket.severity"
					:name="'severity'" 
					:options="severityOptions"
					class="w-1/2 ml-1" />
			</div>
			<textarea v-model="ticket.description" class="bg-gray-light-300 mt-2 resize-none h-20 pl-1 rounded-lg" placeholder="Description..."></textarea>
			<button
				@click="submitTicket()"
				class="mt-2 bg-primary-800 px-2 py-1 rounded-lg text-gray-light-50 mb-2" >Post Ticket to {{ selectedProject.name }}</button>
		</div>
	</div>
	
	<div 
		v-if="projectList.length > 0"
		class="xl:hidden md:flex py-1.5 px-2.5 border-b border-gray-light-300">
		<div class="flex flex-col md:w-1/2">
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
			v-if="selectedProject.permissions.includes('createTickets')"
			@click="isPostTicketActive = true" 
			class="hidden md:inline-block bg-gray-light-100 my-auto mx-auto py-0.5 md:py-1 px-1.5 md:px-2.5 rounded-lg text-xl md:text-2xl text-primary-800">
				Post Ticket
		</button>
	</div>
	<div class="xl:flex xl:mt-3 xl:mb-2">
		<button 
			v-if="selectedProject.permissions.includes('createTickets')"
			@click="isPostTicketActive = true" 
			class="md:hidden xl:inline-block bg-gray-light-100 py-0.5 xl:py-1 px-1.5 xl:px-2.5 rounded-lg text-xl xl:text-2xl ml-2 mb-2 xl:mb-0 text-primary-800">
				Post Ticket
		</button>
		<div class="rounded-lg bg-gray-light-100 shadow-md mx-2 xl:ml-auto p-1 flex">
			<input class="flex-grow mr-1.5 bg-gray-light-100 border-b border-gray-dark-700 rounded-none" v-model="query" type="text" placeholder="Query...">
			<button @click="filterTickets()" class="font-bold bg-primary-800 text-gray-light-50 py-1 px-2 rounded-lg">Search</button>
		</div>
	</div>
	
	<div class="flex justify-evenly lg:justify-start my-2 lg:mx-2">
		<div class="flex lg:flex-col lg:w-1/3 lg:mr-1">
			<span 
				class="status-btn lg:mr-auto" 
				:class="[(this.selectedTicketStatus === 'open' || isDesktop) ? 'bg-blue-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('open')">
				Open
			</span>
			<div v-if="isDesktop" class="mt-2">
				<TicketItem 
					v-for="ticket in openTickets" 
					:key="ticket._id" 
					:ticket="ticket" 
					class="mb-2" />
			</div>
		</div>
		<div class="flex lg:flex-col lg:w-1/3 lg:mx-1">
			<span 
				class="status-btn lg:mr-auto" 
				:class="[(this.selectedTicketStatus === 'in progress' || isDesktop) ? 'bg-green-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('in progress')">
				In Progress
			</span>
			<div v-if="isDesktop" class="mt-2">
				<TicketItem 
					v-for="ticket in inProgressTickets" 
					:key="ticket._id" 
					:ticket="ticket" 
					class="mb-2" />
			</div>
		</div>
		<div class="flex lg:flex-col lg:w-1/3 lg:ml-1">
			<span 
				class="status-btn lg:mr-auto" 
				:class="[(this.selectedTicketStatus === 'need info' || isDesktop) ? 'bg-orange-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('need info')">
				Need Info
			</span>
			<div v-if="isDesktop" class="mt-2">
				<TicketItem 
					v-for="ticket in needInfoTickets" 
					:key="ticket._id" 
					:ticket="ticket" 
					class="mb-2" />
			</div>
		</div>
	</div>
	<div v-if="!isDesktop">
		<TicketItem 
			v-for="ticket in selectedTickets" 
			:key="ticket._id" 
			:ticket="ticket" 
			class="mx-2 mb-2" />
	</div>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Joi from 'joi';
import TicketItem from '../components/TicketItem.vue';
import ProjectSelector from '../components/ProjectSelector.vue';
import SelectorInput from '../components/SelectorInput.vue';
import { getAssignedTickets, postTicket, attachImageToTicket } from '../api/ticket';

export default Vue.extend({
	name: 'UserTickets',
	components: {
		ProjectSelector,
		SelectorInput,
		TicketItem,
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
				permissions: string[];
			}>,
		},
		projectList: {
			type: Array as PropType<Array<{
				_id: '';
				name: '';
				role: '';
				permissions: string[];
			}>>,
			required: true,
		},
	},
	data() {
		return {
			isDesktop: window.innerWidth >= 1024 ? true: false,
			selectedTicketStatus: 'open',
			isPostTicketActive: false,
			query: '',
			typeOptions: [
				'suggestion',
				'bug',
			],
			severityOptions: [
				'low',
				'medium',
				'high',
				'critical',
			],
			ticket: {
				title: '',
				type: '',
				severity: '',
				description: ''
			},
			FILE: null,
			tickets: null,
			filteredTickets: null,
			openTickets: null,
			inProgressTickets: null,
			needInfoTickets: null,
			selectedTickets: null,
			errorMessage: '',
		}
	},
	async created() {
		if (this.selectedProject.permissions.includes('editTickets')) {
			this.tickets = await getAssignedTickets(this.selectedProject._id, this.jwt);
			this.filteredTickets = this.tickets;
			this.openTickets = this.filterTicketsStatus('open');
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.needInfoTickets = this.filterTicketsStatus('need info');
			this.selectedTickets = this.openTickets;
		}
	},
	mounted() {
		window.onresize = () => {
			this.isDesktop = window.innerWidth >= 1024 ? true: false;
		}
	},
	computed	: {
		attachFileLabel(): string {
			if (this.FILE?.name) {
				return this.FILE.name.substr(0, 10) + '...';
			} else {
				return "Attach Image"
			}
		}
	},
	watch: {
		selectedProject: async function() {
			this.tickets = await getAssignedTickets(this.selectedProject._id, this.jwt);
			this.filteredTickets = this.tickets;
			this.openTickets = this.filterTicketsStatus('open');
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.needInfoTickets = this.filterTicketsStatus('need info');
			this.changeTicketFilter(this.selectedTicketStatus);
		}
	},
	methods: {
		triggerImageInput() {
			// This code was to remove the Vetur error about .click()
			// not existing on fileInput
			// eslint-disable-next-line
			const fileInput = this.$refs.fileInput as any;
			fileInput.click();
		},
		// eslint-disable-next-line
		onFileSelected(event: any) {
			this.FILE = event.target.files[0];
		},
		async submitTicket() {
			const { error } = Joi.object({
				title: Joi
					.string()
					.required()
					.messages({
						'string.empty': 'title is required'
					}),
				description: Joi
					.string()
					.required()
					.messages({
						'string.empty': 'description is required'
					})
			}).validate({
				title: this.ticket.title,
				description: this.ticket.description,
			});

			if (error) {
				this.errorMessage = error.details[0].message;
				return;
			} else {
				this.errorMessage = '';
			}
			
			try {
				const ticketID = await postTicket(
				{
					project: this.selectedProject._id,
					title: this.ticket.title,
					type: this.ticket.type,
					severity: this.ticket.severity,
					description: this.ticket.description,
				}, 
				this.jwt);

				if (this.FILE && ticketID.length === 24) {
					const formData = new FormData();
					formData.append('ticketImg', this.FILE, this.FILE.name);
					await attachImageToTicket(this.selectedProject._id, ticketID, formData, this.jwt);
					this.FILE = null;
				}
			} catch (error) {
				this.errorMessage = error.response.data.toLowerCase();
				return;
			}
			
			this.isPostTicketActive = false;
			this.ticket = {
				title: '',
				type: '',
				severity: '',
				description: ''
			};
		},
		async changeProject(project: { _id: string; name: string; role: string}) {
			this.$emit('changeProject', project);
			this.tickets = await getAssignedTickets(project._id, this.jwt);
			this.filteredTickets = this.tickets;
			this.openTickets = this.filterTicketsStatus('open');
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.needInfoTickets = this.filterTicketsStatus('need info');
			this.changeTicketFilter(this.selectedTicketStatus);
		},
		changeTicketFilter(status: string) {
			this.selectedTicketStatus = status;
			if (status === 'open') {
				this.selectedTickets = this.openTickets;
			} else if (status === 'in progress') {
				this.selectedTickets = this.inProgressTickets;
			} else {
				this.selectedTickets = this.needInfoTickets;
			}
		},
		filterTicketsStatus(status: string) {
			return this.filteredTickets.filter(
				(ticket: {
					status: string;
				}) => ticket.status.toLowerCase() === status
			);
		},
		filterTickets() {
			if (!this.query) {
				this.filteredTickets = this.tickets;
			} else {
				this.filteredTickets = this.tickets.filter(
					(ticket: {
						title: string;
						description: string;
						severity: string;
						type: string;
					})  => ticket.title.toLowerCase().includes(this.query.toLowerCase()) ||
								ticket.description.toLowerCase().includes(this.query.toLowerCase()) ||
								ticket.severity.toLowerCase().includes(this.query.toLowerCase()) ||
								ticket.type.toLowerCase().includes(this.query.toLowerCase())
							
				);
			}
			this.openTickets = this.filterTicketsStatus('open');
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.needInfoTickets = this.filterTicketsStatus('need info');
			this.changeTicketFilter(this.selectedTicketStatus);
		}
	}
});
</script>

<style lang="postcss" scoped>
.status-btn {
	@apply rounded-xl text-gray-light-50 py-1 px-2 shadow-md cursor-pointer lg:cursor-default transition-colors duration-300;
}
</style>