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
	<div class="flex justify-evenly lg:justify-start my-2 lg:mx-2">
		<div class="flex lg:flex-col lg:w-1/3 lg:mr-1">
			<span 
				class="status-btn lg:mr-auto" 
				:class="[(this.selectedTicketStatus === 'open' || isDesktop) ? 'bg-blue-500': 'bg-gray-dark-100']"
				@click="changeTicketFilter('open')">
				Open
			</span>
			<div v-if="isDesktop && openTickets" class="mt-2">
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
			<div v-if="isDesktop && inProgressTickets" class="mt-2">
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
			<div v-if="isDesktop && needInfoTickets" class="mt-2">
				<TicketItem 
					v-for="ticket in needInfoTickets" 
					:key="ticket._id" 
					:ticket="ticket" 
					class="mb-2" />
			</div>
		</div>
	</div>
	<div v-if="!isDesktop && selectedTickets">
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
import { getTickets } from '../api/ticket';

export default Vue.extend({
	name: 'Dashboard',
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
			selectedTicketStatus: 'open',
			tickets: [],
			openTickets: [],
			inProgressTickets: [],
			needInfoTickets: [],
			selectedTickets: [],
		}
	},
	async created() {
		this.tickets = await getTickets(this.selectedProject._id, this.jwt);
		this.openTickets = this.filterTicketsStatus('open');
		this.inProgressTickets = this.filterTicketsStatus('in progress');
		this.needInfoTickets = this.filterTicketsStatus('need info');
		this.selectedTickets = this.openTickets;
	},
	mounted() {
		window.onresize = () => {
			this.isDesktop = window.innerWidth >= 1024 ? true: false;
		}
	},
	watch: {
		selectedProject: async function() {
			this.tickets = await getTickets(this.selectedProject._id, this.jwt);
			this.openTickets = this.filterTicketsStatus('open');
			this.inProgressTickets = this.filterTicketsStatus('in progress');
			this.needInfoTickets = this.filterTicketsStatus('need info');
			this.changeTicketFilter(this.selectedTicketStatus);
		}
	},
	methods: {
		async changeProject(project: { _id: string; name: string; role: string}) {
			this.$emit('changeProject', project);
			this.tickets = await getTickets(project._id, this.jwt);
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
			return this.tickets.filter(
				(ticket: {
					status: string;
				}) => ticket.status.toLowerCase() === status
			);
		}
	}
});
</script>

<style lang="postcss" scoped>
.status-btn {
	@apply rounded-xl text-gray-light-50 py-1 px-2 shadow-md cursor-pointer lg:cursor-default transition-colors duration-300;
}
</style>