import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'Dashboard',
		component: () => import('../views/Dashboard.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('../views/Login.vue'),
		meta: {
			guest: true,
		},
	},
	{
		path: '/register',
		name: 'Register',
		component: () => import('../views/Register.vue'),
		meta: {
			guest: true,
		},
	},
	{
		path: '/demo-login',
		name: 'DemoLogin',
		component: () => import('../views/DemoLogin.vue'),
		meta: {
			guest: true,
		},
	},
	{
		path: '/logout',
		name: 'Logout',
		component: () => import('../views/Logout.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/manage-tickets',
		name: 'TicketsManage',
		component: () => import('../views/TicketsManage.vue'),
		meta: {
			requiresAuth: true,
			requiredView: 'TicketsManage',
		},
	},
	{
		path: '/manage-roles',
		name: 'RolesManage',
		component: () => import('../views/RolesManage.vue'),
		meta: {
			requiresAuth: true,
			requiredView: 'RolesManage',
		},
	},
	{
		path: '/manage-projects',
		name: 'ProjectsManage',
		component: () => import('../views/ProjectsManage.vue'),
		meta: {
			requiresAuth: true,
			requiredView: 'ProjectsManage',
		},
	},
	{
		path: '/usertickets',
		name: 'UserTickets',
		component: () => import('../views/UserTickets.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/ticket',
		name: 'Ticket',
		component: () => import('../views/Ticket.vue'),
		meta: {
			requiresAuth: true,
		},
	}
];

const router = new VueRouter({
	mode: 'history',
	routes,
});

router.beforeEach((to, from, next) => {
	const views = sessionStorage.getItem('views');
	const isAdmin = sessionStorage.getItem('isAdmin');

	if (to.meta.requiresAuth) {
		if (isAdmin !== null) {
			if (to.meta.requiredView) {
				if (views.includes(to.meta.requiredView)) {
					next();
				} else {
					next('/');
				}
			} else {
				next();
			}
		} else {
			next('/login');
		}
	} else if (to.meta.guest) {
		if (isAdmin === null) {
			next();
		} else {
			next('/');
		}
	} else {
		next();
	}
});

export default router;
