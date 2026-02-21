<template>
  <div class="login-page">
    <h1>Logowanie</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Login:</label>
        <input id="username" v-model="loginName" type="text" required />
      </div>
      <div>
        <label for="password">Hasło:</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">Zaloguj</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Backend } from "@/api/backend";

export default {
  name: "LoginPage",
  setup() {
    const loginName = ref(""); // użytkownik wpisuje login
    const password = ref("");  // użytkownik wpisuje hasło
    const error = ref("");
    const loading = ref(false);
    const router = useRouter();

    const login = async () => {
      error.value = "";
      loading.value = true;

      try {
        // Wywołanie backendu – query params działają dla nauczyciela i studenta
        const result = await Backend.userLogin(loginName.value, password.value);

        // Rozróżnienie roli: login zaczynający się od "stu" to student
        const role = loginName.value.startsWith("stu") ? "student" : "teacher";

        // Zapis tokenu i roli w localStorage
        localStorage.setItem("jwt_token", result.token);
        localStorage.setItem("user_role", role);

        // Przekierowanie do odpowiedniego dashboardu
        if (role === "teacher") router.push("/teacher");
        else router.push("/student");
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 400) {
          error.value = "Nieprawidłowy login lub hasło";
        } else {
          error.value = "Błąd serwera. Spróbuj później.";
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      loginName,
      password,
      error,
      loading,
      login,
    };
  },
};
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.login-page h1 {
  margin-bottom: 20px;
}

.login-page form div {
  margin-bottom: 15px;
  text-align: left;
}

.login-page input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.login-page button {
  padding: 10px 20px;
}

.error {
  color: red;
  margin-top: 15px;
}
</style>