<template>
<div class="w-full flex flex-col">
	<div v-if="ticket" class="w-full flex flex-col md:flex-row mt-2">
		<div class="md:w-1/2 flex flex-col mx-2.5 md:mr-1.5">
			<div class="bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<div>
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
				</div>
				<h1 class="text-lg">{{ ticket.title }}</h1>
				<span class="text-sm text-gray-dark-300">{{ ticket.createdBy }} / {{ dateFormatted }}</span>
				<p>{{ ticket.description }}</p>
				<a 
					v-if="ticket.attachment" :href="'/uploads/' + ticket.attachment"
					class="mt-2">
					<img class="max-h-80 rounded-lg" v-if="ticket.attachment" :src="'/uploads/' + ticket.attachment" alt="image attached to ticket">
				</a>
			</div>
			<div class="mt-2 bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<h2 class="text-xl lg:text-2xl text-gray-dark-600 font-bold">Ticket Comments</h2>
				<span class="text-red-600">{{ errorMessage }}</span>
				<textarea 
					v-if="selectedProject.permissions.includes('comment')"
					v-model="comment" 
					class="pl-1.5 mt-2 bg-gray-light-300 h-24 rounded-lg text-gray-dark-600 resize-none">
				</textarea>
				<button 
					v-if="selectedProject.permissions.includes('comment')"
					@click="postComment()" 
					class="text-gray-light-100 bg-primary-800 mr-auto px-2 py-1 rounded-lg my-2">
						Post Comment
				</button>
				<div v-for="comment in ticket.comments"
					:key="comment.dateCreated"
					class="pb-2 border-b last:border-b-0 border-gray-light-300">

					<span class="text-xs text-gray-dark-200">
						{{ comment.createdBy }} / {{ timeAgo(comment.dateCreated) }}
					</span>
					<p>{{ comment.text }}</p>
				</div>
			</div>
			<div class="my-2 bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<h2 class="text-xl lg:text-2xl text-gray-dark-600 font-bold">Ticket History</h2>
				<div 
					v-for="record in ticket.history"
					:key="record.dateChanged"
					class="mt-2 flex flex-col border-b border-gray-light-300 last:border-b-0" >

					<span class="text-sm text-gray-dark-500">
						{{ record.changedBy }} / {{ timeAgo(record.dateChanged) }}
					</span>
					<div 
						v-for="change in record.changes"
						:key="change.propertyChanged"
						class="flex justify-evenly p-0.5 text-gray-dark-400 mt-1" >
						
						<div class="flex flex-col items-center">
							<span class="text-gray-dark-300">
								Property
							</span>
							<span class="font-bold">
								{{ change.propertyChanged }}
							</span>
						</div>
						<div class="flex flex-col items-center">
							<span class="text-gray-dark-300">
								Old Value
							</span>
							<span class="font-bold">
								{{ change.oldValue }}
							</span>
						</div>
						<div class="flex flex-col items-center">
							<span class="text-gray-dark-300">
								New Value
							</span>
							<span class="font-bold">
								{{ change.newValue }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="md:w-1/2 flex flex-col mx-2.5 md:ml-1.5">
			<div 
				v-if="selectedProject.permissions.includes('editTickets')"
				class="mt-2 md:mt-0 bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<h2 class="text-xl lg:text-2xl text-gray-dark-600 font-bold">Edit Ticket</h2>
				<div class="w-full flex">
					<div class="w-1/2 mr-1">
						<span class="text-sm text-gray-dark-200">Ticket Severity</span>
						<SelectorInput 
							v-model="severity"
							:name="'severity'" 
							:options="severityOptions"
							:startingValue="ticket.severity"
							class="mr-1" />
					</div>
					<div class="w-1/2 ml-1">
						<span class="text-sm text-gray-dark-200">Ticket Status</span>
						<SelectorInput 
							v-model="status"
							:name="'status'" 
							:options="statusOptions"
							:startingValue="ticket.status"
							class="mr-1" />
					</div>
				</div>
				<div class="w-1/2 mt-2">
					<span class="text-sm text-gray-dark-200">Ticket Type</span>
					<SelectorInput 
						v-model="type"
						:name="'type'" 
						:options="typeOptions"
						:startingValue="ticket.type"
						class="mr-1" />
				</div>
				<button 
					@click="updateTicket()"
					class="text-lg font-bold text-gray-light-100 bg-primary-800 rounded-lg mr-auto mt-2 px-2.5 py-0.5">
						Update Ticket
				</button>
			</div>
			<div 
				v-if="selectedProject.permissions.includes('manageTickets')"
				class="mt-2 bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<h2 class="text-xl lg:text-2xl text-gray-dark-600 font-bold">Assign Users to Ticket</h2>
				<span class="mt-2 text-sm text-gray-dark-200">Select One or More Users</span>
				<div 
					v-for="user in eligibleUsers"
					:key="user._id"
					class="flex flex-col">
					<div class="flex mt-2 items-center">
						<span 
							@click="toggleUnassignedUser(user._id)"
							class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
							:class="[(assigningUsers.includes(user._id)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
							<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
						</span>
						<span class="text-lg font-bold">{{ user.name }}</span>
					</div>
				</div>
				<button 
					@click="assignUsers()"
					class="text-lg font-bold text-gray-light-100 bg-primary-800 rounded-lg mr-auto mt-2 px-2.5 py-0.5">
						Assign to Ticket
				</button>
			</div>
			<div 
				v-if="selectedProject.permissions.includes('manageTickets')"
				class="mt-2 bg-gray-light-100 rounded-lg shadow-md flex flex-col p-1.5">
				<h2 class="text-xl lg:text-2xl text-gray-dark-600 font-bold">Remove Users from Ticket</h2>
				<span class="mt-2 text-sm text-gray-dark-200">Select One or More Users</span>
				<div 
					v-for="user in ticket.usersAssigned"
					:key="user._id"
					class="flex flex-col">
					<div class="flex mt-2 items-center">
						<span 
							@click="toggleAssignedUser(user._id)"
							class="mr-1.5 h-6 flex w-10 p-1 rounded-xl cursor-pointer"
							:class="[(unassigningUsers.includes(user._id)) ? 'bg-primary-600 justify-end': 'bg-gray-dark-600']" >
							<span class="h-full w-1/2 rounded-full bg-gray-light-100"></span>
						</span>
						<span class="text-lg font-bold">{{ user.name }}</span>
					</div>
				</div>
				<button 
					@click="unassignUsers()"
					class="text-lg font-bold text-gray-light-100 bg-red-700 rounded-lg mr-auto mt-2 px-2.5 py-0.5">
						Remove from Ticket
				</button>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Joi from 'joi';
import SelectorInput from '../components/SelectorInput.vue';
import { getTicket, 
	postComment, 
	editTicket, 
	removeUserFromTicket, 
	getEligibleUsers, 
	assignUserToTicket } from '../api/ticket';
import { timeAgo } from '../tools/formattedDate';

export default Vue.extend({
	name: "Ticket",
	components: {
		SelectorInput
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
	},
	data() {
		return {
			timeAgo,
			ticketID: '',
			ticket: null,
			comment: '',
			isHistoryOpen: false,
			status: '',
			severity: '',
			type: '',
			statusOptions: [
				'in progress',
				'need info',
				'closed'
			],
			severityOptions: [
				'low',
				'medium',
				'high',
				'critical',
			],
			typeOptions: [
				'bug',
				'suggestion'
			],
			lastPosted: {
				severity: '',
				status: '',
				type: '',
			},
			eligibleUsers: [],
			assigningUsers: [],
			unassigningUsers: [],
			errorMessage: '',
		}
	},
	async created() {
		if (typeof this.$route.query.id === 'string') {
			this.ticketID = this.$route.query.id;
			this.ticket = await getTicket(this.$route.query.id, this.jwt);
			this.severity = this.ticket.severity;
			this.status = this.ticket.status;
			this.type = this.ticket.type;
			this.eligibleUsers = await getEligibleUsers(this.selectedProject._id, this.ticketID, this.jwt);
		}
		this.lastPosted = {
			severity: this.ticket.severity,
			status: this.ticket.status,
			type: this.ticket.type,
		};
	},
	computed: {
		dateFormatted(): string {
			return timeAgo(this.ticket.dateCreated);
		},
	},
	methods: {
		async postComment() {
			const { error } = Joi.object({
				text: Joi
					.string()
					.required()
					.messages({
						'string.empty': 'comment is required',
					}),
			}).validate({
				text: this.comment,
			});

			if (error) {
				this.errorMessage = error.details[0].message;
				return;
			} else {
				this.errorMessage = '';
			}

			await postComment(this.selectedProject._id, this.comment, this.ticketID, this.jwt);
			this.comment = '';
			this.ticket = await getTicket(this.ticketID, this.jwt);
		},
		async updateTicket() {
			let severity;
			let status;
			let type;
			if (this.severity !== this.lastPosted.severity) {
				this.lastPosted.severity = this.severity;
				severity = this.severity;
			}
			if (this.status !== this.lastPosted.status) {
				this.lastPosted.status = this.status;
				status = this.status;
			}
			if (this.type !== this.lastPosted.type) {
				this.lastPosted.type = this.type;
				type = this.type;
			}

			try {
				await editTicket(this.selectedProject._id, status, severity, type, this.ticketID, this.jwt);
				this.ticket = await getTicket(this.ticketID, this.jwt);
			} catch (error) {
				console.log(error.response);
			}
			
		},
		toggleUnassignedUser(userID: string) {
			const index = this.assigningUsers.indexOf(userID)
			if (index >= 0) {
				this.assigningUsers.splice(index, 1);
			} else {
				this.assigningUsers.push(userID);
			}
		},
		async assignUsers() {
			for (const user of this.assigningUsers) {
				await assignUserToTicket(this.selectedProject._id, this.ticketID, user, this.jwt);
				for (let i = 0; i < this.eligibleUsers.length; i++) {
					if (this.eligibleUsers[i]._id === user) {
						this.eligibleUsers.splice(i, 1);
					}
				}
			}
			this.assigningUsers = [];
			this.ticket = await getTicket(this.ticketID, this.jwt);
		},
		toggleAssignedUser(userID: string) {
			const index = this.unassigningUsers.indexOf(userID)
			if (index >= 0) {
				this.unassigningUsers.splice(index, 1);
			} else {
				this.unassigningUsers.push(userID);
			}
		},
		async unassignUsers() {
			for (const user of this.unassigningUsers) {
				await removeUserFromTicket(this.selectedProject._id, this.ticketID, user, this.jwt);
			}
			this.unassigningUsers = [];
			this.ticket = await getTicket(this.ticketID, this.jwt);
			this.eligibleUsers = await getEligibleUsers(this.selectedProject._id, this.ticketID, this.jwt);
		},
	}
})
</script>