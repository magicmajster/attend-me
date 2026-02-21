<template>
  <div class="attendance-qr">
    <h2>Zarejestruj obecność</h2>
    <p>Poproś studentów o zeskanowanie kodu QR telefonem.</p>

    <div v-if="loading">Ładowanie QR...</div>
    <div v-else>
      <qrcode-vue :value="ticket?.token || ''" :size="250" />
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import QrcodeVue from "qrcode.vue";
import { Backend } from "@/api/backend";
import type { TokenResult } from "@/api/AttendMeBackendClientBase";

export default defineComponent({
  name: "TeacherAttendanceQR",
  components: { QrcodeVue },
  setup() {
    const ticket = ref<TokenResult | null>(null);
    const loading = ref(true);
    const error = ref("");
    let intervalId: number;

    const fetchTicket = async () => {
      try {
        ticket.value = await Backend.userAttendanceTicketGet();
        loading.value = false;
      } catch (err) {
        console.error(err);
        error.value = "Nie udało się pobrać kodu QR.";
      }
    };

    onMounted(() => {
      fetchTicket();
      intervalId = window.setInterval(fetchTicket, 2000);
    });

    onUnmounted(() => {
      clearInterval(intervalId);
    });

    return { ticket, loading, error };
  }
});
</script>

<style scoped>
.attendance-qr {
  max-width: 400px;
  margin: 30px auto;
  text-align: center;
}

.error {
  color: red;
  margin-top: 15px;
}
</style>