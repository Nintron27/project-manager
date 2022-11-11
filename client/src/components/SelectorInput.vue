<template>
<div class="relative flex flex-col">
	<div
		class="z-10 absolute top-9 w-full max-h-0 opacity-0 order-1 bg-primary-800 text-gray-light-50 rounded-lg transition-all duration-500 overflow-hidden border border-gray-dark-500"
		:class="{ 'max-h-screen opacity-100': isOpen }" >

		<div 
			v-for="option in options"
			:key="option"
			:id="option"
			class="py-1 px-2 cursor-pointer"
			@click="selectValue(option)" >

			<input type="radio" :id="option" class="hidden">
			<label :for="option" class="cursor-pointer">{{ option }}</label>
		</div>
	</div>
	<div @click="isOpen = !isOpen" class="cursor-pointer relative bg-primary-800 text-gray-light-50 py-1 px-2 rounded-lg">
		<span v-if="selectedValue">
			{{ selectedValue }}
		</span>
		<span v-else>
			select {{ name }}
		</span>
		<svg :class="{ '-rotate-90': isOpen }" class="absolute top-0 right-0 w-8 h-8 text-gray-light-50 fill-current transform rotate-90 transition-transform duration-500" viewBox="0 0 24 24"><path d="M6.5 17.5l8.25-5.5L6.5 6.5l1-1.5L18 12L7.5 19z"></path></svg>
	</div>
</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
	name: "SelectorInput",
	props: {
		name: {
			type: String,
			required: true,
		},
		options: {
			type: Array as PropType<Array<string>>,
			required: true,
		},
		startingValue: {
			type: String,
			required: false,
		}
	},
	data() {
		return {
			isOpen: false,
			selectedValue: '',
		}
	},
	created() {
		if (this.startingValue) {
			this.selectedValue = this.startingValue;
		}
	},
	methods: {
		selectValue(value: string) {
			this.isOpen = false;
			this.selectedValue = value;
			this.$emit('input', value);
		}
	}
})
</script>