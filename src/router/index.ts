import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

// Strony
import LoginPage from '../pages/auth/LoginPage.vue';
import TeacherDashboard from '../pages/teacher/TeacherDashboard.vue';
import StudentDashboard from '../pages/student/StudentDashboard.vue';
import TeacherSessionDetails from '@/pages/teacher/TeacherSessionDetails.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
    },
    {
        path: '/teacher',
        name: 'TeacherDashboard',
        component: TeacherDashboard,
        meta: { requiresAuth: true, role: 'teacher' },
    },
    {
        path: '/student',
        name: 'StudentDashboard',
        component: StudentDashboard,
        meta: { requiresAuth: true, role: 'student' },
    },
    {
        path: "/teacher/session/:id",
        name: "TeacherSessionDetails",
        component: TeacherSessionDetails
    },
    {
        path: '/teacher/attendance-qr',
        name: 'TeacherAttendanceQR',
        component: () => import('@/pages/teacher/TeacherAttendaceQR.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Guard - sprawdza, czy użytkownik jest zalogowany
router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        const token = localStorage.getItem('jwt_token');
        const userRole = localStorage.getItem('user_role'); // zapisujemy rolę przy logowaniu

        if (to.meta.requiresAuth) {
            if (!token) return next('/login');
            if (to.meta.role && to.meta.role !== userRole) return next('/login');
        }

        next();
    }
);

export default router;