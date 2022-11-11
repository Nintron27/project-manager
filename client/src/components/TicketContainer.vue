<template>
<div class="rounded-lg">	
	<div class="rounded-t-lg bg-primary-400">
		<slot name="header"></slot>
	</div>
	<div class="rounded-b-lg bg-gray-dark-400 p-1">
		<slot name="body"></slot>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	name: "TicketContainer",
})
</script>