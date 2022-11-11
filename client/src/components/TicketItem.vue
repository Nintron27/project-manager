<template>
<router-link 
	class="p-1 flex flex-wrap rounded-lg shadow-md bg-gray-light-50" 
	:to="{path:'/ticket', query:{id: ticket._id}}">
	
	<span class="text-gray-dark-600 w-full">{{ ticket.description }}</span>
	<div class="mt-1 flex w-full items-center">
		<span 
			class="mr-1 py-0.5 px-1.5 rounded-lg text-sm text-gray-light-50"
			:class="[(ticket.type === 'bug') ? 'bg-red-600': 'bg-blue-500']" >
			{{ ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) }}
		</span>
		<span 
			class="py-0.5 px-1.5 rounded-lg text-sm text-gray-light-50"
			:class="[{'bg-green-500': (ticket.severity  === 'low')}, 
						{'bg-orange-500': (ticket.severity  === 'medium')}, 
						{'bg-red-600': (ticket.severity  === 'high')}, 
						{'bg-red-700': (ticket.severity  === 'critical')},]" >
			{{ ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1) }}
		</span>
		<span class="mr-1 ml-auto text-gray-dark-300 text-xs">{{ dateFormatted }}</span>
	</div>
</router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { timeAgo } from '../tools/formattedDate';

export default Vue.extend({
	name: "TicketItem",
	props: {
		ticket: {
			type: Object,
			required: true,
		}
	},
	data() {
		return {
			timeAgo,
		}
	},
	computed: {
		dateFormatted(): string {
			return this.timeAgo(this.ticket.dateCreated);
		},
	},
})
</script>