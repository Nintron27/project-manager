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
	<div class="xl:mt-3 rounded-lg bg-gray-light-100 shadow-md mr-2 ml-auto p-1 flex">
		<input class="flex-grow mr-1.5 bg-gray-light-100 border-b border-gray-dark-700 rounded-none" v-model="query" type="text" placeholder="Query...">
		<button @click="filterTickets()" class="font-bold bg-primary-800 text-gray-light-50 py-1 px-2 rounded-lg">Search</button>
	</div>
	
	<div class="flex justify-evenly lg:justify-start my-2 lg:mx-2">
		<div class="flex lg:flex-col lg:w-1/3 lg:mr-1">
			<span 
				class="status-btn lg:mr-auto" 
				:class="[(this.selectedTicketStatus === 'unassigned' || isDesktop) ? 'bg-blue-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('unassigned')">
				Unassigned
			</span>
			<div v-if="isDesktop" class="mt-2">
				<TicketItem 
					v-for="ticket in filteredUnassignedTickets" 
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
				:class="[(this.selectedTicketStatus === 'closed' || isDesktop) ? 'bg-orange-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('closed')">
				Closed
			</span>
			<div v-if="isDesktop" class="mt-2">
				<TicketItem 
					v-for="ticket in closedTickets" 
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
import TicketItem from '../components/TicketItem.vue';
import ProjectSelector from '../components/ProjectSelector.vue';
import { getTickets, getUnassignedTickets } from '../api/ticket';

export default Vue.extend({
	name: 'UserTickets',
	components: {
		ProjectSelector,
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
			isDesktop: window.innerWidth >= 1024 ? true: false,
			selectedTicketStatus: 'unassigned',
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
			unassignedTickets: null,
			filteredUnassignedTickets: null,
			closedTickets: null,
			inProgressTickets: null,
			selectedTickets: null,
		}
	},
	async created() {
		this.tickets = await getTickets(this.selectedProject._id, this.jwt);
		this.filteredTickets = this.tickets;
		this.unassignedTickets = await getUnassignedTickets(this.selectedProject._id,  this.jwt);
		this.filteredUnassignedTickets = this.unassignedTickets;
		this.inProgressTickets = this.filterTicketsStatus('in progress');
		this.closedTickets = this.filterTicketsStatus('closed');
		this.selectedTickets = this.unassignedTickets;
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
			this.tickets = await getTickets(this.selectedProject._id, this.jwt);
			this.filteredTickets = this.tickets;
			this.unassignedTickets = await getUnassignedTickets(this.selectedProject._id,  this.jwt);
			this.filteredUnassignedTickets = this.unassignedTickets;
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.closedTickets = this.filterTicketsStatus('closed');
			this.changeTicketFilter(this.selectedTicketStatus);
		}
	},
	methods: {
		async changeProject(project: { _id: string; name: string; role: string}) {
			this.$emit('changeProject', project);
			this.tickets = await getTickets(project._id, this.jwt);
			this.filteredTickets = this.tickets;
			this.unassignedTickets = await getUnassignedTickets(project._id,  this.jwt);
			this.filteredUnassignedTickets = this.unassignedTickets;
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.closedTickets = this.filterTicketsStatus('closed');
			this.changeTicketFilter(this.selectedTicketStatus);
		},
		changeTicketFilter(status: string) {
			this.selectedTicketStatus = status;
			if (status === 'closed') {
				this.selectedTickets = this.closedTickets;
			} else if (status === 'in progress') {
				this.selectedTickets = this.inProgressTickets;
			} else {
				this.selectedTickets = this.filteredUnassignedTickets;
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
				this.filteredUnassignedTickets = this.unassignedTickets;
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
				this.filteredUnassignedTickets = this.unassignedTickets.filter(
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
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.closedTickets = this.filterTicketsStatus('closed');
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