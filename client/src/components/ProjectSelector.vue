<template>
<div class="relative flex flex-col">
	<div @click="isOpen = !isOpen" class="cursor-pointer pr-12 relative bg-primary-800 text-gray-light-50 py-1 px-2 rounded-lg">
		<span class="text-2xl font-bold">
			{{ selectedProject.name }}
		</span>
		<svg :class="{ '-rotate-90': isOpen }" class="absolute top-0 right-0 w-10 h-10 fill-current transform rotate-90 transition-transform duration-500" viewBox="0 0 24 24"><path d="M6.5 17.5l8.25-5.5L6.5 6.5l1-1.5L18 12L7.5 19z"></path></svg>
	</div>
	<div
		class="absolute top-11 w-full max-h-0 opacity-0 bg-primary-800 text-gray-light-50 transition-all duration-500 overflow-hidden rounded-lg"
		:class="{ 'max-h-screen opacity-100': isOpen }" >
		<div 
			v-for="project in projectList"
			:key="project._id"
			:id="project._id"
			class="py-1 px-2 cursor-pointer border-b last:borderb-0 border-primary-600"
			@click="selectProject(project)" >

			<input type="radio" :id="project._id" class="hidden">
			<label :for="project._id" class="cursor-pointer text-xl">{{ project.name }}</label>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
	name: "SelectorInput",
	props: {
		projectList: {
			type: Array as PropType<Array<{
				_id: '';
				name: '';
				role: '';
				permissions: string[];
			}>>,
			required: true,
		},
		selectedProject: {
			type: Object as PropType<{
				_id: '';
				name: '';
				role: '';
				permissions: string[];
			}>,
			required: true,
		}
	},
	data() {
		return {
			isOpen: false,
		}
	},
	methods: {
		selectProject(project: {_id: string; name: string; role: string; permissions: Array<string>}) {
			this.isOpen = false;
			this.$emit('input', project);
		}
	}
})
</script>