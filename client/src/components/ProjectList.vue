<template>
<div class="py-2 flex flex-col">
	<h2 class="pl-2 pb-2 font-bold text-xl text-gray-dark-400">
		Select Project
	</h2>
	<div class="w-full pl-2 flex items-center overflow-x-auto text-xl text-gray-dark-400 whitespace-nowrap ">
		<span 
			v-for="project in projects" 
			:key="project._id" 
			class="py-0.5 px-2 cursor-pointer"
			:class="{ 'bg-gray-light-300 text-gray-dark-400 font-bold': (project.name === selectedProject) }"
			@click="$emit('changeProject', project)" >
			{{ project.name }}
		</span>
	</div>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
	name: "ProjectList",
	props: {
		projects: {
			type: Array as PropType<Array<{
				_id: '';
				name: '';
			}>>,
			required: true,
		},
		selectedProject: {
			type: String,
			required: true,
		},
	}
})
</script>