import { defineStore } from "pinia";
import { ref } from "vue";
import { AttendMeBackendClient } from "../api/AttendMeBackendClient";
import type { User } from "../api/AttendMeBackendClientBase";

const apiClient = new AttendMeBackendClient(
    "https://attendme-backend.runasp.net/"
);

export const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function login(username: string, password: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await apiClient.userLogin(username, password);


            token.value = result.token ?? null;


            user.value = await apiClient.userGet(undefined);

        } catch (err: any) {
            error.value =
                err.response?.data?.message ||
                err.message ||
                "Błąd logowania";

            token.value = null;
            user.value = null;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        apiClient.deviceAuthReset();
    }

    return {
        user,
        token,
        loading,
        error,
        login,
        logout,
    };
});